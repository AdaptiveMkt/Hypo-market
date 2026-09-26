"use client";

import { useEffect, useState } from "react";
import { playCelesteScript, stopCeleste, watchCeleste } from "@/lib/celeste";
import { setVoiceOn, useVoiceOn } from "@/lib/voice-pref";
import { WELCOME_BODY, WELCOME_HEADING, WELCOME_SPOKEN } from "@/lib/welcome";

export function WelcomeCard({ onReset }: { onReset?: () => void }) {
  const [speaking, setSpeaking] = useState(false);
  const [status, setStatus] = useState("");
  const voiceOn = useVoiceOn();

  useEffect(() => {
    return watchCeleste((s) => {
      const playing = s === "playing";
      setSpeaking(playing);
      setStatus(playing ? "Celeste is reading the welcome…" : "");
    });
  }, []);

  return (
    <section className="card-xl min-w-0 p-4 md:p-5" aria-labelledby="welcome-heading">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-teal">New visitor</p>
        {onReset ? (
          <button
            type="button"
            className="rounded-lg border border-navy px-3 py-1.5 text-sm font-semibold text-navy hover:bg-cream"
            onClick={onReset}
          >
            Reset
          </button>
        ) : null}
      </div>
      <h2 id="welcome-heading" className="font-display text-xl text-navy">
        {WELCOME_HEADING}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{WELCOME_BODY}</p>
      <div className="mt-4 stack-actions">
        <button
          type="button"
          className="btn-block rounded-lg border border-navy bg-navy text-cream hover:bg-teal disabled:opacity-50"
          onClick={() => {
            if (!voiceOn) setVoiceOn(true);
            void playCelesteScript(WELCOME_SPOKEN);
          }}
          disabled={speaking}
        >
          Hear welcome
        </button>
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
        {status ||
          "Voice does not start on its own. Tap Hear welcome if you want Celeste to read this. Disclaimer and privacy are in the footer."}
      </p>
    </section>
  );
}
