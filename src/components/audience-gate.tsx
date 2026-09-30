"use client";

import type { AudienceRole } from "@/lib/qa-cookie";
import { WelcomeVideo } from "@/components/welcome-card";

const OPTIONS: { id: AudienceRole; n: string; title: string }[] = [
  {
    id: "licensed-client",
    n: "2",
    title: "Licensed insurance professional with client input",
  },
];

export function AudienceGate({ onSelect }: { onSelect: (role: AudienceRole) => void }) {
  return (
    <section className="card-xl flex min-w-0 flex-col p-4 md:p-5" aria-label="Who is using this hypothetical">
      <div className="order-1 md:order-2 md:mt-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Licensed insurance professionals</p>
        <h2 className="mt-1 font-display text-xl text-navy">Start a client-ready hypothetical</h2>
        <p className="mt-2 text-sm text-muted">
          This page is for the agent, not a consumer self-assessment. Enter your advisor
          information to continue. Then run incognito, or enter the client and use it in the meeting.
        </p>
        <div className="mt-4 grid gap-2">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="rounded-lg border border-navy bg-navy px-4 py-3 text-left text-sm font-semibold text-cream hover:bg-teal"
              onClick={() => onSelect(opt.id)}
            >
              I am a licensed insurance professional
            </button>
          ))}
        </div>
      </div>
      <div className="order-2 md:order-1">
        <WelcomeVideo onStart={() => onSelect("licensed-client")} />
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
