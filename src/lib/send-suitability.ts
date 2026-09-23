import { createServerFn } from "@tanstack/react-start";
import { COPYRIGHT_LINE, HOLD_HARMLESS_SHORT } from "@/lib/disclaimer";
import { suitabilityAsText, type SuitabilityForm } from "@/lib/naic-suitability";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function parseForm(raw: unknown): SuitabilityForm {
  if (!raw || typeof raw !== "object") throw new Error("Worksheet answers are required.");
  const o = raw as SuitabilityForm;
  const name = String(o.applicantName ?? "").trim();
  const email = String(o.applicantEmail ?? "").trim().toLowerCase();
  if (name.length < 2) throw new Error("Enter the applicant’s name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email.");
  if (!o.reviewedWithAgent) {
    throw new Error("The applicant must check that the worksheet was reviewed.");
  }
  if (o.completeOrDecline !== "complete" && o.completeOrDecline !== "decline") {
    throw new Error("Choose whether financial answers are complete, or decline to complete them.");
  }
  if (!String(o.applicantSign ?? "").trim()) throw new Error("Type the applicant’s name as a signature.");
  return { ...o, applicantName: name, applicantEmail: email };
}

export const submitSuitability = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseForm(data))
  .handler(async ({ data }): Promise<{ ok: true; emailed: boolean }> => {
    const { env } = await import("@/lib/env.server");
    const body = suitabilityAsText(data);
    const key = env("RESEND_API_KEY");
    const from =
      env("RESEND_FROM") ?? "Adaptive Marketing Group <kim@adaptivesolutionsonline.com>";

    async function send(to: string[], subject: string, html: string, text: string, replyTo?: string) {
      if (!key) return false;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, reply_to: replyTo, subject, html, text }),
      });
      if (!res.ok) {
        console.warn("Suitability email failed", res.status, await res.text().catch(() => ""));
        return false;
      }
      return true;
    }

    const htmlBody = body
      .split("\n")
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("");

    const userHtml = `<p>Hello ${escapeHtml(data.applicantName)},</p>
<p>We received your educational NAIC Long-Term Care Insurance Personal Worksheet. This is not a policy application and is not a carrier filing. A copy is sent only to you (the end user). Adaptive Marketing Group does not receive a copy.</p>
<ul>${htmlBody}</ul>
<p>${escapeHtml(HOLD_HARMLESS_SHORT)}</p>
<p>${escapeHtml(COPYRIGHT_LINE)}</p>`;

    try {
      const userSent = await send(
        [data.applicantEmail],
        "Your NAIC Long-Term Care Insurance Personal Worksheet",
        userHtml,
        `Hello ${data.applicantName},\n\nWe received your educational NAIC Long-Term Care Insurance Personal Worksheet.\n\n${body}\n\nA copy is sent only to you. Adaptive Marketing Group does not receive a copy.\n\n${HOLD_HARMLESS_SHORT}\n\n${COPYRIGHT_LINE}`,
        data.applicantEmail,
      );
      return { ok: true, emailed: userSent };
    } catch (err) {
      console.info("[suitability]", data.applicantEmail, err);
      return { ok: true, emailed: false };
    }
  });