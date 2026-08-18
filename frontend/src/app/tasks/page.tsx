"use client";

import { useCallback, useEffect, useState } from "react";

import Sidebar from "@/components/layout/Sidebar";
import TaskHeader from "@/components/tasks/TaskHeader";
import TaskList from "@/components/tasks/TaskList";
import TaskBoard from "@/components/tasks/TaskBoard";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export type TaskView = "list" | "board";

export type TaskField =
  | "priority"
  | "members"
  | "dueDate"
  | "labels"
  | "status"
  | "reporter";

export type TaskFilter = {
  status: string | null;
  priority: string | null;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

export default function TasksPage() {
  const [view, setView] = useState<TaskView>("list");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Search
  const [search, setSearch] = useState("");

  const [visibleFields, setVisibleFields] = useState<
    Record<TaskField, boolean>
  >({
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  });

  const [filter, setFilter] = useState<TaskFilter>({
    status: null,
    priority: null,
  });

  /*
   * Load tasks
   */
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiFetch("/tasks");

      if (!response.ok) {
        throw new Error(`Failed to fetch tasks (${response.status})`);
      }

      const data: Task[] = await response.json();

      setTasks(data);
    } catch (error) {
      console.error("Load tasks error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Initial load
   */
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /*
   * Search tasks
   */
  const filteredTasks = tasks.filter((task) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      task.title.toLowerCase().includes(query) ||
      task.description?.toLowerCase().includes(query)
    );
  });

  /*
   * Toggle visible fields
   */
  function toggleField(field: TaskField) {
    setVisibleFields((current) => ({
      ...current,
      [field]: !current[field],
    }));
  }

  /*
   * Filter change
   */
  function handleFilterChange(newFilter: TaskFilter) {
    setFilter(newFilter);
  }

  /*
   * Task created
   */
  async function handleTaskCreated() {
    setCreateTaskOpen(false);

    await loadTasks();
  }

  /*
   * Task deleted
   */
  async function handleTaskDeleted() {
    await loadTasks();
  }

  /*
   * Open edit modal
   */
  function handleEditTask(task: Task) {
    console.log("EDIT CLICKED:", task);

    setSelectedTask(task);
    setEditTaskOpen(true);
  }

  /*
   * Task updated
   */
  async function handleTaskUpdated() {
    setEditTaskOpen(false);
    setSelectedTask(null);

    await loadTasks();
  }

  /*
   * Close edit modal
   */
  function handleCloseEdit() {
    setEditTaskOpen(false);
    setSelectedTask(null);
  }

  return (
     <ProtectedRoute>
  <div className="flex h-screen w-full overflow-hidden bg-base-100">
    <Sidebar />

    <main className="min-w-0 flex-1 overflow-y-auto">
      <div className="w-full p-8">

        <TaskHeader
          view={view}
          onViewChange={setView}
          visibleFields={visibleFields}
          onFieldChange={toggleField}
          filter={filter}
          onFilterChange={handleFilterChange}
          onAddTask={() => setCreateTaskOpen(true)}
          search={search}
          onSearchChange={setSearch}
        />

        {loading ? (
          <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center text-base-content/60">
            Loading tasks...
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-xl border border-base-300 bg-base-100 p-8 text-center text-base-content/60">
            {search.trim()
              ? `No tasks found for "${search}"`
              : "No tasks found."}
          </div>
        ) : view === "list" ? (
          <TaskList
            tasks={filteredTasks}
            visibleFields={visibleFields}
            filter={filter}
            onTaskDeleted={handleTaskDeleted}
            onTaskEdit={handleEditTask}
          />
        ) : (
          <TaskBoard
            tasks={filteredTasks}
            filter={filter}
            visibleFields={visibleFields}
            onTaskDeleted={handleTaskDeleted}
            onTaskEdit={handleEditTask}
            onAddTask={() => setCreateTaskOpen(true)}
          />
        )}

        {/* Create Task Modal */}
        <CreateTaskModal
          open={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          onTaskCreated={handleTaskCreated}
        />

        {/* Edit Task Modal */}
        <EditTaskModal
          open={editTaskOpen}
          task={selectedTask}
          onClose={handleCloseEdit}
          onTaskUpdated={handleTaskUpdated}
        />
      </div>
    </main>
  </div>
  </ProtectedRoute>
);
}