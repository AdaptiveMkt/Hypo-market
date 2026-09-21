import { speakHypoAssistant } from "@/lib/chatbot";

const CHUNK = 1200;

let gen = 0;
let audio: HTMLAudioElement | null = null;
let lastScript = "";
let paused = false;
let scriptId = 0;
let holdUi = false;

export type CelesteUi = "idle" | "playing" | "paused";
let ui: CelesteUi = "idle";
const subs = new Set<(s: CelesteUi) => void>();

function setUi(next: CelesteUi) {
  ui = next;
  subs.forEach((fn) => fn(next));
}

export function watchCeleste(fn: (s: CelesteUi) => void) {
  subs.add(fn);
  fn(ui);
  return () => {
    subs.delete(fn);
  };
}

export function stopCeleste() {
  gen += 1;
  scriptId += 1;
  paused = false;
  holdUi = false;
  audio?.pause();
  if (audio) {
    audio.src = "";
    audio = null;
  }
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
  setUi("idle");
}

export function pauseCeleste() {
  if (ui !== "playing") return;
  paused = true;
  audio?.pause();
  try {
    window.speechSynthesis?.pause();
  } catch {
    /* ignore */
  }
  setUi("paused");
}

export function resumeCeleste() {
  if (ui === "playing") return;
  if (ui === "paused") {
    paused = false;
    setUi("playing");
    if (audio && audio.paused && !audio.ended) {
      void audio.play().catch(() => {
        if (lastScript) void playCelesteScript(lastScript);
      });
      return;
    }
    try {
      window.speechSynthesis?.resume();
    } catch {
      /* ignore */
    }
    return;
  }
  if (lastScript) void playCelesteScript(lastScript);
}

function unlockSpeech() {
  try {
    const syn = window.speechSynthesis;
    if (!syn) return;
    syn.resume();
    const kick = new SpeechSynthesisUtterance(" ");
    kick.volume = 0;
    kick.rate = 10;
    syn.speak(kick);
  } catch {
    /* iOS may still block until a later tap */
  }
}

function splitForSpeech(text: string): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const parts: string[] = [];
  let rest = clean;
  while (rest.length > CHUNK) {
    let cut = rest.lastIndexOf(". ", CHUNK);
    if (cut < CHUNK * 0.45) cut = rest.lastIndexOf(" ", CHUNK);
    if (cut < 1) cut = CHUNK;
    parts.push(rest.slice(0, cut + 1).trim());
    rest = rest.slice(cut + 1).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

export function playCeleste(text: string): Promise<void> {
  unlockSpeech();
  const g = ++gen;
  paused = false;
  setUi("playing");
  return new Promise((resolve) => {
    const finish = () => {
      if (g === gen) {
        if (!paused && !holdUi) setUi("idle");
        resolve();
      }
    };

    void (async () => {
      try {
        const res = await speakHypoAssistant({ data: { text, usedAaltci: false } });
        if (g !== gen) {
          resolve();
          return;
        }
        if (!res.ok) {
          fallback(text, g, finish);
          return;
        }
        audio?.pause();
        const next = new Audio(`data:${res.mime};base64,${res.audio}`);
        audio = next;
        next.onended = finish;
        next.onerror = () => fallback(text, g, finish);
        await next.play();
        if (paused) next.pause();
      } catch {
        if (g === gen) fallback(text, g, finish);
        else resolve();
      }
    })();
  });
}

export async function playCelesteScript(text: string) {
  lastScript = text;
  paused = false;
  const id = ++scriptId;
  const parts = splitForSpeech(text);
  if (!parts.length) return;
  holdUi = true;
  setUi("playing");
  for (const part of parts) {
    if (paused || id !== scriptId) break;
    await playCeleste(part);
    if (paused || id !== scriptId) break;
  }
  holdUi = false;
  if (!paused && id === scriptId) setUi("idle");
}

function fallback(text: string, g: number, done: () => void) {
  try {
    window.speechSynthesis?.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    u.onend = done;
    u.onerror = done;
    if (g === gen) window.speechSynthesis?.speak(u);
    else done();
  } catch {
    done();
  }
}
