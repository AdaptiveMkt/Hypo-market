import type { ReactNode } from "react";

export function StateName({ name }: { name: string }) {
  if (!name) return null;
  return <span className="amt-red">{name}</span>;
}

/** Tax rates and other percentages — red, not bold, no wave. */
export function Pct({ children }: { children: ReactNode }) {
  return <span className="pct-red">{children}</span>;
}

export function withPercents(text: string) {
  return text.split(/(\d+(?:\.\d+)?%)/g).map((part, i) =>
    /^\d/.test(part) && part.endsWith("%") ? <Pct key={i}>{part}</Pct> : part,
  );
}
