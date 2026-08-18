"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { apiFetch } from "@/lib/api";

type ProjectStatus = "TODO" | "IN_PROGRESS" | "DONE";
type ProjectPriority = "HIGH" | "MEDIUM" | "LOW" | "NONE";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

const statusOptions: {
  value: ProjectStatus;
  label: string;
}[] = [
  { value: "TODO", label: "Todo" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
];

const priorityOptions: {
  value: ProjectPriority;
  label: string;
}[] = [
  { value: "NONE", label: "No Priority" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

function formatDate(date: string | null) {
  if (!date) {
    return "No due date";
  }

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateForInput(date: string | null) {
  if (!date) {
    return "";
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().split("T")[0];
}

function getStatusLabel(status: ProjectStatus) {
  switch (status) {
    case "TODO":
      return "Todo";
    case "IN_PROGRESS":
      return "In Progress";
    case "DONE":
      return "Done";
  }
}

function getPriorityLabel(priority: ProjectPriority) {
  switch (priority) {
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
    case "NONE":
      return "No Priority";
  }
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [priorityFilter, setPriorityFilter] =
    useState<ProjectPriority | null>(null);

  const [addProjectOpen, setAddProjectOpen] = useState(false);

  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");

  const [visibleFields, setVisibleFields] = useState({
    status: true,
    priority: true,
    members: true,
    dueDate: true,
    teams: false,
    labels: false,
    reporter: false,
  });

  // Edit state
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] =
    useState<ProjectStatus>("TODO");
  const [editPriority, setEditPriority] =
    useState<ProjectPriority>("NONE");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Delete state
  const [deleteProject, setDeleteProject] =
    useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  /*
   * Load projects
   */
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/projects");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch projects (${response.status})`
        );
      }

      const data: Project[] = await response.json();

      setProjects(data);
    } catch (error) {
      console.error("Load projects error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Initial load
   */
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /*
   * Filter projects
   */
  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);

      const matchesPriority =
        !priorityFilter ||
        project.priority === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [projects, search, priorityFilter]);

  /*
   * Toggle fields
   */
  function toggleField(
    field: keyof typeof visibleFields
  ) {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  /*
   * Create project
   */
  async function handleCreateProject(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedName = newProjectName.trim();

    if (!trimmedName) {
      return;
    }

    try {
      const response = await apiFetch("/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          description:
            newProjectDescription.trim() || undefined,
          status: "TODO",
          priority: "LOW",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create project (${response.status})`
        );
      }

      setNewProjectName("");
      setNewProjectDescription("");
      setAddProjectOpen(false);

      await loadProjects();
    } catch (error) {
      console.error("Create project error:", error);
      alert("Failed to create project.");
    }
  }

  /*
   * Close add modal
   */
  function closeAddProjectModal() {
    setAddProjectOpen(false);
    setNewProjectName("");
    setNewProjectDescription("");
  }

  /*
   * Open edit modal
   */
  function openEditModal(project: Project) {
    setEditProject(project);

    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setEditStatus(project.status);

    setEditPriority(
      project.priority === "NONE"
        ? "LOW"
        : project.priority
    );

    setEditDueDate(
      formatDateForInput(project.dueDate)
    );
  }

  /*
   * Close edit modal
   */
  function closeEditModal() {
    if (editLoading) {
      return;
    }

    setEditProject(null);
  }

  /*
   * Update project
   */
  async function handleUpdateProject(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editProject) {
      return;
    }

    const trimmedName = editName.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setEditLoading(true);

      const response = await apiFetch(
        `/projects/${editProject.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
            description:
              editDescription.trim() || undefined,
            status: editStatus,
            priority: editPriority,
            dueDate: editDueDate || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update project (${response.status})`
        );
      }

      setEditProject(null);

      await loadProjects();
    } catch (error) {
      console.error("Update project error:", error);
      alert("Failed to update project.");
    } finally {
      setEditLoading(false);
    }
  }

  /*
   * Delete project
   */
  async function handleDeleteProject() {
    if (!deleteProject) {
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await apiFetch(
        `/projects/${deleteProject.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete project (${response.status})`
        );
      }

      setDeleteProject(null);

      await loadProjects();
    } catch (error) {
      console.error("Delete project error:", error);
      alert("Failed to delete project.");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full overflow-hidden bg-base-200">
        <Sidebar />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-8">

            {/* ================= HEADER ================= */}
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-base-content">
                Projects
              </h1>

              <div className="flex items-center gap-2">

                {/* Search */}
                <input
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  className="w-48 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-base-content/30"
                />

                {/* Fields */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setFieldsOpen((current) => !current);
                      setFilterOpen(false);
                    }}
                    className="rounded-lg border border-base-300 bg-base-100 px-4 py-2 text-sm font-medium text-base-content/70 hover:bg-base-200"
                  >
                    Fields
                  </button>

                  {fieldsOpen && (
                    <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">
                      {(
                        [
                          ["status", "Status"],
                          ["priority", "Priority"],
                          ["members", "Members"],
                          ["dueDate", "Due Date"],
                          ["teams", "Teams"],
                          ["labels", "Labels"],
                          ["reporter", "Reporter"],
                        ] as const
                      ).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-base-content/80 hover:bg-base-200"
                        >
                          <input
                            type="checkbox"
                            checked={visibleFields[key]}
                            onChange={() =>
                              toggleField(key)
                            }
                            className="checkbox checkbox-sm"
                          />

                          <span>{label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setFilterOpen((current) => !current);
                      setFieldsOpen(false);
                    }}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      priorityFilter
                        ? "border-base-content bg-base-content text-base-100"
                        : "border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
                    }`}
                  >
                    Filter
                  </button>

                  {filterOpen && (
                    <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">
                      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-base-content/40">
                        Priority
                      </p>

                      {(
                        [
                          ["NONE", "No Priority"],
                          ["HIGH", "High"],
                          ["MEDIUM", "Medium"],
                          ["LOW", "Low"],
                        ] as const
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setPriorityFilter(
                              priorityFilter === value
                                ? null
                                : value
                            );

                            setFilterOpen(false);
                          }}
                          className={`flex w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                            priorityFilter === value
                              ? "bg-base-200 font-medium text-base-content"
                              : "text-base-content/70 hover:bg-base-200"
                          }`}
                        >
                          <span className="flex-1">
                            {label}
                          </span>

                          {priorityFilter === value && (
                            <span>✓</span>
                          )}
                        </button>
                      ))}

                      {priorityFilter && (
                        <button
                          type="button"
                          onClick={() => {
                            setPriorityFilter(null);
                            setFilterOpen(false);
                          }}
                          className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-base-content/40 hover:bg-base-200"
                        >
                          Clear filter
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Add Project */}
                <button
                  type="button"
                  onClick={() =>
                    setAddProjectOpen(true)
                  }
                  className="rounded-lg bg-base-content px-4 py-2 text-sm font-medium text-base-100 hover:opacity-80"
                >
                  + Add Project
                </button>
              </div>
            </div>

            {/* ================= CONTENT ================= */}
            {loading ? (
              <div className="rounded-xl border border-base-300 bg-base-100 p-10 text-center text-sm text-base-content/50">
                Loading projects...
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">

                {/* Table Header */}
                <div className="grid grid-cols-12 border-b border-base-300 bg-base-200 px-5 py-3 text-xs font-medium uppercase tracking-wide text-base-content/50">
                  <div className="col-span-4">
                    Project
                  </div>

                  {visibleFields.status && (
                    <div className="col-span-2">
                      Status
                    </div>
                  )}

                  {visibleFields.priority && (
                    <div className="col-span-2">
                      Priority
                    </div>
                  )}

                  {visibleFields.members && (
                    <div className="col-span-1">
                      Members
                    </div>
                  )}

                  {visibleFields.dueDate && (
                    <div className="col-span-2">
                      Due Date
                    </div>
                  )}

                  <div className="col-span-1" />
                </div>

                {/* Project Rows */}
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className="grid grid-cols-12 items-center border-b border-base-300 px-5 py-4 text-sm last:border-0 hover:bg-base-200"
                    >
                      {/* Project */}
                      <div className="col-span-4">
                        <div className="font-medium text-base-content">
                          {project.name}
                        </div>

                        {project.description && (
                          <div className="mt-1 truncate pr-4 text-xs text-base-content/40">
                            {project.description}
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      {visibleFields.status && (
                        <div className="col-span-2">
                          <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium text-base-content/70">
                            {getStatusLabel(
                              project.status
                            )}
                          </span>
                        </div>
                      )}

                      {/* Priority */}
                      {visibleFields.priority && (
                        <div className="col-span-2 text-base-content/70">
                          {getPriorityLabel(
                            project.priority
                          )}
                        </div>
                      )}

                      {/* Members */}
                      {visibleFields.members && (
                        <div className="col-span-1 text-base-content/60">
                          -
                        </div>
                      )}

                      {/* Due Date */}
                      {visibleFields.dueDate && (
                        <div className="col-span-2 text-base-content/60">
                          {formatDate(project.dueDate)}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="col-span-1 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(project)
                            }
                            className="rounded-md px-2 py-1 text-xs text-base-content/50 hover:bg-base-200 hover:text-base-content"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteProject(project)
                            }
                            className="rounded-md px-2 py-1 text-xs text-error hover:bg-error/10 hover:text-error"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-5 py-12 text-center text-sm text-base-content/40">
                    No projects found.
                  </div>
                )}

                {/* Add Project */}
                <button
                  type="button"
                  onClick={() =>
                    setAddProjectOpen(true)
                  }
                  className="w-full px-5 py-4 text-left text-sm font-medium text-base-content/50 hover:bg-base-200"
                >
                  + Add Project
                </button>
              </div>
            )}
          </div>
        </main>

        {/* =====================================================
            ADD PROJECT MODAL
        ===================================================== */}
        {addProjectOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeAddProjectModal();
              }
            }}
          >
            <div className="w-full max-w-md rounded-xl border border-base-300 bg-base-100 p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-base-content">
                    Add Project
                  </h2>

                  <p className="mt-1 text-sm text-base-content/50">
                    Create a new project.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeAddProjectModal}
                  className="rounded-md px-2 py-1 text-xl text-base-content/40 hover:bg-base-200 hover:text-base-content"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleCreateProject}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="project-name"
                    className="mb-1.5 block text-sm font-medium text-base-content/80"
                  >
                    Project Name
                  </label>

                  <input
                    id="project-name"
                    type="text"
                    value={newProjectName}
                    onChange={(event) =>
                      setNewProjectName(
                        event.target.value
                      )
                    }
                    placeholder="Enter project name"
                    autoFocus
                    className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-base-content/30"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="project-description"
                    className="mb-1.5 block text-sm font-medium text-base-content/80"
                  >
                    Description
                  </label>

                  <textarea
                    id="project-description"
                    value={newProjectDescription}
                    onChange={(event) =>
                      setNewProjectDescription(
                        event.target.value
                      )
                    }
                    placeholder="Enter project description"
                    rows={4}
                    className="w-full resize-none rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-base-content/30"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeAddProjectModal}
                    className="rounded-lg border border-base-300 px-4 py-2 text-sm font-medium text-base-content/70 hover:bg-base-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!newProjectName.trim()}
                    className="rounded-lg bg-base-content px-4 py-2 text-sm font-medium text-base-100 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            EDIT PROJECT MODAL
        ===================================================== */}
        {editProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget
              ) {
                closeEditModal();
              }
            }}
          >
            <div className="w-full max-w-md rounded-xl border border-base-300 bg-base-100 p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-base-content">
                    Edit Project
                  </h2>

                  <p className="mt-1 text-sm text-base-content/50">
                    Update project details.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editLoading}
                  className="rounded-md px-2 py-1 text-xl text-base-content/40 hover:bg-base-200 hover:text-base-content disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleUpdateProject}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label
                    htmlFor="edit-project-name"
                    className="mb-1.5 block text-sm font-medium text-base-content/80"
                  >
                    Project Name
                  </label>

                  <input
                    id="edit-project-name"
                    type="text"
                    value={editName}
                    onChange={(event) =>
                      setEditName(event.target.value)
                    }
                    className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none focus:border-base-content/30"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="edit-project-description"
                    className="mb-1.5 block text-sm font-medium text-base-content/80"
                  >
                    Description
                  </label>

                  <textarea
                    id="edit-project-description"
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(
                        event.target.value
                      )
                    }
                    rows={3}
                    className="w-full resize-none rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none focus:border-base-content/30"
                  />
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="edit-project-status"
                    className="mb-1.5 block text-sm font-medium text-base-content/80"
                  >
                    Status
                  </label>

                  <select
                    id="edit-project-status"
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(
                        event.target
                          .value as ProjectStatus
                      )
                    }
                    className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none focus:border-base-content/30"
                  >
                    {statusOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label
                    htmlFor="edit-project-priority"
                    className="mb-1.5 block text-sm font-medium text-base-content/80"
                  >
                    Priority
                  </label>

                  <select
                    id="edit-project-priority"
                    value={editPriority}
                    onChange={(event) =>
                      setEditPriority(
                        event.target
                          .value as ProjectPriority
                      )
                    }
                    className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none focus:border-base-content/30"
                  >
                    {priorityOptions
                      .filter(
                        (option) =>
                          option.value !== "NONE"
                      )
                      .map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label
                    htmlFor="edit-project-due-date"
                    className="mb-1.5 block text-sm font-medium text-base-content/80"
                  >
                    Due Date
                  </label>

                  <input
                    id="edit-project-due-date"
                    type="date"
                    value={editDueDate}
                    onChange={(event) =>
                      setEditDueDate(
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none focus:border-base-content/30"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    disabled={editLoading}
                    className="rounded-lg border border-base-300 px-4 py-2 text-sm font-medium text-base-content/70 hover:bg-base-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      editLoading ||
                      !editName.trim()
                    }
                    className="rounded-lg bg-base-content px-4 py-2 text-sm font-medium text-base-100 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {editLoading
                      ? "Saving..."
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =====================================================
            DELETE CONFIRMATION
        ===================================================== */}
        {deleteProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !deleteLoading
              ) {
                setDeleteProject(null);
              }
            }}
          >
            <div className="w-full max-w-sm rounded-xl border border-base-300 bg-base-100 p-6 shadow-xl">

              <h2 className="text-lg font-semibold text-base-content">
                Delete Project?
              </h2>

              <p className="mt-2 text-sm leading-6 text-base-content/60">
                Are you sure you want to delete{" "}
                <span className="font-medium text-base-content">
                  {deleteProject.name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={() =>
                    setDeleteProject(null)
                  }
                  className="rounded-lg border border-base-300 px-4 py-2 text-sm font-medium text-base-content/70 hover:bg-base-200 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteProject}
                  className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-error-content hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteLoading
                    ? "Deleting..."
                    : "Delete Project"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}