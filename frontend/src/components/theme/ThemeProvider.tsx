"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Theme = "light" | "dark";

export type AccentColor =
  | "default"
  | "blue"
  | "purple"
  | "red"
  | "orange";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;

  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
};

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

/*
 * =========================================================
 * GET DAISYUI THEME
 * =========================================================
 */

function getDaisyTheme(
  theme: Theme,
  accentColor: AccentColor,
) {
  /*
   * Every color has its own DaisyUI theme.
   *
   * Examples:
   *
   * light + default → light-default
   * light + blue    → light-blue
   * light + purple  → light-purple
   * light + red     → light-red
   * light + orange  → light-orange
   *
   * dark + default  → dark-default
   * dark + blue     → dark-blue
   * dark + purple   → dark-purple
   * dark + red      → dark-red
   * dark + orange   → dark-orange
   */

  return `${theme}-${accentColor}`;
}

/*
 * =========================================================
 * THEME PROVIDER
 * =========================================================
 */

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("light");

  const [accentColor, setAccentColorState] =
    useState<AccentColor>("default");

  /*
   * =========================================================
   * APPLY THEME
   * =========================================================
   */

  function applyTheme(
    nextTheme: Theme,
    nextAccent: AccentColor,
  ) {
    const daisyTheme = getDaisyTheme(
      nextTheme,
      nextAccent,
    );

    /*
     * Apply DaisyUI theme immediately.
     */
    document.documentElement.setAttribute(
      "data-theme",
      daisyTheme,
    );

    /*
     * Also update color-scheme so the browser
     * knows whether the page is light or dark.
     */
    document.documentElement.style.colorScheme =
      nextTheme;
  }

  /*
   * =========================================================
   * LOAD SAVED PREFERENCES
   * =========================================================
   */

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme");

    const savedAccent =
      localStorage.getItem("accent-color");

    /*
     * =======================================================
     * THEME
     * =======================================================
     */

    let initialTheme: Theme = "light";

    if (
      savedTheme === "light" ||
      savedTheme === "dark"
    ) {
      initialTheme = savedTheme;
    }

    /*
     * =======================================================
     * ACCENT COLOR
     * =======================================================
     */

    let initialAccent: AccentColor =
      "default";

    if (
      savedAccent === "default" ||
      savedAccent === "blue" ||
      savedAccent === "purple" ||
      savedAccent === "red" ||
      savedAccent === "orange"
    ) {
      initialAccent = savedAccent;
    }

    /*
     * =======================================================
     * UPDATE REACT STATE
     * =======================================================
     */

    setThemeState(initialTheme);
    setAccentColorState(initialAccent);

    /*
     * =======================================================
     * APPLY SAVED THEME
     * =======================================================
     */

    applyTheme(
      initialTheme,
      initialAccent,
    );
  }, []);

  /*
   * =========================================================
   * CHANGE LIGHT / DARK THEME
   * =========================================================
   */

  function setTheme(nextTheme: Theme) {
    /*
     * Update React state.
     */
    setThemeState(nextTheme);

    /*
     * Save preference.
     */
    localStorage.setItem(
      "theme",
      nextTheme,
    );

    /*
     * Apply immediately.
     *
     * Important:
     * We use the CURRENT accent color here.
     */
    applyTheme(
      nextTheme,
      accentColor,
    );
  }

  /*
   * =========================================================
   * CHANGE ACCENT COLOR
   * =========================================================
   */

  function setAccentColor(
    nextColor: AccentColor,
  ) {
    /*
     * Update React state.
     */
    setAccentColorState(nextColor);

    /*
     * Save preference.
     */
    localStorage.setItem(
      "accent-color",
      nextColor,
    );

    /*
     * Apply immediately.
     *
     * Important:
     * We use the CURRENT light/dark theme here.
     */
    applyTheme(
      theme,
      nextColor,
    );
  }

  /*
   * =========================================================
   * PROVIDER
   * =========================================================
   */

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        accentColor,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/*
 * =========================================================
 * USE THEME
 * =========================================================
 */

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider",
    );
  }

  return context;
}