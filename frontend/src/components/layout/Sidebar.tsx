"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  useTheme,
  type AccentColor,
} from "@/components/theme/ThemeProvider";

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CircleIcon,
  LogoutIcon,
  MoonIcon,
  PaletteIcon,
  ProjectsIcon,
  SettingsIcon,
  SunIcon,
  TasksIcon,
} from "@/components/icons";

type User = {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
};

export default function Sidebar() {
  const pathname = usePathname();

  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
  } = useTheme();

  const [user, setUser] =
    useState<User | null>(null);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [themeOpen, setThemeOpen] =
    useState(false);

  const [colorModeOpen, setColorModeOpen] =
    useState(false);

  const profileRef =
    useRef<HTMLDivElement>(null);

  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const navigation = [
    {
      name: "Tasks",
      href: "/tasks",
      icon: TasksIcon,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: ProjectsIcon,
    },
  ];

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  function handleLogout() {
    localStorage.removeItem("access_token");

    window.location.href = "/login";
  }

  /*
   * =========================================================
   * LOAD CURRENT USER
   * =========================================================
   */

  useEffect(() => {
    async function loadUser() {
      try {
        const response =
          await apiFetch("/auth/me");

        if (!response.ok) {
          throw new Error(
            `Failed to fetch user (${response.status})`,
          );
        }

        const data: User =
          await response.json();

        setUser(data);
      } catch (error) {
        console.error(
          "Load user error:",
          error,
        );
      }
    }

    loadUser();
  }, []);

  /*
   * =========================================================
   * CLOSE DROPDOWN WHEN CLICKING OUTSIDE
   * =========================================================
   */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setProfileOpen(false);
        setThemeOpen(false);
        setColorModeOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  /*
   * =========================================================
   * USER DISPLAY VALUES
   * =========================================================
   */

  const email = user?.email ?? "";

  const name =
    user?.name || "User";

  const avatarLetter = email
    ? email.charAt(0).toUpperCase()
    : "U";

  /*
   * =========================================================
   * COLOR MODE LABEL
   * =========================================================
   */

  const colorModeLabel =
    accentColor === "default"
      ? "Default"
      : accentColor.charAt(0).toUpperCase() +
        accentColor.slice(1);

  /*
   * =========================================================
   * COLOR MODE CHANGE
   * =========================================================
   */

  function handleColorModeChange(
    color: AccentColor,
  ) {
    setAccentColor(color);
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-base-300 bg-base-100">

      {/* =====================================================
          PROFILE
      ===================================================== */}

      <div
        ref={profileRef}
        className="relative border-b border-base-300 p-4"
      >

        {/* Profile Trigger */}

        <button
          type="button"
          onClick={() => {
            setProfileOpen(
              (current) => !current,
            );

            setThemeOpen(false);
            setColorModeOpen(false);
          }}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-base-200"
        >

          {/* Avatar */}

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-content text-sm font-semibold text-base-100">
            {avatarLetter}
          </div>

          {/* User */}

          <div className="min-w-0 flex-1">

            <p className="truncate text-sm font-semibold text-base-content">
              {user
                ? name
                : "Loading..."}
            </p>

            <p className="truncate text-xs text-base-content/60">
              {user ? email : ""}
            </p>

          </div>

          {/* Chevron */}

          <ChevronDownIcon
            size={16}
            className={`shrink-0 text-base-content/50 transition-transform ${
              profileOpen
                ? "rotate-180"
                : ""
            }`}
          />

        </button>

        {/* =================================================
            PROFILE DROPDOWN
        ================================================= */}

        {profileOpen && (
          <div className="absolute left-4 top-[76px] z-50 w-72 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">

            {/* User Information */}

            <div className="border-b border-base-300 px-3 py-4">

              <div className="flex items-center gap-3">

                {/* Avatar */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-base-content text-lg font-semibold text-base-100">
                  {avatarLetter}
                </div>

                {/* User */}

                <div className="min-w-0">

                  <p className="truncate text-sm font-semibold text-base-content">
                    {name}
                  </p>

                  <p className="truncate text-xs text-base-content/60">
                    {email}
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                MENU
            ================================================= */}

            <div className="mt-2">

              {/* =================================================
                  CHANGE THEME
              ================================================= */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() => {
                    setThemeOpen(
                      (current) => !current,
                    );

                    setColorModeOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-base-content transition hover:bg-base-200"
                >

                  {/* Icon */}

                  <span className="flex w-5 justify-center">
                    {theme === "dark" ? (
                      <MoonIcon size={18} />
                    ) : (
                      <SunIcon size={18} />
                    )}
                  </span>

                  {/* Label */}

                  <span className="flex-1 text-left">
                    Change Theme
                  </span>

                  {/* Current Theme */}

                  <span className="text-xs text-base-content/50">
                    {theme === "dark"
                      ? "Dark"
                      : "Light"}
                  </span>

                  {/* Arrow */}

                  <ChevronRightIcon
                    size={16}
                    className={`text-base-content/50 transition-transform ${
                      themeOpen
                        ? "rotate-90"
                        : ""
                    }`}
                  />

                </button>

                {/* =================================================
                    THEME SUBMENU
                ================================================= */}

                {themeOpen && (
                  <div className="absolute left-full top-0 ml-2 w-48 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">

                    <p className="px-3 py-2 text-xs font-semibold text-base-content/60">
                      Theme
                    </p>

                    {/* Light */}

                    <button
                      type="button"
                      onClick={() =>
                        setTheme("light")
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        theme === "light"
                          ? "bg-base-200 text-base-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >

                      <SunIcon size={17} />

                      <span className="flex-1 text-left">
                        Light
                      </span>

                      {theme ===
                        "light" && (
                        <CheckIcon size={16} />
                      )}

                    </button>

                    {/* Dark */}

                    <button
                      type="button"
                      onClick={() =>
                        setTheme("dark")
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        theme === "dark"
                          ? "bg-base-200 text-base-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >

                      <MoonIcon size={17} />

                      <span className="flex-1 text-left">
                        Dark
                      </span>

                      {theme ===
                        "dark" && (
                        <CheckIcon size={16} />
                      )}

                    </button>

                  </div>
                )}

              </div>

              {/* =================================================
                  COLOR MODE
              ================================================= */}

              <div className="relative">

                <button
                  type="button"
                  onClick={() => {
                    setColorModeOpen(
                      (current) => !current,
                    );

                    setThemeOpen(false);
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-base-content transition hover:bg-base-200"
                >

                  {/* Icon */}

                  <span className="flex w-5 justify-center">
                    <PaletteIcon size={18} />
                  </span>

                  {/* Label */}

                  <span className="flex-1 text-left">
                    Color Mode
                  </span>

                  {/* Current Color */}

                  <span className="text-xs text-base-content/50">
                    {colorModeLabel}
                  </span>

                  {/* Arrow */}

                  <ChevronRightIcon
                    size={16}
                    className={`text-base-content/50 transition-transform ${
                      colorModeOpen
                        ? "rotate-90"
                        : ""
                    }`}
                  />

                </button>

                {/* =================================================
                    COLOR MODE SUBMENU
                ================================================= */}

                {colorModeOpen && (
                  <div className="absolute left-full top-0 ml-2 w-52 rounded-xl border border-base-300 bg-base-100 p-2 shadow-lg">

                    <p className="px-3 py-2 text-xs font-semibold text-base-content/60">
                      Color Mode
                    </p>

                    {/* DEFAULT */}

                    <button
                      type="button"
                      onClick={() =>
                        handleColorModeChange(
                          "default",
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        accentColor ===
                        "default"
                          ? "bg-base-200 text-base-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >

                      <CircleIcon
                        size={16}
                        className="fill-current"
                      />

                      <span className="flex-1 text-left">
                        Default
                      </span>

                      {accentColor ===
                        "default" && (
                        <CheckIcon size={16} />
                      )}

                    </button>

                    {/* BLUE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleColorModeChange(
                          "blue",
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        accentColor ===
                        "blue"
                          ? "bg-base-200 text-base-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >

                      <CircleIcon
                        size={16}
                        className="fill-current text-blue-500"
                      />

                      <span className="flex-1 text-left">
                        Blue
                      </span>

                      {accentColor ===
                        "blue" && (
                        <CheckIcon size={16} />
                      )}

                    </button>

                    {/* PURPLE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleColorModeChange(
                          "purple",
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        accentColor ===
                        "purple"
                          ? "bg-base-200 text-base-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >

                      <CircleIcon
                        size={16}
                        className="fill-current text-purple-500"
                      />

                      <span className="flex-1 text-left">
                        Purple
                      </span>

                      {accentColor ===
                        "purple" && (
                        <CheckIcon size={16} />
                      )}

                    </button>

                    {/* RED */}

                    <button
                      type="button"
                      onClick={() =>
                        handleColorModeChange(
                          "red",
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        accentColor ===
                        "red"
                          ? "bg-base-200 text-base-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >

                      <CircleIcon
                        size={16}
                        className="fill-current text-red-500"
                      />

                      <span className="flex-1 text-left">
                        Red
                      </span>

                      {accentColor ===
                        "red" && (
                        <CheckIcon size={16} />
                      )}

                    </button>

                    {/* ORANGE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleColorModeChange(
                          "orange",
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                        accentColor ===
                        "orange"
                          ? "bg-base-200 text-base-content"
                          : "text-base-content hover:bg-base-200"
                      }`}
                    >

                      <CircleIcon
                        size={16}
                        className="fill-current text-orange-500"
                      />

                      <span className="flex-1 text-left">
                        Orange
                      </span>

                      {accentColor ===
                        "orange" && (
                        <CheckIcon size={16} />
                      )}

                    </button>

                  </div>
                )}

              </div>

              {/* =================================================
                  LOGOUT
              ================================================= */}

              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
              >

                <LogoutIcon size={18} />

                <span className="flex-1 text-left">
                  Logout
                </span>

              </button>

            </div>
          </div>
        )}

      </div>

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="flex-1 p-3">

        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-base-content/50">
          Workspace
        </p>

        <div className="space-y-1">

          {navigation.map((item) => {
            const active =
              pathname.startsWith(
                item.href,
              );

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-base-200 text-base-content"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                }`}
              >

                <Icon size={18} />

                <span>
                  {item.name}
                </span>

              </Link>
            );
          })}

        </div>

      </nav>

      {/* =====================================================
          BOTTOM SETTINGS
      ===================================================== */}

      <div className="border-t border-base-300 p-3">

        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-base-content/70 transition hover:bg-base-200 hover:text-base-content"
        >

          <SettingsIcon size={18} />

          <span>
            Settings
          </span>

        </button>

      </div>

    </aside>
  );
}