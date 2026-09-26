"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

export type PickerOption = { value: string; label: string; group?: string };

const triggerClass =
  "flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-line bg-paper px-3 py-2.5 text-left text-base text-ink outline-none focus:border-teal";

/** Touch-friendly picker. Native <select> often does not open in the iOS preview iframe. */
export function FieldPicker({
  id,
  value,
  onChange,
  options,
  placeholder = "Select…",
  invalid = false,
  attention = false,
  searchable,
  open: openProp,
  onOpenChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  invalid?: boolean;
  attention?: boolean;
  searchable?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  function setOpen(next: boolean) {
    if (openProp === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.value === value);
  const useSearch = searchable ?? options.length > 10;
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(n) || o.value.toLowerCase().includes(n),
    );
  }, [options, q]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const groups = useMemo(() => {
    const map = new Map<string, PickerOption[]>();
    for (const o of filtered) {
      const g = o.group || "";
      const list = map.get(g) ?? [];
      list.push(o);
      map.set(g, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="min-w-0 w-full max-w-full">
      <button
        type="button"
        id={id}
        className={`${triggerClass} ${invalid ? "border-deplete" : ""} ${attention ? "need-input" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={invalid}
        onClick={() => {
          setQ("");
          setOpen(true);
        }}
      >
        <span className={selected ? "min-w-0 truncate" : "text-muted"}>{selected?.label ?? placeholder}</span>
        <span aria-hidden className="shrink-0 text-gold-ink">
          ▾
        </span>
      </button>
      {open
        ? createPortal(
            <div className="fixed inset-0 z-[90] flex flex-col bg-cream/80 p-3 sm:items-center sm:justify-center">
              <div
                className="absolute inset-0"
                onClick={() => setOpen(false)}
                aria-hidden
              />
              <div
                role="dialog"
                aria-labelledby={`${id}-sheet`}
                className="relative z-10 flex max-h-[min(88dvh,36rem)] w-full max-w-lg flex-col rounded-xl border border-card-border bg-paper shadow-[var(--shadow-card)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <p id={`${id}-sheet`} className="font-display text-base text-navy">
                    {placeholder}
                  </p>
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-card-border px-3 text-sm font-semibold text-navy"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
                {useSearch ? (
                  <div className="border-b border-line px-4 py-2">
                    <input
                      className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 text-base text-ink outline-none focus:border-teal"
                      inputMode="search"
                      enterKeyHint="search"
                      placeholder="Type to filter…"
                      value={q}
                      autoFocus
                      onChange={(e) => setQ(e.target.value)}
                    />
                  </div>
                ) : null}
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1" role="listbox">
                  {groups.map(([group, rows]) => (
                    <div key={group || "all"}>
                      {group ? (
                        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{group}</p>
                      ) : null}
                      {rows.map((o) => {
                        const on = o.value === value;
                        return (
                          <button
                            type="button"
                            key={`${o.group ?? ""}-${o.value}-${o.label}`}
                            role="option"
                            aria-selected={on}
                            className={`flex min-h-12 w-full items-center px-4 text-left text-base ${
                              on ? "bg-cream font-semibold text-navy" : "text-ink"
                            }`}
                            onClick={() => {
                              onChange(o.value);
                              setOpen(false);
                            }}
                          >
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {!filtered.length ? (
                    <p className="px-4 py-6 text-sm text-muted">No matches. Try another word.</p>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function StepperField({
  id,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  prefix,
  placeholder,
  decimals = 0,
  blankWhenZero = false,
  compact = false,
  attention = false,
  commas = false,
}: {
  id: string;
  value: number;
  onChange: (raw: string) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  placeholder?: string;
  decimals?: number;
  blankWhenZero?: boolean;
  compact?: boolean;
  attention?: boolean;
  commas?: boolean;
}) {
  const shown =
    blankWhenZero && (!value || value === 0)
      ? ""
      : commas
        ? Number(value || 0).toLocaleString("en-US", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })
        : decimals
          ? Number(value || 0).toFixed(decimals)
          : String(value || 0);

  function bump(dir: 1 | -1) {
    if ((!value || value === 0) && dir > 0) {
      onChange(decimals ? Number(min).toFixed(decimals) : String(min));
      return;
    }
    const start = Number(value) || 0;
    const next = Math.round((start + dir * step) * 10000) / 10000;
    const hi = max ?? Number.POSITIVE_INFINITY;
    const clamped = Math.min(hi, Math.max(min, next));
    onChange(decimals ? clamped.toFixed(decimals) : String(clamped));
  }

  return (
    <div className="grid min-w-0 w-full max-w-full gap-1">
      <div className="relative min-w-0 w-full max-w-full">
        {prefix ? (
          <span className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted ${compact ? "text-sm" : ""}`}>{prefix}</span>
        ) : null}
        <input
          id={id}
          className={`box-border w-full min-w-0 max-w-full rounded-lg border border-line bg-paper text-base tabular-nums text-ink outline-none focus:border-teal ${
            compact ? "min-h-9 py-1.5" : "min-h-11 py-2.5"
          } ${prefix ? (compact ? "pl-6 pr-2" : "pl-7 pr-3") : compact ? "px-2" : "px-3"} ${attention ? "need-input" : ""}`}
          inputMode={decimals ? "decimal" : "numeric"}
          enterKeyHint="done"
          placeholder={placeholder}
          value={shown}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))}
        />
      </div>
      <div className="flex justify-start gap-1">
        <button
          type="button"
          className={`flex shrink-0 items-center justify-center rounded-md border border-navy font-semibold leading-none text-navy ${compact ? "size-7 text-sm" : "size-8 text-sm"}`}
          aria-label="Decrease"
          onClick={() => bump(-1)}
        >
          −
        </button>
        <button
          type="button"
          className={`flex shrink-0 items-center justify-center rounded-md border border-navy font-semibold leading-none text-navy ${compact ? "size-7 text-sm" : "size-8 text-sm"}`}
          aria-label="Increase"
          onClick={() => bump(1)}
        >
          +
        </button>
      </div>
    </div>
  );
}
