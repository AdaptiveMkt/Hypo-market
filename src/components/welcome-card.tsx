"use client";

import { useEffect, useRef, useState } from "react";
import { playCelesteScript, stopCeleste, watchCeleste } from "@/lib/celeste";
import { setVoiceOn, useVoiceOn } from "@/lib/voice-pref";
import { WELCOME_BODY, WELCOME_HEADING, WELCOME_SPOKEN } from "@/lib/welcome";

const CAPTIONS: { start: number; end: number; text: string }[] = [
  { start: 0, end: 1.9, text: "Hello there." },
  { start: 2, end: 9, text: "Let me ask, are you a financial services professional or licensed insurance agent that has clients concerned about the future costs of long-term care" },
  { start: 9, end: 11.8, text: "and where their care might be needed?" },
  { start: 12, end: 19, text: "Maybe you're just someone concerned whether or not your assets will last in the event of a chronic health challenge, and more importantly, what will be the consequences" },
  { start: 19, end: 23, text: "to your family if and when long-term care is required in the future." },
  { start: 23, end: 28.5, text: "If you are either one and you don't know where to start, consider taking this short online assessment." },
  { start: 29, end: 35.5, text: "The assessment can be customized, or it can be run incognito without disclosing any personal contact or financial information." },
  { start: 36, end: 43.5, text: "In fact, once the assessment is completed, you can view it privately and then download it to your personal computer or digital device." },
  { start: 44, end: 48.5, text: "No personal or financial information is retained on any servers or this platform." },
  { start: 49, end: 53.2, text: "So go on and see for yourself how this tool could be helpful in long-term care planning." },
  { start: 53.2, end: 54.8, text: "You'll be glad you did." },
  { start: 55, end: 57, text: "Oh, one more thing before I leave." },
  { start: 57, end: 63, text: "If you are in the insurance or financial services industry and want to license and brand this tool, give us a call." },
  { start: 63, end: 66.5, text: "Our information is provided and viewable within the terms of use." },
  { start: 67, end: 69.7, text: "Thank you." },
];

export function WelcomeVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState("");
  const [sound, setSound] = useState<"starting" | "on" | "tap">("starting");

  function syncCaption() {
    const t = videoRef.current?.currentTime ?? 0;
    const cue = CAPTIONS.find((c) => t >= c.start && t < c.end);
    setCaption(cue?.text ?? "");
  }

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    let dead = false;
    let dropGesture = () => {};
    v.playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "true");
    v.preload = "auto";
    v.volume = 1;
    v.muted = true;

    const clearGesture = () => {
      dropGesture();
      dropGesture = () => {};
    };
    const armGesture = () => {
      const go = () => {
        if (dead) return;
        v.muted = false;
        v.volume = 1;
        void v.play().then(() => {
          if (!dead) setSound(v.muted ? "tap" : "on");
        }).catch(() => {
          if (!dead) setSound("tap");
        });
        clearGesture();
      };
      window.addEventListener("pointerdown", go);
      window.addEventListener("touchend", go);
      window.addEventListener("keydown", go);
      dropGesture = () => {
        window.removeEventListener("pointerdown", go);
        window.removeEventListener("touchend", go);
        window.removeEventListener("keydown", go);
      };
    };

    void v.play().then(() => {
      if (dead) return;
      v.muted = false;
      v.volume = 1;
      if (!v.paused && !v.muted) {
        setSound("on");
        return;
      }
      return v.play();
    }).then(() => {
      if (dead || sound === "on") return;
      if (v.paused || v.muted) {
        setSound("tap");
        armGesture();
      } else {
        setSound("on");
      }
    }).catch(() => {
      if (dead) return;
      setSound("tap");
      armGesture();
    });

    return () => {
      dead = true;
      clearGesture();
      v.pause();
    };
  }, []);

  return (
    <figure className="mt-4 min-w-0 md:mt-0">
      <video
        ref={videoRef}
        className="block w-full rounded-lg bg-navy"
        controls
        autoPlay
        playsInline
        preload="auto"
        poster="/welcome/asset-preservation-poster.jpg"
        onTimeUpdate={syncCaption}
        onSeeked={syncCaption}
        onEnded={() => setCaption("")}
      >
        <source src="/welcome/asset-preservation.mp4?v=3" type="video/mp4" />
        <track
          kind="captions"
          srcLang="en"
          label="English"
          src="/welcome/asset-preservation.vtt"
        />
      </video>
      <figcaption
        className="mt-2 min-h-16 rounded-lg border border-line bg-cream px-3 py-2 text-sm leading-snug text-navy"
        aria-live="polite"
      >
        {caption ||
          (sound === "tap"
            ? "Playing. Tap the page once to turn the sound on."
            : "Closed captions show here, under the video, so they do not cover the picture.")}
      </figcaption>
    </figure>
  );
}

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
