"use client";

import { useLayoutEffect, useState } from "react";

const KEY = "aum-theme";
export const THEME_EVENT = "aum-theme";

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

function paintDark(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.add("antialiased");
  root.style.colorScheme = dark ? "dark" : "light";
  document.body?.classList.toggle("dark", dark);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#0f1c24" : "#1b3a4b");
}

export function applyDaylight() {
  paintDark(false);
  try {
    localStorage.setItem(KEY, "light");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

/** @deprecated kept for callers; load is always incognito (dark). */
export function applyStoredTheme() {
  setTheme(true);
}

/** Apply light/dark. persist writes aum-theme so the next visit matches. */
export function setTheme(dark: boolean, persist = true) {
  paintDark(dark);
  if (persist) {
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function useDarkMode() {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useLayoutEffect(() => {
    const sync = () => setDark(isDarkTheme());
    sync();
    window.addEventListener(THEME_EVENT, sync);
    return () => window.removeEventListener(THEME_EVENT, sync);
  }, []);
  return dark;
}

export function ThemeToggle() {
  const dark = useDarkMode();

  function toggle() {
    setTheme(!isDarkTheme());
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-masthead-fg/40 bg-masthead px-2 text-center text-sm font-semibold text-masthead-fg hover:bg-masthead-fg/10"
    >
      {dark ? "Light mode" : "Dark mode"}
    </button>
  );
}