"use client";

import { useEffect, useState } from "react";

const KEY = "aum-cvd";

export const CVD_MODES = [
  { id: "off", label: "Full color" },
  { id: "protanopia", label: "Protanopia" },
  { id: "deuteranopia", label: "Deuteranopia" },
  { id: "tritanopia", label: "Tritanopia" },
] as const;

export type CvdMode = (typeof CVD_MODES)[number]["id"];

function applyCvd(mode: CvdMode) {
  document.documentElement.dataset.cvd = mode === "off" ? "" : mode;
  if (!mode || mode === "off") document.documentElement.removeAttribute("data-cvd");
}

export function CvdPreview() {
  const [mode, setMode] = useState<CvdMode>("off");

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(KEY) as CvdMode | null;
      if (stored && CVD_MODES.some((m) => m.id === stored)) {
        setMode(stored);
        applyCvd(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function onChange(next: CvdMode) {
    setMode(next);
    applyCvd(next);
    try {
      sessionStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <label className="relative block w-full">
      <span className="sr-only">Color vision preview</span>
      <select
        className="h-11 w-full appearance-none rounded-lg border border-masthead-fg/40 bg-masthead px-2 pr-7 text-center text-sm font-semibold text-masthead-fg"
        value={mode}
        onChange={(e) => onChange(e.target.value as CvdMode)}
        aria-label="Color vision preview"
      >
        {CVD_MODES.map((m) => (
          <option key={m.id} value={m.id}>
            {m.id === "off" ? "Full color" : m.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-masthead-fg">
        ▾
      </span>
    </label>
  );
}

/** SVG ColorMatrix filters (Viénot 1999 linear-RGB approximation). Preview only. */
export function CvdFilters() {
  return (
    <svg aria-hidden className="absolute h-0 w-0 overflow-hidden">
      <defs>
        <filter id="cvd-protanopia" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.567 0.433 0 0 0
                    0.558 0.442 0 0 0
                    0 0.242 0.758 0 0
                    0 0 0 1 0"
          />
        </filter>
        <filter id="cvd-deuteranopia" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.625 0.375 0 0 0
                    0.7 0.3 0 0 0
                    0 0.3 0.7 0 0
                    0 0 0 1 0"
          />
        </filter>
        <filter id="cvd-tritanopia" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.95 0.05 0 0 0
                    0 0.433 0.567 0 0
                    0 0.475 0.525 0 0
                    0 0 0 1 0"
          />
        </filter>
        <pattern
          id="hatch-shortfall"
          patternUnits="userSpaceOnUse"
          width="7"
          height="7"
          patternTransform="rotate(45)"
        >
          <rect width="7" height="7" fill="#D55E00" fillOpacity="0.22" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#D55E00" strokeWidth="2.2" />
        </pattern>
      </defs>
    </svg>
  );
}