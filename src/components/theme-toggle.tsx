"use client";

import { useEffect, useState } from "react";

const KEY = "aum-theme";
const EVENT = "aum-theme";

export function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

export function applyStoredTheme() {
  try {
    const stored = localStorage.getItem(KEY);
    const dark =
      stored === "dark" ||
      (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(dark, false);
  } catch {
    /* ignore */
  }
}

/** Apply light/dark. persist writes aum-theme so the next visit matches. */
export function setTheme(dark: boolean, persist = true) {
  document.documentElement.classList.toggle("dark", dark);
  if (persist) {
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }
  window.dispatchEvent(new Event(EVENT));
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    applyStoredTheme();
    const sync = () => setDark(isDarkTheme());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

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