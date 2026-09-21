"use client";

import { useEffect, useState } from "react";
import { playCeleste, stopCeleste, watchCeleste } from "@/lib/celeste";
import { WELCOME_BODY, WELCOME_HEADING, WELCOME_SPOKEN } from "@/lib/welcome";

export function WelcomeCard() {
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const off = watchCeleste((s) => {
      setSpeaking(s === "playing");
      setStatus(s === "playing" ? "Celeste is reading the welcome…" : "");
    });
    const t = window.setTimeout(() => {
      void playCeleste(WELCOME_SPOKEN);
    }, 400);
    return () => {
      window.clearTimeout(t);
      off();
      stopCeleste();
    };
  }, []);

  return (
    <section className="card-xl min-w-0 p-4 md:p-5" aria-labelledby="welcome-heading">
      <p className="mb-1 text-xs uppercase tracking-[0.14em] text-teal">New visitor</p>
      <h2 id="welcome-heading" className="font-display text-xl text-navy">
        {WELCOME_HEADING}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{WELCOME_BODY}</p>
      <div className="mt-4 stack-actions">
        <button
          type="button"
          className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream disabled:opacity-50"
          onClick={stopCeleste}
          disabled={!speaking}
        >
          Stop speaking
        </button>
      </div>
      <p className="mt-2 text-xs text-muted" aria-live="polite">
        {status || "Celeste reads this welcome when the page loads. Disclaimer and privacy are in the footer."}
      </p>
    </section>
  );
}
