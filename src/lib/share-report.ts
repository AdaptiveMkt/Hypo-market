import { createServerFn } from "@tanstack/react-start";

/** Personalized report links. The path is /[name]-hypo-asset-preservation/[code]. */
export const SHARE_ORIGIN = "https://www.preserve-your-assets.com";
/** Incognito report links. The path is /incognito-[code]. */
export const INCOGNITO_ORIGIN = "https://preserve-your-assets.com";
export const SHARE_HOURS = 72;
export const INCOGNITO_HOURS = 24;

export function shareDisclaimer(hours: number) {
  return `This web address is visible to anyone who has the link. It expires ${hours} hours after it is first opened. To save this report, print to PDF and save the file on your computer. This site does not keep a copy after the link expires.`;
}

export const SHARE_DISCLAIMER = shareDisclaimer(SHARE_HOURS);

export function shareSlug(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${base || "client"}-hypo-asset-preservation`;
}

export function shareUrl(slug: string, code: string) {
  return `${SHARE_ORIGIN}/${slug}/${code}`;
}

export function incognitoShareUrl(code: string) {
  return `${INCOGNITO_ORIGIN}/incognito-${code}`;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*-hypo-asset-preservation$/;
const CODE_RE = /^[a-z0-9]{16}$/;
const INCOGNITO_RE = /^incognito-([a-z0-9]{16})$/;

export type ShareView =
  | { status: "ready"; html: string; expiresAt: string; firstViewedAt: string; hours: number }
  | { status: "expired"; hours: number }
  | { status: "missing" };

function cleanHtml(raw: string) {
  return raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

function parsePublish(raw: unknown): { name: string; html: string; incognito: boolean } {
  if (!raw || typeof raw !== "object") throw new Error("Report content is required.");
  const name = String((raw as { name?: unknown }).name ?? "").trim().slice(0, 80);
  const incognito = Boolean((raw as { incognito?: unknown }).incognito);
  const html = cleanHtml(String((raw as { html?: unknown }).html ?? ""));
  if (html.length < 200) throw new Error("The report is not ready to share yet.");
  if (html.length > 1_500_000) throw new Error("This report is too large to share as a link.");
  return { name, html, incognito };
}

function parseRead(raw: unknown): { slug: string; code: string } {
  if (!raw || typeof raw !== "object") throw new Error("Link is not valid.");
  const slug = String((raw as { slug?: unknown }).slug ?? "");
  const code = String((raw as { code?: unknown }).code ?? "");
  const incognito = INCOGNITO_RE.exec(slug);
  if (incognito) return { slug, code: incognito[1] };
  if (!SLUG_RE.test(slug) || !CODE_RE.test(code)) throw new Error("Link is not valid.");
  return { slug, code };
}

export const publishShare = createServerFn({ method: "POST" })
  .validator(parsePublish)
  .handler(async ({ data }) => {
    const { saveShare } = await import("./share-blob.server");
    return saveShare(data.name, data.html, data.incognito);
  });

export const readShare = createServerFn({ method: "POST" })
  .validator(parseRead)
  .handler(async ({ data }): Promise<ShareView> => {
    const { openShare } = await import("./share-blob.server");
    return openShare(data.slug, data.code);
  });
