import { createServerFn } from "@tanstack/react-start";
import { COPYRIGHT_LINE, HOLD_HARMLESS_SHORT } from "@/lib/disclaimer";
import {
  CONTACT_EMAIL,
  EMAIL_FROM,
  EMAIL_INBOX,
  TEST_MAIL_TO,
  TEST_PDF_BASE64,
  canAttachPdf,
  resendPdfAttachment,
} from "@/lib/email-attachment";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

type AdvisorMail = {
  advisorName: string;
  advisorEmail: string;
  advisorFirm?: string;
  clientName: string;
  clientEmail?: string;
  filename: string;
  pdfBase64: string;
  state?: string;
};

function parseAdvisorMail(raw: unknown): AdvisorMail {
  if (!raw || typeof raw !== "object") throw new Error("Advisor mail payload is required.");
  const o = raw as AdvisorMail;
  const advisorEmail = String(o.advisorEmail ?? "").trim().toLowerCase();
  const advisorName = String(o.advisorName ?? "").trim();
  const clientName = String(o.clientName ?? "").trim();
  const filename = String(o.filename ?? "asset-utilization.pdf").replace(/[^\w.\-]+/g, "-");
  const pdfBase64 = String(o.pdfBase64 ?? "").replace(/\s+/g, "");
  if (!advisorName) throw new Error("Advisor name is required.");
  if (!validEmail(advisorEmail)) throw new Error("Advisor email is required.");
  if (!clientName) throw new Error("Client / end-user name is required.");
  return {
    advisorName,
    advisorEmail,
    advisorFirm: String(o.advisorFirm ?? "").trim(),
    clientName,
    clientEmail: String(o.clientEmail ?? "").trim().toLowerCase(),
    filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
    pdfBase64,
    state: String(o.state ?? "").trim(),
  };
}

type ContactRequest = {
  name: string;
  phone: string;
  email: string;
  state: string;
};

function parseContact(raw: unknown): ContactRequest {
  if (!raw || typeof raw !== "object") throw new Error("Contact form is required.");
  const o = raw as ContactRequest;
  const name = String(o.name ?? "").trim();
  const phone = String(o.phone ?? "").trim();
  const email = String(o.email ?? "").trim().toLowerCase();
  const state = String(o.state ?? "").trim();
  if (name.length < 2) throw new Error("Enter your name.");
  if (phone.replace(/\D/g, "").length < 10) throw new Error("Enter a phone number.");
  if (!validEmail(email)) throw new Error("Enter a valid email.");
  if (!state) throw new Error("Select a state.");
  return { name, phone, email, state };
}

async function sendMail(payload: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
  attachments?: {
    filename: string;
    content: string;
    content_type?: string;
    content_disposition?: string;
  }[];
}) {
  const { sendSmtp } = await import("@/lib/smtp");
  try {
    if (await sendSmtp({
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.reply_to,
      attachments: payload.attachments,
    })) {
      return true;
    }
  } catch (err) {
    const { sanitizeMailError } = await import("@/lib/smtp");
    console.warn("SMTP send failed", sanitizeMailError(err));
  }
  return sendResend(payload);
}

async function sendResend(payload: {
  to: string[];
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
  attachments?: {
    filename: string;
    content: string;
    content_type?: string;
    content_disposition?: string;
  }[];
}) {
  const { env } = await import("@/lib/env.server");
  const key = env("RESEND_API_KEY");
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: EMAIL_FROM, ...payload }),
  });
  if (!res.ok) {
    console.warn("Report mail failed", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

export const emailAdvisorPdf = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseAdvisorMail(data))
  .handler(async ({ data }): Promise<{ ok: true; emailed: boolean; attached: boolean }> => {
    const attach = canAttachPdf(data.pdfBase64);
    const html = `<p>Hello ${escapeHtml(data.advisorName)},</p>
<p>The end user downloaded a Long Term Care Asset Utilization Modeling report${data.clientName ? ` for ${escapeHtml(data.clientName)}` : ""}${data.state ? ` (${escapeHtml(data.state)})` : ""}.</p>
<p>${attach ? "A PDF copy is attached (application/pdf) for your file." : "The PDF was too large to attach. Please request a copy from the end user."}</p>
<p>This is not a quote, illustration, or application. ${escapeHtml(HOLD_HARMLESS_SHORT)}</p>
<p>Sent from ${escapeHtml(EMAIL_INBOX)}.</p>
<p>${escapeHtml(COPYRIGHT_LINE)}</p>`;
    const text = `Hello ${data.advisorName},\n\nThe end user downloaded a Long Term Care Asset Utilization Modeling report${data.clientName ? ` for ${data.clientName}` : ""}.\n${attach ? "A PDF copy is attached." : "The PDF was too large to attach."}\n\n${HOLD_HARMLESS_SHORT}\n\n${COPYRIGHT_LINE}`;
    try {
      const emailed = await sendMail({
        to: [data.advisorEmail],
        reply_to: validEmail(data.clientEmail ?? "") ? data.clientEmail : EMAIL_INBOX,
        subject: "Long Term Care Asset Utilization Modeling report (copy)",
        html,
        text,
        attachments: attach ? [resendPdfAttachment(data.filename, data.pdfBase64)] : undefined,
      });
      return { ok: true, emailed, attached: attach && emailed };
    } catch (err) {
      console.info("[advisor-pdf]", data.advisorEmail, err);
      return { ok: true, emailed: false, attached: false };
    }
  });

export const submitContactRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseContact(data))
  .handler(async ({ data }): Promise<{ ok: true; emailed: boolean }> => {
    const html = `<p>I am requesting contact of a long term care professional in my state. Please forward me the contact information of at least 2 individuals.</p>
<ul>
<li>Name: ${escapeHtml(data.name)}</li>
<li>Phone: ${escapeHtml(data.phone)}</li>
<li>Email: ${escapeHtml(data.email)}</li>
<li>State: ${escapeHtml(data.state)}</li>
</ul>
<p>This request was sent to ${escapeHtml(CONTACT_EMAIL)}. This is not a quote or an application.</p>
<p>${escapeHtml(HOLD_HARMLESS_SHORT)}</p>
<p>${escapeHtml(COPYRIGHT_LINE)}</p>`;
    const text = `I am requesting contact of a long term care professional in my state. Please forward me the contact information of at least 2 individuals.\n\nName: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nState: ${data.state}\n\nSent to ${CONTACT_EMAIL}.\n\n${HOLD_HARMLESS_SHORT}\n\n${COPYRIGHT_LINE}`;
    try {
      const emailed = await sendMail({
        to: [CONTACT_EMAIL],
        reply_to: data.email,
        subject: `Contact request — ${data.name} (${data.state})`,
        html,
        text,
      });
      return { ok: true, emailed };
    } catch (err) {
      console.info("[contact-request]", data.email, err);
      return { ok: true, emailed: false };
    }
  });

export const sendTestPdfAttachment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const to =
      data && typeof data === "object" && "to" in data
        ? String((data as { to?: string }).to ?? "").trim().toLowerCase()
        : TEST_MAIL_TO;
    const email = validEmail(to) ? to : TEST_MAIL_TO;
    return { to: email };
  })
  .handler(async ({ data }): Promise<{ ok: true; emailed: boolean; to: string; from: string; error?: string }> => {
    const html = `<p>This is a test of the Long Term Care Asset Utilization Modeling <strong>PDF attachment</strong>.</p>
<p>From: ${escapeHtml(EMAIL_FROM)}<br/>To: ${escapeHtml(data.to)}<br/>Attachment: test-ltc-attachment.pdf (${escapeHtml("application/pdf")}, disposition attachment)</p>
<p>If you can open the attached PDF, advisor copies will use the same settings.</p>
<p>${escapeHtml(HOLD_HARMLESS_SHORT)}</p>
<p>${escapeHtml(COPYRIGHT_LINE)}</p>`;
    try {
      const emailed = await sendMail({
        to: [data.to],
        reply_to: EMAIL_INBOX,
        subject: "Test PDF attachment — Adaptive Marketing Group",
        html,
        text: `Test PDF attachment from ${EMAIL_INBOX} to ${data.to}. Open the attached PDF to confirm application/pdf attachments.`,
        attachments: [resendPdfAttachment("test-ltc-attachment.pdf", TEST_PDF_BASE64)],
      });
      return {
        ok: true,
        emailed,
        to: data.to,
        from: EMAIL_FROM,
        error: emailed ? undefined : "Mail service is not configured or the from-address is not verified.",
      };
    } catch (err) {
      const { sanitizeMailError } = await import("@/lib/smtp");
      return {
        ok: true,
        emailed: false,
        to: data.to,
        from: EMAIL_FROM,
        error: sanitizeMailError(err),
      };
    }
  });

export const getMailStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { mailStatus } = await import("@/lib/smtp");
  return mailStatus();
});
