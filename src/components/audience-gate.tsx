"use client";

import type { AudienceRole } from "@/lib/qa-cookie";

const OPTIONS: { id: AudienceRole; n: string; title: string }[] = [
  {
    id: "interested",
    n: "1",
    title: "Interested user concerned about future long-term care health costs",
  },
  {
    id: "licensed-client",
    n: "2",
    title: "Licensed insurance professional with client input",
  },
  {
    id: "licensed-solo",
    n: "3",
    title: "Licensed insurance professional without client input",
  },
];

export function AudienceGate({ onSelect }: { onSelect: (role: AudienceRole) => void }) {
  return (
    <section className="card-xl min-w-0 p-4 md:p-5" aria-label="Who is using this hypothetical">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Before you begin</p>
      <h2 className="mt-1 font-display text-xl text-navy">Which of these describes you?</h2>
      <p className="mt-2 text-sm text-muted">Choose one. This choice controls what you can view and whether a PDF can be saved.</p>
      <div className="mt-4 grid gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="rounded-lg border border-navy px-4 py-3 text-left text-sm font-semibold text-navy hover:bg-cream"
            onClick={() => onSelect(opt.id)}
          >
            <span className="mr-2 text-teal">{opt.n}.</span>
            {opt.title}
          </button>
        ))}
      </div>
    </section>
  );
}

export function audienceViewMessage(role: AudienceRole | null) {
  if (role === "licensed-solo") return "Contact Adaptive Marketing Group for terms of use and licensing agreement.";
  return "";
}

export function AudienceBanner({ role }: { role: AudienceRole | null }) {
  const msg = audienceViewMessage(role);
  if (!msg) return null;
  return (
    <p className="text-center text-xl font-bold leading-snug text-neutral-500" role="status">
      {msg}
    </p>
  );
}
