"use client";

import { apiFetch } from "@/lib/api";
import { useState } from "react";

import type {
  Task,
  TaskFilter,
  TaskField,
} from "@/app/tasks/page";

import {
  AddIcon,
  CalendarIcon,
  DeleteIcon,
  EditIcon,
} from "@/components/icons";

type BoardTask = {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
};

type Column = {
  title: string;
  status: BoardTask["status"];
  tasks: BoardTask[];
};

type TaskBoardProps = {
  tasks: Task[];
  filter: TaskFilter;
  visibleFields: Record<TaskField, boolean>;
  onTaskDeleted?: () => void | Promise<void>;
  onTaskEdit?: (task: Task) => void;
  onAddTask?: () => void;
};

function priorityStyle(
  priority: BoardTask["priority"],
) {
  switch (priority) {
    case "HIGH":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";

    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";

    case "LOW":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function priorityLabel(
  priority: BoardTask["priority"],
) {
  switch (priority) {
    case "HIGH":
      return "High";

    case "MEDIUM":
      return "Medium";

    case "LOW":
      return "Low";

    default:
      return priority;
  }
}

function formatDate(date: string) {
  if (!date) {
    return "No due date";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function TaskBoard({
  tasks,
  filter,
  visibleFields,
  onTaskDeleted,
  onTaskEdit,
  onAddTask,
}: TaskBoardProps) {
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /*
   * Convert tasks to board format
   */
  const boardTasks: BoardTask[] =
    tasks.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
    }));

  /*
   * Apply filters
   */
  const filteredTasks =
    boardTasks.filter((task) => {
      let statusMatches = true;

      if (
        filter.status !== null &&
        filter.status !== "All"
      ) {
        const statusMap: Record<
          string,
          BoardTask["status"]
        > = {
          "To Do": "TODO",
          Doing: "IN_PROGRESS",
          Completed: "DONE",
          TODO: "TODO",
          IN_PROGRESS: "IN_PROGRESS",
          DONE: "DONE",
        };

        statusMatches =
          statusMap[filter.status] ===
          task.status;
      }

      const priorityMatches =
        filter.priority === null ||
        filter.priority === "No Priority" ||
        priorityLabel(task.priority) ===
          filter.priority;

      return (
        statusMatches &&
        priorityMatches
      );
    });

  /*
   * Board columns
   */
  const columns: Column[] = [
    {
      title: "To Do",
      status: "TODO",
      tasks: filteredTasks.filter(
        (task) => task.status === "TODO",
      ),
    },
    {
      title: "Doing",
      status: "IN_PROGRESS",
      tasks: filteredTasks.filter(
        (task) =>
          task.status === "IN_PROGRESS",
      ),
    },
    {
      title: "Completed",
      status: "DONE",
      tasks: filteredTasks.filter(
        (task) => task.status === "DONE",
      ),
    },
  ];

  /*
   * Delete task
   */
  async function handleDelete(
    taskId: string,
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(taskId);

      const response = await apiFetch(
        `/tasks/${taskId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
            `Failed to delete task (${response.status})`,
        );
      }

      await onTaskDeleted?.();
    } catch (error) {
      console.error(
        "Delete task error:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete task.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * No tasks
   */
  if (filteredTasks.length === 0) {
    return (
      <div className="rounded-xl border border-base-300 bg-base-100 px-6 py-16 text-center">

        <p className="text-sm font-medium text-base-content">
          No tasks found
        </p>

        <p className="mt-1 text-sm text-base-content/60">
          {tasks.length === 0
            ? "Create your first task."
            : "Try changing your filters."}
        </p>

        {tasks.length === 0 && (
          <button
            type="button"
            onClick={onAddTask}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-base-content px-4 py-2 text-sm font-medium text-base-100 transition hover:opacity-90"
          >
            <AddIcon size={16} />
            Create task
          </button>
        )}

      </div>
    );
  }

  return (
    <div className="grid min-w-[900px] grid-cols-3 gap-4">

      {columns.map((column) => (
        <div
          key={column.status}
          className="flex min-h-[500px] flex-col rounded-xl bg-base-200 p-3"
        >

          {/* =================================================
              COLUMN HEADER
          ================================================= */}

          <div className="mb-3 flex items-center justify-between px-1">

            <div className="flex items-center gap-2">

              <h2 className="text-sm font-semibold text-base-content">
                {column.title}
              </h2>

              <span className="rounded-full bg-base-300 px-2 py-0.5 text-xs text-base-content/60">
                {column.tasks.length}
              </span>

            </div>

            {/* Header Add Button */}

            <button
              type="button"
              onClick={onAddTask}
              className="flex h-7 w-7 items-center justify-center rounded-md text-base-content/40 transition hover:bg-base-300 hover:text-base-content"
              aria-label={`Add task to ${column.title}`}
              title={`Add task to ${column.title}`}
            >
              <AddIcon size={16} />
            </button>

          </div>

          {/* =================================================
              CARDS
          ================================================= */}

          <div className="space-y-3">

            {column.tasks.map((task) => {

              /*
               * Find complete Task object
               */

              const fullTask =
                tasks.find(
                  (item) =>
                    item.id === task.id,
                );

              return (
                <div
                  key={task.id}
                  className="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm transition hover:shadow-md"
                >

                  {/* Title */}

                  <h3 className="text-sm font-medium text-base-content">
                    {task.title}
                  </h3>

                  {/* Priority + Member */}

                  {(visibleFields.priority ||
                    visibleFields.members) && (
                    <div className="mt-4 flex items-center justify-between">

                      {visibleFields.priority ? (
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${priorityStyle(
                            task.priority,
                          )}`}
                        >
                          {priorityLabel(
                            task.priority,
                          )}
                        </span>
                      ) : (
                        <div />
                      )}

                      {visibleFields.members && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-base-300 text-xs font-medium text-base-content/70">
                          P
                        </div>
                      )}

                    </div>
                  )}

                  {/* =================================================
                      DUE DATE
                  ================================================= */}

                  {visibleFields.dueDate && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-base-content/60">

                      <CalendarIcon
                        size={14}
                      />

                      <span>
                        Due{" "}
                        {formatDate(
                          task.dueDate,
                        )}
                      </span>

                    </div>
                  )}

                  {/* =================================================
                      ACTIONS
                  ================================================= */}

                  <div className="mt-4 flex justify-end gap-1 border-t border-base-300 pt-3">

                    {/* Edit */}

                    <button
                      type="button"
                      onClick={() => {
                        if (fullTask) {
                          onTaskEdit?.(
                            fullTask,
                          );
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-base-content/60 transition hover:bg-base-200 hover:text-base-content"
                    >
                      <EditIcon
                        size={14}
                      />

                      <span>
                        Edit
                      </span>
                    </button>

                    {/* Delete */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          task.id,
                        )
                      }
                      disabled={
                        deletingId ===
                        task.id
                      }
                      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-base-content/60 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <DeleteIcon
                        size={14}
                      />

                      <span>
                        {deletingId ===
                        task.id
                          ? "Deleting..."
                          : "Delete"}
                      </span>
                    </button>

                  </div>

                </div>
              );
            })}

          </div>

          {/* =================================================
              ADD TASK
          ================================================= */}

          <button
            type="button"
            onClick={onAddTask}
            className="mt-auto flex items-center gap-2 pt-4 text-left text-sm text-base-content/60 transition hover:text-base-content"
          >
            <AddIcon size={15} />

            <span>
              Add task
            </span>
          </button>

        </div>
      ))}

    </div>
  );
}