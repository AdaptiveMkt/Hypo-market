"use client";

import { useEffect, useState } from "react";

const KEY = "aum-theme";

export function applyStoredTheme() {
  try {
    const stored = localStorage.getItem(KEY);
    const dark =
      stored === "dark" ||
      (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    applyStoredTheme();
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* ignore */
    }
    setDark(next);
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