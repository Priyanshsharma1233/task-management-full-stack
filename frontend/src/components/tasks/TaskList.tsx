"use client";

import { apiFetch } from "@/lib/api";
import { useState } from "react";

import type { Task, TaskFilter, TaskField } from "@/app/tasks/page";

import {
  CalendarIcon,
  DeleteIcon,
  EditIcon,
} from "@/components/icons";

type TaskListProps = {
  tasks: Task[];
  visibleFields: Record<TaskField, boolean>;
  filter: TaskFilter;
  onTaskDeleted?: () => void | Promise<void>;
  onTaskEdit?: (task: Task) => void;
};

type TaskGroup = {
  status: string;
  tasks: Task[];
};

function priorityLabel(priority: Task["priority"]) {
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

function priorityStyle(priority: Task["priority"]) {
  switch (priority) {
    case "HIGH":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300";

    case "MEDIUM":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";

    case "LOW":
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";

    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  }
}

function formatDueDate(date: string) {
  if (!date) {
    return "-";
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

export default function TaskList({
  tasks,
  visibleFields,
  filter,
  onTaskDeleted,
  onTaskEdit,
}: TaskListProps) {
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  /*
   * Table columns
   */
  const columns = [
    "minmax(250px, 1fr)",
    visibleFields.priority ? "120px" : "",
    visibleFields.members ? "150px" : "",
    visibleFields.dueDate ? "120px" : "",
    "130px",
  ]
    .filter(Boolean)
    .join(" ");

  /*
   * Group tasks
   */
  const taskGroups: TaskGroup[] = [
    {
      status: "To Do",
      tasks: tasks.filter(
        (task) => task.status === "TODO",
      ),
    },
    {
      status: "Doing",
      tasks: tasks.filter(
        (task) => task.status === "IN_PROGRESS",
      ),
    },
    {
      status: "Completed",
      tasks: tasks.filter(
        (task) => task.status === "DONE",
      ),
    },
  ];

  /*
   * Apply filters
   */
  const filteredGroups = taskGroups
    .map((group) => {
      const filteredTasks =
        group.tasks.filter((task) => {
          const statusMatches =
            filter.status === null ||
            filter.status === "All" ||
            group.status === filter.status;

          const priorityMatches =
            filter.priority === null ||
            filter.priority === "No Priority" ||
            priorityLabel(task.priority) ===
              filter.priority;

          return (
            statusMatches && priorityMatches
          );
        });

      return {
        ...group,
        tasks: filteredTasks,
      };
    })
    .filter(
      (group) => group.tasks.length > 0,
    );

  /*
   * Delete task
   */
  async function handleDelete(taskId: string) {
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

  return (
    <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100">

      {/* Header */}

      <div
        style={{
          gridTemplateColumns: columns,
        }}
        className="grid border-b border-base-300 bg-base-200 px-4 py-3 text-xs font-medium text-base-content/60"
      >
        <div>Task</div>

        {visibleFields.priority && (
          <div>Priority</div>
        )}

        {visibleFields.members && (
          <div>Members</div>
        )}

        {visibleFields.dueDate && (
          <div>Due Date</div>
        )}

        <div className="text-right">
          Actions
        </div>
      </div>

      {/* Empty state */}

      {filteredGroups.length === 0 && (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-base-content">
            No tasks found
          </p>

          <p className="mt-1 text-sm text-base-content/60">
            {tasks.length === 0
              ? "Create your first task."
              : "Try changing your filters."}
          </p>
        </div>
      )}

      {/* Groups */}

      {filteredGroups.map((group) => (
        <div key={group.status}>

          {/* Status */}

          <div className="border-b border-base-300 bg-base-200/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-base-content">
                {group.status}
              </span>

              <span className="rounded-full bg-base-300 px-2 py-0.5 text-xs text-base-content/70">
                {group.tasks.length}
              </span>
            </div>
          </div>

          {/* Tasks */}

          {group.tasks.map((task) => (
            <div
              key={task.id}
              style={{
                gridTemplateColumns: columns,
              }}
              className="grid items-center border-b border-base-300 px-4 py-3 text-sm hover:bg-base-200"
            >

              {/* Task */}

              <div className="flex min-w-0 items-center gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm shrink-0"
                />

                <span className="truncate font-medium text-base-content">
                  {task.title}
                </span>
              </div>

              {/* Priority */}

              {visibleFields.priority && (
                <div>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${priorityStyle(
                      task.priority,
                    )}`}
                  >
                    {priorityLabel(
                      task.priority,
                    )}
                  </span>
                </div>
              )}

              {/* Member */}

              {visibleFields.members && (
                <div className="flex items-center gap-2 text-base-content/70">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-base-300 text-xs font-medium text-base-content">
                    P
                  </div>

                  You
                </div>
              )}

              {/* Due Date */}

              {visibleFields.dueDate && (
                <div className="flex items-center gap-2 text-base-content/70">
                  <CalendarIcon
                    size={15}
                  />

                  <span>
                    {formatDueDate(
                      task.dueDate,
                    )}
                  </span>
                </div>
              )}

              {/* Actions */}

              <div className="flex items-center justify-end gap-1">

                {/* Edit */}

                <button
                  type="button"
                  onClick={() => {
                    onTaskEdit?.(task);
                  }}
                  title="Edit task"
                  aria-label="Edit task"
                  className="rounded-md p-2 text-base-content/60 transition hover:bg-base-300 hover:text-base-content"
                >
                  <EditIcon size={16} />
                </button>

                {/* Delete */}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(task.id)
                  }
                  disabled={
                    deletingId === task.id
                  }
                  title="Delete task"
                  aria-label="Delete task"
                  className="rounded-md p-2 text-base-content/60 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                >
                  <DeleteIcon size={16} />
                </button>

              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}