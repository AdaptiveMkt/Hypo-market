"use client";

import { useEffect, useRef, useState } from "react";
import { askHypoAssistant, speakHypoAssistant, type ChatTurn } from "@/lib/chatbot";
import { isVoiceOn, useVoiceOn } from "@/lib/voice-pref";

type Msg = ChatTurn & {
  usedAaltci?: boolean;
  sources?: { label: string; url: string }[];
  spoken?: string;
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: {
    resultIndex: number;
    results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
  }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getRecognizer(): (new () => SpeechRec) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function HypoChatbot() {
  const voiceOn = useVoiceOn();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speakOn, setSpeakOn] = useState(() => isVoiceOn());
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Ask about this hypothetical — assets, care costs, insurance, Partnership, tax, VA, or industry figures. Answers come from this model’s cards and every cited publisher (CareScout, NAIC, IRS, Medicaid.gov, VA.gov, Milliman, SOA, AALTCI.org, and others). Each source used is named in text and in voice. Not advice and not a quote.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakGen = useRef(0);

  useEffect(() => {
    if (!voiceOn) {
      setSpeakOn(false);
      recRef.current?.abort();
      setListening(false);
      stopSpeak();
    }
  }, [voiceOn]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const openChat = () => setOpen(true);
    window.addEventListener("aum:open-chat", openChat);
    return () => {
      window.removeEventListener("aum:open-chat", openChat);
      recRef.current?.abort();
      stopSpeak();
    };
  }, []);

  function stopSpeak() {
    speakGen.current += 1;
    audioRef.current?.pause();
    if (audioRef.current) {
      audioRef.current.src = "";
      audioRef.current = null;
    }
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSpeaking(false);
    setStatus((s) => (s === "Speaking…" ? "" : s));
  }

  async function speak(text: string, usedAaltci: boolean) {
    if (!speakOn || !voiceOn || !text) return;
    const gen = ++speakGen.current;
    setSpeaking(true);
    setStatus("Speaking…");
    try {
      const res = await speakHypoAssistant({ data: { text, usedAaltci } });
      if (gen !== speakGen.current) return;
      if (!res.ok) {
        fallbackSpeak(text, gen);
        return;
      }
      const url = `data:${res.mime};base64,${res.audio}`;
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        if (gen === speakGen.current) {
          setSpeaking(false);
          setStatus("");
        }
      };
      audio.onerror = () => {
        if (gen === speakGen.current) {
          setSpeaking(false);
          setStatus("");
        }
      };
      await audio.play();
    } catch {
      if (gen === speakGen.current) fallbackSpeak(text, gen);
    }
  }

  function fallbackSpeak(text: string, gen: number) {
    try {
      window.speechSynthesis?.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.onend = () => {
        if (gen === speakGen.current) {
          setSpeaking(false);
          setStatus("");
        }
      };
      u.onerror = () => {
        if (gen === speakGen.current) {
          setSpeaking(false);
          setStatus("");
        }
      };
      window.speechSynthesis?.speak(u);
    } catch {
      if (gen === speakGen.current) {
        setSpeaking(false);
        setStatus("");
      }
    }
  }

  async function ask(question: string) {
    const q = question.trim();
    if (q.length < 3 || busy) return;
    setBusy(true);
    setStatus("");
    const history = messages.filter((m) => m.content).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    try {
      const res = await askHypoAssistant({ data: { question: q, history } });
      if (!res.ok) {
        setMessages((m) => [...m, { role: "assistant", content: res.error }]);
        setStatus(res.error);
        return;
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.answer,
          usedAaltci: res.usedAaltci,
          sources: res.sources,
          spoken: res.spoken,
        },
      ]);
      await speak(res.spoken || res.answer, res.usedAaltci);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Could not reach the assistant. Try again." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function startListen() {
    if (!voiceOn) {
      setStatus("Voice is off in the header.");
      return;
    }
    const Ctor = getRecognizer();
    if (!Ctor) {
      setStatus("Voice input needs Chrome, Edge, or Safari. You can still type.");
      return;
    }
    recRef.current?.abort();
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let finalText = "";
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i];
        if (row.isFinal) finalText += row[0].transcript;
        else interim += row[0].transcript;
      }
      if (interim) setStatus(`Listening: ${interim}`);
      if (finalText) {
        setInput(finalText.trim());
        setStatus("");
        void ask(finalText.trim());
      }
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") setStatus("Microphone permission denied.");
      else if (ev.error !== "no-speech") setStatus(`Voice error: ${ev.error}`);
      setListening(false);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      setStatus("Listening… ask your question.");
    } catch {
      setStatus("Could not start the microphone.");
    }
  }

  function stopListen() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        className="no-print hidden min-h-11 rounded-full border border-teal bg-navy px-4 py-3 text-sm font-semibold text-cream shadow-[var(--shadow-card)] hover:bg-teal lg:fixed lg:bottom-4 lg:right-4 lg:z-40 lg:inline-flex"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={false}
        aria-controls="hypo-chatbot"
      >
        Ask the model
      </button>
    );
  }

  return (
    <div
      id="hypo-chatbot"
      role="dialog"
      aria-modal="false"
      aria-labelledby="hypo-chat-title"
      className="card-xl no-print fixed bottom-24 left-3 right-3 z-40 flex max-h-[min(62vh,30rem)] w-auto flex-col overflow-hidden sm:left-auto sm:right-4 sm:w-[min(100%-1.5rem,24rem)] lg:bottom-4"
    >
      <div className="flex items-start justify-between gap-2 border-b border-card-border px-4 py-3">
        <div>
          <p id="hypo-chat-title" className="font-display text-base text-navy">
            Educational assistant
          </p>
          <p className="text-xs text-muted">Text or voice. Sourced from this hypothetical.</p>
        </div>
          <button
          type="button"
          className="min-h-11 min-w-11 rounded-lg border border-card-border px-2 text-sm font-semibold text-navy hover:bg-cream"
          aria-label="Close educational assistant"
          onClick={() => {
            stopListen();
            stopSpeak();
            setOpen(false);
          }}
        >
          Close
        </button>
      </div>
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={
              m.role === "user"
                ? "ml-6 rounded-lg bg-cream px-3 py-2 text-navy"
                : "mr-2 rounded-lg border border-card-border bg-paper px-3 py-2 text-muted"
            }
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
            {m.sources && m.sources.length > 0 ? (
              <p className="mt-2 text-xs text-navy">
                <span className="font-semibold">Sources named: </span>
                {m.sources.map((s, si) => (
                  <span key={s.url}>
                    {si > 0 ? "; " : ""}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-link"
                      data-source-href={s.url}
                    >
                      {s.label}
                    </a>
                  </span>
                ))}
              </p>
            ) : m.usedAaltci ? (
              <p className="mt-2 text-xs font-semibold text-navy">
                Disclosed source:{" "}
                <a
                  href="https://www.aaltci.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                  data-source-href="https://www.aaltci.org/"
                >
                  AALTCI.org
                </a>
              </p>
            ) : null}
          </div>
        ))}
        {busy ? <p className="text-xs text-muted">Looking in this hypothetical…</p> : null}
      </div>
      <form
        className="border-t border-card-border px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
      >
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              className="size-4 accent-teal"
              checked={speakOn && voiceOn}
              disabled={!voiceOn}
              onChange={(e) => {
                setSpeakOn(e.target.checked);
                if (!e.target.checked) stopSpeak();
              }}
            />
            Speak answers (Celeste)
          </label>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-card-border px-3 text-sm font-semibold text-navy hover:bg-cream disabled:opacity-50"
            onClick={stopSpeak}
            disabled={!speaking}
          >
            Stop speaking
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <label htmlFor="hypo-chat-q" className="sr-only">
            Question for the educational assistant
          </label>
          <input
            id="hypo-chat-q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about assets, insurance, AALTCI…"
            className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-paper px-3 text-base text-ink outline-none focus:border-teal"
            maxLength={500}
            disabled={busy}
          />
          <button
            type="button"
            className="min-h-11 shrink-0 rounded-lg border border-card-border px-3 text-sm font-semibold text-navy hover:bg-cream disabled:opacity-60"
            onClick={() => (listening ? stopListen() : startListen())}
            disabled={busy}
            aria-pressed={listening}
            aria-label={listening ? "Stop microphone" : "Start microphone"}
          >
            {listening ? "Stop" : "Mic"}
          </button>
          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-lg bg-navy px-3 text-sm font-semibold text-cream hover:bg-teal disabled:opacity-60"
            disabled={busy || input.trim().length < 3}
          >
            Send
          </button>
        </div>
        <p className="mt-1 text-xs text-muted" aria-live="polite">
          {status || "Educational only. Every publisher used from this hypothetical is named in text and voice."}
        </p>
      </form>
    </div>
  );
}
