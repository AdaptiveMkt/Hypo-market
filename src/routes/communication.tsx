import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";

const VIDEO_ID = "PPQW6w2RkaE";
const EMBED_SRC = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

const CAPTIONS: { start: number; end: number; text: string }[] = [
  { start: 0.4, end: 2, text: "So, what did you think?" },
  { start: 2, end: 6, text: "You just saved your first long-term care asset preservation hypothetical." },
  { start: 6, end: 10, text: "That report is the piece your client can actually take with them." },
  { start: 10, end: 11.5, text: "Here's why we built it." },
  {
    start: 11.5,
    end: 18,
    text: "A lot of good producers, experienced and new, never start this conversation, not because they do not care.",
  },
  {
    start: 18,
    end: 27.5,
    text: "They are not sure where to begin, and they do not have a simple way to show someone how fast long-term care can use up the assets that person spent a lifetime building.",
  },
  { start: 27.5, end: 29, text: "That is what you just ran." },
  {
    start: 29,
    end: 36,
    text: "An asset preservation model. It shows the drawdown, and it shows what changes if insurance is part of the plan.",
  },
  { start: 36, end: 39, text: "The numbers came from the assumptions you entered." },
  { start: 39, end: 42.5, text: "When you sit with a client, be clear about what it is." },
  { start: 42.5, end: 48.5, text: "A hypothetical, not a quote, not a promise that those assets will be protected." },
  {
    start: 48.5,
    end: 59,
    text: "If they want a carrier illustration, quote, or an outline of coverage, that still comes from you. You do not have to stop at one run. Same client, or the next one.",
  },
  {
    start: 59,
    end: 66,
    text: "Another state, home care instead of assisted living, a different benefit, a different copay.",
  },
  { start: 66, end: 69, text: "Run it until the picture makes sense." },
  {
    start: 69,
    end: 74,
    text: "If you want it as your own, we can brand it and build your information into the program.",
  },
  {
    start: 74,
    end: 79.5,
    text: "The license costs less than the time it takes to rebuild this conversation for each client.",
  },
  {
    start: 79.5,
    end: 87.5,
    text: "$9.98 a month, cancel anytime, or $99 for the year with the first two months included.",
  },
  { start: 87.5, end: 90.5, text: "Choose a button and leave your contact information." },
  {
    start: 90.5,
    end: 97,
    text: "We will start building your own customized version of the tool, so the next appointment does not start from a blank page.",
  },
  { start: 97, end: 100, text: "So go ahead and let us build a platform for you." },
  { start: 100, end: 112, text: "You'll be glad you did. And thanks for participating." },
];

function captionAt(time: number) {
  return CAPTIONS.find((cue) => time >= cue.start && time < cue.end)?.text ?? "";
}

function command(frame: HTMLIFrameElement, func: string, args: unknown[] = []) {
  frame.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args, id: frame.id, channel: "widget" }),
    "*",
  );
}

export const Route = createFileRoute("/communication")({
  component: Communication,
  head: () => ({
    meta: [{ title: "Communication" }],
  }),
});

function Communication() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [caption, setCaption] = useState("");
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let dead = false;

    const listen = () => {
      frame.contentWindow?.postMessage(
        JSON.stringify({ event: "listening", id: frame.id, channel: "widget" }),
        "*",
      );
      command(frame, "playVideo");
    };

    const onMessage = (event: MessageEvent) => {
      if (dead || event.source !== frame.contentWindow) return;
      if (event.origin !== "https://www.youtube.com" && event.origin !== "https://www.youtube-nocookie.com") return;
      let data: { event?: string; info?: { currentTime?: number } } | null = null;
      try {
        data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }
      if (!data || typeof data !== "object") return;
      if (data.event === "onReady" || data.event === "initialDelivery") listen();
      const time = data.info?.currentTime;
      if (typeof time === "number") setCaption(captionAt(time));
    };

    const unmute = () => {
      command(frame, "unMute");
      command(frame, "setVolume", [100]);
      command(frame, "playVideo");
      setSoundOn(true);
    };

    window.addEventListener("message", onMessage);
    window.addEventListener("pointerdown", unmute);
    frame.addEventListener("load", listen);
    const poll = window.setInterval(() => {
      command(frame, "getCurrentTime");
    }, 400);

    return () => {
      dead = true;
      window.removeEventListener("message", onMessage);
      window.removeEventListener("pointerdown", unmute);
      frame.removeEventListener("load", listen);
      window.clearInterval(poll);
    };
  }, []);

  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <h2 className="mb-3 border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Communication
        </h2>
        <figure className="mx-auto mt-2 w-full min-w-0 max-w-md">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-navy">
            <iframe
              id="license-video"
              ref={frameRef}
              className="absolute inset-0 h-full w-full"
              src={EMBED_SRC}
              title="Thanks for participating. Long-Term Care Asset Utilization."
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <figcaption
            className="mt-2 min-h-16 rounded-lg border border-line bg-cream px-3 py-2 text-sm leading-snug text-navy"
            aria-live="polite"
          >
            {soundOn
              ? caption || "Closed captions show here, under the video, so they do not cover the picture."
              : caption
                ? `${caption} Tap once to turn the sound on.`
                : "Playing. Tap once to turn the sound on."}
          </figcaption>
        </figure>
        <p className="mt-3 text-pretty text-sm text-muted">
          The monthly and annual license buttons are next to Light Mode.
        </p>
        <Link to="/" className="mt-5 inline-block font-semibold text-teal underline-offset-4 hover:underline">
          Return to the calculator
        </Link>
      </section>
    </main>
  );
}
