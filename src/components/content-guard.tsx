"use client";

import { useEffect, type ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

function isUnguarded(pathname: string) {
  return pathname === "/facebook-ads" || pathname.startsWith("/facebook-ads/");
}

/** Deterrent only — not a DRM. Form fields stay copyable/pasteable. PDF download is allowed. */
export function ContentGuard({ children }: { children: ReactNode }) {
  const open = useRouterState({ select: (s) => isUnguarded(s.location.pathname) });

  useEffect(() => {
    if (open) return;
    function onKey(e: KeyboardEvent) {
      if (isEditable(e.target)) return;
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && ["c", "x", "a", "u", "s"].includes(key)) {
        e.preventDefault();
      }
      if (e.key === "F12" || ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(key))) {
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (open) return <>{children}</>;

  return (
    <div
      onContextMenu={(e) => {
        if (!isEditable(e.target)) e.preventDefault();
      }}
      onCopy={(e) => {
        if (!isEditable(e.target)) e.preventDefault();
      }}
      onCut={(e) => {
        if (!isEditable(e.target)) e.preventDefault();
      }}
      onDragStart={(e) => {
        if (!isEditable(e.target)) e.preventDefault();
      }}
    >
      {children}
    </div>
  );
}
