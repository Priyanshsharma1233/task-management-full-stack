"use client";

import { FormEvent, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

import {
  CalendarIcon,
  CloseIcon,
  EditIcon,
} from "@/components/icons";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};

type EditTaskModalProps = {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onTaskUpdated?: () => void | Promise<void>;
};

export default function EditTaskModal({
  open,
  task,
  onClose,
  onTaskUpdated,
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");

  const [status, setStatus] =
    useState<
      "TODO" | "IN_PROGRESS" | "DONE"
    >("TODO");

  const [dueDate, setDueDate] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * Populate form whenever selected task changes.
   */
  useEffect(() => {
    if (!task) {
      return;
    }

    setTitle(task.title);
    setDescription(task.description ?? "");
    setPriority(task.priority);
    setStatus(task.status);

    if (task.dueDate) {
      const date = new Date(task.dueDate);

      if (!Number.isNaN(date.getTime())) {
        setDueDate(
          date.toISOString().split("T")[0],
        );
      } else {
        setDueDate("");
      }
    } else {
      setDueDate("");
    }

    setError("");
  }, [task]);

  /*
   * Update task
   */
  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    if (!task) {
      return;
    }

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const taskData = {
        title: title.trim(),
        description: description.trim(),
        priority,
        status,
        dueDate,
      };

      const response = await apiFetch(
        `/tasks/${task.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(taskData),
        },
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        throw new Error(
          errorData?.message ||
            `Failed to update task (${response.status})`,
        );
      }

      await response.json();

      await onTaskUpdated?.();

      onClose();
    } catch (error) {
      console.error(
        "Update task error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">

      {/* =====================================================
          MODAL
      ===================================================== */}

      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex items-center justify-between border-b border-base-300 px-6 py-4">

          <div>
            <h2 className="text-lg font-semibold text-base-content">
              Edit task
            </h2>

            <p className="mt-1 text-sm text-base-content/60">
              Update your task details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            title="Close"
            className="flex h-8 w-8 items-center justify-center rounded-md text-base-content/50 transition hover:bg-base-200 hover:text-base-content disabled:opacity-50"
          >
            <CloseIcon size={18} />
          </button>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* =================================================
              TITLE
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-base-content">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              disabled={loading}
              autoFocus
              className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none transition placeholder:text-base-content/40 focus:border-base-content/40 focus:ring-1 focus:ring-base-content/20 disabled:opacity-60"
            />

          </div>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-base-content">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value,
                )
              }
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none transition placeholder:text-base-content/40 focus:border-base-content/40 focus:ring-1 focus:ring-base-content/20 disabled:opacity-60"
            />

          </div>

          {/* =================================================
              PRIORITY + STATUS
          ================================================= */}

          <div className="grid grid-cols-2 gap-4">

            {/* Priority */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-base-content">
                Priority
              </label>

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value as
                      | "HIGH"
                      | "MEDIUM"
                      | "LOW",
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none focus:border-base-content/40 focus:ring-1 focus:ring-base-content/20 disabled:opacity-60"
              >
                <option value="HIGH">
                  High
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="LOW">
                  Low
                </option>
              </select>

            </div>

            {/* Status */}

            <div>

              <label className="mb-1.5 block text-sm font-medium text-base-content">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "TODO"
                      | "IN_PROGRESS"
                      | "DONE",
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2.5 text-sm text-base-content outline-none focus:border-base-content/40 focus:ring-1 focus:ring-base-content/20 disabled:opacity-60"
              >
                <option value="TODO">
                  To Do
                </option>

                <option value="IN_PROGRESS">
                  Doing
                </option>

                <option value="DONE">
                  Completed
                </option>
              </select>

            </div>

          </div>

          {/* =================================================
              DUE DATE
          ================================================= */}

          <div>

            <label className="mb-1.5 block text-sm font-medium text-base-content">
              Due date
            </label>

            <div className="relative">

              <CalendarIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"
              />

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(
                    e.target.value,
                  )
                }
                disabled={loading}
                className="w-full rounded-lg border border-base-300 bg-base-100 py-2.5 pl-9 pr-3 text-sm text-base-content outline-none focus:border-base-content/40 focus:ring-1 focus:ring-base-content/20 disabled:opacity-60"
              />

            </div>

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="flex justify-end gap-3 border-t border-base-300 pt-5">

            {/* Cancel */}

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-base-300 px-4 py-2 text-sm font-medium text-base-content/70 transition hover:bg-base-200 hover:text-base-content disabled:opacity-50"
            >
              Cancel
            </button>

            {/* Update */}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-base-content px-4 py-2 text-sm font-medium text-base-100 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {!loading && (
                <EditIcon size={16} />
              )}

              {loading
                ? "Updating..."
                : "Update task"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}