import nodemailer from "nodemailer";
import { EMAIL_FROM, EMAIL_FROM_ADDRESS, type SmtpPublicStatus } from "@/lib/email-attachment";

if (typeof window !== "undefined") {
  throw new Error("SMTP is server-only. Credentials are not available in the browser.");
}

export type SmtpMail = {
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: {
    filename: string;
    content: string;
    content_type?: string;
    content_disposition?: string;
  }[];
};

function env(key: string) {
  return process.env[key]?.trim() || undefined;
}

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
};

function smtpConfigFromEnv(): SmtpConfig | null {
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER") ?? env("SMTP_USERNAME");
  const pass = env("SMTP_PASS") ?? env("SMTP_PASSWORD");
  if (!host || !user || !pass) return null;
  const port = Number(env("SMTP_PORT") || "587") || 587;
  const secure =
    env("SMTP_SECURE") === "true" || env("SMTP_SECURE") === "1" || port === 465;
  return { host, port, secure, user, pass };
}

function maskUser(user: string) {
  const at = user.indexOf("@");
  if (at <= 1) return "•••";
  return `${user[0]}•••${user.slice(at)}`;
}

export function sanitizeMailError(err: unknown) {
  const raw = err instanceof Error ? err.message : String(err ?? "Send failed");
  return raw
    .replace(/(pass(word)?|pwd|secret|key)\s*[:=]\s*\S+/gi, "$1=•••")
    .replace(/\/\/([^:@/]+):([^@/]+)@/g, "//$1:•••@")
    .slice(0, 240);
}

export function mailStatus(): SmtpPublicStatus {
  const smtp = smtpConfigFromEnv();
  const resend = Boolean(env("RESEND_API_KEY"));
  return {
    configured: Boolean(smtp) || resend,
    from: env("SMTP_FROM") || EMAIL_FROM,
    host: smtp?.host ?? (resend ? "Resend API" : "Not set"),
    port: smtp?.port ?? 587,
    secure: smtp?.secure ?? false,
    user: smtp ? maskUser(smtp.user) : resend ? EMAIL_FROM_ADDRESS : "Not set",
    passwordSet: Boolean(smtp),
    transport: smtp ? "smtp" : resend ? "resend" : "none",
  };
}

export async function sendSmtp(mail: SmtpMail): Promise<boolean> {
  const cfg = smtpConfigFromEnv();
  if (!cfg) return false;
  const from = env("SMTP_FROM") || EMAIL_FROM;
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    requireTLS: !cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    authMethod: "PLAIN",
    tls: {
      minVersion: "TLSv1.2",
      servername: cfg.host,
      rejectUnauthorized: true,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  const attachments = (mail.attachments ?? []).map((a) => ({
    filename: a.filename,
    content: a.content,
    encoding: "base64" as const,
    contentType: a.content_type || "application/pdf",
    contentDisposition: (a.content_disposition as "attachment") || "attachment",
  }));
  try {
    await transporter.sendMail({
      from,
      to: mail.to.join(", "),
      replyTo: mail.replyTo,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      attachments,
    });
    return true;
  } catch (err) {
    console.warn("SMTP send failed", sanitizeMailError(err));
    throw new Error(sanitizeMailError(err));
  } finally {
    transporter.close();
  }
}
