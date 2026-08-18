"use client";

import { useState } from "react";

import type {
  TaskField,
  TaskFilter,
  TaskView,
} from "@/app/tasks/page";

import {
  AddIcon,
  BoardIcon,
  CheckIcon,
  CloseIcon,
  FieldsIcon,
  FilterIcon,
  ListIcon,
  SearchIcon,
} from "@/components/icons";

type TaskHeaderProps = {
  view: TaskView;
  onViewChange: (view: TaskView) => void;

  visibleFields: Record<TaskField, boolean>;
  onFieldChange: (field: TaskField) => void;

  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;

  onAddTask: () => void;

  // Search
  search: string;
  onSearchChange: (value: string) => void;
};

const fields: {
  key: TaskField;
  label: string;
}[] = [
  { key: "priority", label: "Priority" },
  { key: "members", label: "Members" },
  { key: "dueDate", label: "Due Date" },
  { key: "labels", label: "Labels" },
  { key: "status", label: "Status" },
  { key: "reporter", label: "Reporter" },
];

const statuses = [
  "To Do",
  "Doing",
  "Completed",
];

const priorities = [
  "No Priority",
  "High",
  "Medium",
  "Low",
];

export default function TaskHeader({
  view,
  onViewChange,
  visibleFields,
  onFieldChange,
  filter,
  onFilterChange,
  onAddTask,
  search,
  onSearchChange,
}: TaskHeaderProps) {
  const [showFields, setShowFields] =
    useState(false);

  const [showFilter, setShowFilter] =
    useState(false);

  function selectStatus(status: string) {
    onFilterChange({
      ...filter,
      status:
        filter.status === status
          ? null
          : status,
    });
  }

  function selectPriority(
    priority: string,
  ) {
    onFilterChange({
      ...filter,
      priority:
        filter.priority === priority
          ? null
          : priority,
    });
  }

  function clearFilters() {
    onFilterChange({
      status: null,
      priority: null,
    });
  }

  const filterActive =
    filter.status !== null ||
    filter.priority !== null;

  return (
    <div className="mb-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-base-content">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-base-content/60">
            Manage and track your tasks.
          </p>
        </div>

        {/* Add Task */}

        <button
          type="button"
          onClick={onAddTask}
          className="flex items-center gap-2 rounded-lg bg-base-content px-4 py-2 text-sm font-medium text-base-100 transition hover:opacity-90"
        >
          <AddIcon size={17} />

          <span>
            Add Task
          </span>
        </button>

      </div>

      {/* =====================================================
          TOOLBAR
      ===================================================== */}

      <div className="mt-6 flex items-center justify-between border-b border-base-300 pb-3">

        {/* ===================================================
            VIEW SWITCH
        =================================================== */}

        <div className="flex items-center rounded-lg border border-base-300 bg-base-100 p-1">

          {/* List */}

          <button
            type="button"
            onClick={() =>
              onViewChange("list")
            }
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "list"
                ? "bg-base-200 text-base-content"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <ListIcon size={16} />

            <span>
              List
            </span>
          </button>

          {/* Board */}

          <button
            type="button"
            onClick={() =>
              onViewChange("board")
            }
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              view === "board"
                ? "bg-base-200 text-base-content"
                : "text-base-content/60 hover:text-base-content"
            }`}
          >
            <BoardIcon size={16} />

            <span>
              Board
            </span>
          </button>

        </div>

        {/* ===================================================
            RIGHT CONTROLS
        =================================================== */}

        <div className="flex items-center gap-2">

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="relative">

            <SearchIcon
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                onSearchChange(
                  event.target.value,
                )
              }
              placeholder="Search"
              className="w-48 rounded-lg border border-base-300 bg-base-100 py-2 pl-9 pr-8 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:border-base-content/40 focus:ring-1 focus:ring-base-content/20"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  onSearchChange("")
                }
                className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-base-content/40 hover:bg-base-200 hover:text-base-content"
                aria-label="Clear search"
                title="Clear search"
              >
                <CloseIcon size={14} />
              </button>
            )}

          </div>

          {/* =================================================
              FILTER
          ================================================= */}

          <div className="relative">

            <button
              type="button"
              onClick={() => {
                setShowFilter(
                  !showFilter,
                );

                setShowFields(false);
              }}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                filterActive
                  ? "border-base-content bg-base-content text-base-100"
                  : "border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
              }`}
            >
              <FilterIcon size={16} />

              <span>
                Filter
              </span>

              {filterActive && (
                <span className="rounded-full bg-base-100 px-1.5 text-xs text-base-content">
                  {(filter.status
                    ? 1
                    : 0) +
                    (filter.priority
                      ? 1
                      : 0)}
                </span>
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">

                <div className="mb-3 flex items-center justify-between">

                  <span className="text-sm font-semibold text-base-content">
                    Filter tasks
                  </span>

                  {filterActive && (
                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                    >
                      <CloseIcon size={13} />
                      Clear
                    </button>
                  )}

                </div>

                {/* STATUS */}

                <div className="mb-4">

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/40">
                    Status
                  </p>

                  <div className="space-y-1">

                    {statuses.map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            selectStatus(
                              status,
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                            filter.status ===
                            status
                              ? "bg-base-200 font-medium text-base-content"
                              : "text-base-content/70 hover:bg-base-200"
                          }`}
                        >
                          <span>
                            {status}
                          </span>

                          {filter.status ===
                            status && (
                            <CheckIcon
                              size={16}
                            />
                          )}
                        </button>
                      ),
                    )}

                  </div>
                </div>

                {/* PRIORITY */}

                <div>

                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/40">
                    Priority
                  </p>

                  <div className="space-y-1">

                    {priorities.map(
                      (priority) => (
                        <button
                          key={priority}
                          type="button"
                          onClick={() =>
                            selectPriority(
                              priority,
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition ${
                            filter.priority ===
                            priority
                              ? "bg-base-200 font-medium text-base-content"
                              : "text-base-content/70 hover:bg-base-200"
                          }`}
                        >
                          <span>
                            {priority}
                          </span>

                          {filter.priority ===
                            priority && (
                            <CheckIcon
                              size={16}
                            />
                          )}
                        </button>
                      ),
                    )}

                  </div>
                </div>

              </div>
            )}

          </div>

          {/* =================================================
              FIELDS
          ================================================= */}

          <div className="relative">

            <button
              type="button"
              onClick={() => {
                setShowFields(
                  !showFields,
                );

                setShowFilter(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content/70 transition hover:bg-base-200"
            >
              <FieldsIcon size={16} />

              <span>
                Fields
              </span>
            </button>

            {showFields && (
              <div className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xl">

                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-base-content/40">
                  Show fields
                </p>

                {fields.map(
                  (field) => (
                    <label
                      key={field.key}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-base-content/70 hover:bg-base-200"
                    >
                      <input
                        type="checkbox"
                        checked={
                          visibleFields[
                            field.key
                          ]
                        }
                        onChange={() =>
                          onFieldChange(
                            field.key,
                          )
                        }
                        className="h-4 w-4 rounded border-base-300"
                      />

                      {field.label}
                    </label>
                  ),
                )}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}