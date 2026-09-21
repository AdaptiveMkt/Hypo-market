import { createServerFn } from "@tanstack/react-start";
import {
  ensureSourceDisclosure,
  retrieveKnowledge,
} from "@/lib/chat-knowledge";

const MODEL = "grok-4.5";
const MAX_ANSWER_TOKENS = 900;
const MAX_QUESTION = 500;
const MAX_TTS = 1400;

export type TtsVoiceId = "celeste";
export const DEFAULT_TTS_VOICE: TtsVoiceId = "celeste";

export type ChatTurn = { role: "user" | "assistant"; content: string };

function parseAsk(raw: unknown): { question: string; history: ChatTurn[] } {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const question = String(o.question ?? "").trim().slice(0, MAX_QUESTION);
  if (question.length < 3) throw new Error("Type a question (at least a few words).");
  const history = Array.isArray(o.history)
    ? o.history.slice(-6).map((t) => {
        const row = t && typeof t === "object" ? (t as Record<string, unknown>) : {};
        const role = row.role === "assistant" ? "assistant" : "user";
        return { role, content: String(row.content ?? "").slice(0, 1200) } as ChatTurn;
      })
    : [];
  return { question, history };
}

export const askHypoAssistant = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseAsk(data))
  .handler(async ({ data }): Promise<{
    ok: true;
    answer: string;
    spoken: string;
    usedAaltci: boolean;
    sources: { label: string; url: string }[];
  } | { ok: false; error: string }> => {
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) {
      return {
        ok: false,
        error: "The assistant is not available in this environment. Use the educational cards on the page.",
      };
    }

    const { chunks, sources } = retrieveKnowledge(data.question);
    const pack = chunks
      .map((c) => {
        const tag = c.aaltci ? "AALTCI" : c.label;
        return `[${tag}] ${c.text}${c.url ? ` (${c.url})` : ""}`;
      })
      .join("\n\n");

    const sourceList = sources.length
      ? sources.map((s) => `- ${s.label} — ${s.url}`).join("\n")
      : "- This hypothetical’s educational cards";

    const system = `You are the educational assistant for Long Term Care Asset Utilization Modeling (Adaptive Marketing Group & Funding LTC Marketplace).
Answer ONLY from the knowledge pack below (this hypothetical’s content and its cited publishers). If the pack does not cover it, say you do not have that in this hypothetical and suggest a licensed professional.
You are not an insurance agent, attorney, CPA, or fiduciary. Do not quote a premium as if it were an offer. Do not determine Medicaid or VA eligibility.
Keep the body of the answer under 180 words, plain language, US English.

CITE EVERY SOURCE YOU USE — not only AALTCI. Name CareScout, Genworth, NAIC, IRS, Medicaid.gov, VA.gov, BLS, SSA, Milliman, SOA, LIMRA, EY, AARP, Funding LTC Marketplace, and AALTCI.org when those pack lines are used. Example: "According to CareScout’s Cost of Care Survey…" or "NAIC Shopper’s Guide…".
When an AALTCI line is used you MUST also say the American Association for Long-Term Care Insurance (AALTCI.org).
Do not invent a publisher that is not in the pack.
End the answer with a short "Sources:" list using the labels and URLs from this retrieved set:
${sourceList}

Knowledge pack:
${pack}`;

    const messages = [
      { role: "system" as const, content: system },
      ...data.history.map((t) => ({ role: t.role, content: t.content })),
      { role: "user" as const, content: data.question },
    ];

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          max_tokens: MAX_ANSWER_TOKENS,
          messages,
        }),
      });
      if (!res.ok) {
        return { ok: false, error: `Assistant error (${res.status}). Try again in a moment.` };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = body.choices?.[0]?.message?.content?.trim() ?? "";
      if (!raw) return { ok: false, error: "The assistant returned an empty answer." };
      const disclosed = ensureSourceDisclosure(raw, sources);
      return {
        ok: true,
        answer: disclosed.text,
        spoken: disclosed.spoken.slice(0, MAX_TTS),
        usedAaltci: disclosed.usedAaltci,
        sources: disclosed.sources,
      };
    } catch {
      return { ok: false, error: "Could not reach the assistant. Try again." };
    }
  });

function parseSpeak(raw: unknown): { text: string; usedAaltci: boolean } {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const text = String(o.text ?? "").trim().slice(0, MAX_TTS);
  if (text.length < 2) throw new Error("Nothing to speak.");
  return { text, usedAaltci: Boolean(o.usedAaltci) };
}

export const speakHypoAssistant = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseSpeak(data))
  .handler(async ({ data }): Promise<
    { ok: true; audio: string; mime: string } | { ok: false; error: string }
  > => {
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) return { ok: false, error: "Voice is not available in this environment." };

    let spoken = data.text;
    if (data.usedAaltci && !/aaltci/i.test(spoken)) {
      spoken = `${spoken} Source disclosure: American Association for Long-Term Care Insurance, AALTCI.org.`;
    }
    spoken = spoken.slice(0, MAX_TTS);

    try {
      const res = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text: spoken,
          voice_id: DEFAULT_TTS_VOICE,
          language: "en",
        }),
      });
      if (!res.ok) {
        return { ok: false, error: `Voice error (${res.status}).` };
      }
      const buf = await res.arrayBuffer();
      if (buf.byteLength < 100) return { ok: false, error: "Voice returned empty audio." };
      const mime = res.headers.get("content-type") || "audio/mpeg";
      const audio =
        typeof Buffer !== "undefined"
          ? Buffer.from(buf).toString("base64")
          : btoa(String.fromCharCode(...new Uint8Array(buf)));
      return { ok: true, audio, mime };
    } catch {
      return { ok: false, error: "Could not generate speech." };
    }
  });
