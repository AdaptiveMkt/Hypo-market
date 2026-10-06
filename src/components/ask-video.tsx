"use client";

import { useEffect, useRef, useState } from "react";

const CAPTIONS: { start: number; end: number; text: string }[] = [
  { start: 0, end: 1.8, text: "Hey, where are you going?" },
  { start: 1.8, end: 4, text: "Before you leave, I have a question." },
  {
    start: 4,
    end: 10,
    text: "How much money are you leaving on the table by not having a conversation with your clients regarding planning for long-term care?",
  },
  { start: 10, end: 14.8, text: "Unfortunately, there are only one of two things that happen as we get older." },
  {
    start: 14.8,
    end: 22,
    text: "We either die, or our body and brain starts to fail us, and we find ourselves looking to others to help with our everyday activities",
  },
  {
    start: 22,
    end: 29,
    text: "of daily living such as bathing, dressing, feeding, toileting, transferring, and maintaining our continence.",
  },
  { start: 29, end: 32.8, text: "Take a look at the quick calculations on the screen below." },
  {
    start: 32.8,
    end: 39.8,
    text: "You decide how many new clients or policies you can sell in a year, and the commission revenue numbers take care of themselves.",
  },
  { start: 39.8, end: 45, text: "We have a motto: if you don't ask, you don't get." },
  {
    start: 45,
    end: 53.8,
    text: "So why not ask your clients if they've considered the emotional, physical, and financial consequences of not planning for long-term care?",
  },
  { start: 53.8, end: 56.8, text: "If you don't, your competition just might." },
  {
    start: 56.8,
    end: 62.2,
    text: "We hope to see you return to try out this long-term care asset utilization modeling tool.",
  },
  { start: 62.2, end: 70, text: "Thanks for visiting." },
];

export function AskVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [caption, setCaption] = useState("");
  const [sound, setSound] = useState<"starting" | "on" | "tap">("starting");

  function syncCaption() {
    const t = videoRef.current?.currentTime ?? 0;
    const cue = CAPTIONS.find((item) => t >= item.start && t < item.end);
    setCaption(cue?.text ?? "");
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let dead = false;
    let dropGesture = () => {};
    video.playsInline = true;
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 1;
    video.autoplay = true;

    const clearGesture = () => {
      dropGesture();
      dropGesture = () => {};
    };
    const armGesture = () => {
      const go = () => {
        if (dead) return;
        video.muted = false;
        video.volume = 1;
        void video.play().catch(() => undefined);
        if (!dead) setSound("on");
        clearGesture();
      };
      window.addEventListener("pointerdown", go);
      dropGesture = () => window.removeEventListener("pointerdown", go);
    };
    const keepPlaying = () => {
      if (dead || !video.paused) return;
      video.muted = true;
      void video.play().catch(() => undefined);
    };
    const trySound = () => {
      if (dead) return;
      video.muted = false;
      video.volume = 1;
      void video
        .play()
        .then(() => {
          if (dead) return;
          if (video.paused || video.muted) {
            keepPlaying();
            setSound("tap");
            armGesture();
            return;
          }
          setSound("on");
        })
        .catch(() => {
          if (dead) return;
          keepPlaying();
          setSound("tap");
          armGesture();
        });
    };
    const start = () => {
      if (dead) return;
      video.muted = true;
      void video
        .play()
        .then(() => {
          if (!dead) trySound();
        })
        .catch(() => {
          if (dead) return;
          setSound("tap");
          armGesture();
        });
    };

    if (video.readyState >= 2) start();
    else video.addEventListener("canplay", start);

    return () => {
      dead = true;
      clearGesture();
      video.removeEventListener("canplay", start);
      video.pause();
    };
  }, []);

  return (
    <figure className="card-xl min-w-0 p-4 md:p-5">
      <video
        ref={videoRef}
        className="block w-full rounded-lg bg-navy"
        controls
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/commission/ask-and-you-get-poster.jpg?v=1"
        onTimeUpdate={syncCaption}
        onSeeked={syncCaption}
      >
        <source src="/commission/ask-and-you-get.mp4?v=1" type="video/mp4" />
        <track kind="captions" srcLang="en" label="English" src="/commission/ask-and-you-get.vtt?v=1" default />
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
