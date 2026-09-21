"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { applyVoiceTranscript } from "@/lib/voice";
import { setVoiceOn, useVoiceOn } from "@/lib/voice-pref";
import { stopCeleste } from "@/lib/celeste";

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
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

export function VoiceControls({ children }: { children?: ReactNode }) {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("");
  const [micOk, setMicOk] = useState(true);
  const recRef = useRef<SpeechRec | null>(null);
  const voiceOn = useVoiceOn();

  useEffect(() => {
    setMicOk(Boolean(getRecognizer()));
    return () => {
      recRef.current?.abort();
    };
  }, []);

  function stopListen() {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }

  function startListen() {
    if (!voiceOn) {
      setStatus("Voice is off. Turn Voice on to use the microphone.");
      return;
    }
    const Ctor = getRecognizer();
    if (!Ctor) {
      setStatus("Voice input is not available in this browser. Try Chrome or Edge.");
      return;
    }
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
        const result = applyVoiceTranscript(finalText);
        setStatus(result.message);
      }
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") setStatus("Microphone permission denied.");
      else if (ev.error !== "no-speech") setStatus(`Voice input error: ${ev.error}`);
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
      setStatus("Listening… speak now.");
    } catch {
      setStatus("Could not start the microphone.");
    }
  }

  function toggleListen() {
    if (listening) {
      stopListen();
      setStatus("Microphone off.");
      return;
    }
    startListen();
  }

  const btn =
    "inline-flex h-11 w-full items-center justify-center rounded-lg border border-masthead-fg/40 bg-masthead px-2 text-center text-sm font-semibold text-masthead-fg hover:bg-masthead-fg/10 disabled:opacity-60";

  return (
    <div className="w-full max-w-xl">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <button
          type="button"
          className={btn}
          aria-pressed={listening}
          aria-label={listening ? "Stop voice input" : "Start voice input"}
          onClick={toggleListen}
          disabled={!voiceOn || (!micOk && !listening)}
        >
          {listening ? "Listening…" : "Voice input"}
        </button>
        <button
          type="button"
          className={btn}
          aria-pressed={!voiceOn}
          aria-label={voiceOn ? "Turn all site voice off" : "Turn all site voice on"}
          onClick={() => {
            const next = !voiceOn;
            if (!next) {
              stopListen();
              stopCeleste();
            }
            setVoiceOn(next);
            setStatus(next ? "Voice on for the whole site." : "Voice off for the whole site.");
          }}
        >
          {voiceOn ? "Voice off" : "Voice on"}
        </button>
        {children}
      </div>
      <p className="mt-1.5 text-left text-xs leading-snug text-masthead-fg/80" aria-live="polite">
        {status ||
          (!voiceOn
            ? "All voice is off. Tap Voice on to restore Celeste and the microphone."
            : micOk
              ? "Voice: say “cash 50,000”, “state Florida”, or “run hypothetical.”"
              : "Voice input needs Chrome, Edge, or Safari.")}
      </p>
    </div>
  );
}
