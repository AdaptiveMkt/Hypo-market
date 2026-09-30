"use client";

import { useEffect, useRef, useState } from "react";
import { WELCOME_BODY, WELCOME_HEADING } from "@/lib/welcome";

const CAPTIONS: { start: number; end: number; text: string }[] = [
  { start: 0, end: 1.9, text: "Hello there." },
  { start: 2, end: 9, text: "If your clients are worried about what long-term care could do to the assets they have accumulated, this hypothetical is how you show them." },
  { start: 10, end: 12.5, text: "It was built for licensed insurance professionals." },
  { start: 13, end: 20, text: "Run it with the client's name, or run it incognito, with no client name and no client financial information stored on this site." },
  { start: 20, end: 23, text: "Your own advisor information is required either way." },
  { start: 23, end: 29.5, text: "You will see how quickly long-term care can use those assets, and what changes if insurance pays first." },
  { start: 30, end: 38.5, text: "Traditional long-term care, asset-based design, annuity care, and a hybrid life and long-term care are all ready to test." },
  { start: 39, end: 42.5, text: "This is not a quote. The carrier illustration still comes from you." },
  { start: 43, end: 47, text: "Run it once, incognito, before your next long-term care appointment." },
  { start: 47, end: 58.5, text: "If you want this platform branded with your name and your agency, call or text 321-795-7516 and ask about pricing and customization." },
  { start: 59, end: 67, text: "Or email info@preserve-your-assets.com. You'll be glad you did." },
  { start: 68, end: 70.1, text: "Thank you." },
];

export function WelcomeVideo({ onStart }: { onStart?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState("");
  const [sound, setSound] = useState<"starting" | "on" | "tap">("starting");
  const [ended, setEnded] = useState(false);

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
      <div className="relative">
        <video
          ref={videoRef}
          className="block w-full rounded-lg bg-navy"
          controls
          autoPlay
          playsInline
          preload="auto"
          poster="/welcome/asset-preservation-poster.jpg?v=4"
          onTimeUpdate={syncCaption}
          onSeeked={syncCaption}
          onPlay={() => setEnded(false)}
          onEnded={() => {
            setCaption("");
            setEnded(true);
          }}
        >
          <source src="/welcome/asset-preservation.mp4?v=4" type="video/mp4" />
          <track
            kind="captions"
            srcLang="en"
            label="English"
            src="/welcome/asset-preservation.vtt"
          />
        </video>
        {ended ? (
          <div className="absolute inset-x-3 bottom-14 rounded-lg bg-navy/95 p-3 text-cream shadow-lg sm:inset-x-4">
            <p className="text-sm font-semibold">Run it once before your next appointment.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {onStart ? (
                <button
                  type="button"
                  className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-navy"
                  onClick={onStart}
                >
                  Start the hypothetical
                </button>
              ) : null}
              <a
                className="rounded-lg border border-cream/40 px-3 py-2 text-sm font-semibold text-cream"
                href="tel:+13217957516"
              >
                Call or text 321-795-7516
              </a>
            </div>
          </div>
        ) : null}
      </div>
      <figcaption
        className="mt-2 min-h-16 rounded-lg border border-line bg-cream px-3 py-2 text-sm leading-snug text-navy"
        aria-live="polite"
      >
        {caption ||
          (sound === "tap"
            ? "Playing. Tap the page once to turn the sound on."
            : "Closed captions show here, under the video, so they do not cover the picture.")}
      </figcaption>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        {onStart ? (
          <button
            type="button"
            className="rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-cream hover:bg-teal"
            onClick={onStart}
          >
            Start the hypothetical
          </button>
        ) : null}
        <a
          className="rounded-lg border border-navy px-4 py-2.5 text-center text-sm font-semibold text-navy hover:bg-cream"
          href="tel:+13217957516"
        >
          Call or text 321-795-7516
        </a>
        <a
          className="rounded-lg border border-navy px-4 py-2.5 text-center text-sm font-semibold text-navy hover:bg-cream"
          href="mailto:info@preserve-your-assets.com"
        >
          Email info@preserve-your-assets.com
        </a>
      </div>
    </figure>
  );
}

export function WelcomeCard({ onReset }: { onReset?: () => void }) {
  return (
    <section className="card-xl min-w-0 p-4 md:p-5" aria-labelledby="welcome-heading">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.14em] text-teal">For the licensed producer</p>
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
    </section>
  );
}
