import { createServerFn } from "@tanstack/react-start";

/** Public report links. The path is /[name]-hypo-asset-preservation/[code]. */
export const SHARE_ORIGIN = "https://protect-your-assets.com";
export const SHARE_HOURS = 72;

export const SHARE_DISCLAIMER =
  "This web address is visible to anyone who has the link. It expires 72 hours after it is first opened. To save this report, print to PDF and save the file on your computer. This site does not keep a copy after the link expires.";

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

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*-hypo-asset-preservation$/;
const CODE_RE = /^[a-z0-9]{16}$/;

export type ShareView =
  | { status: "ready"; html: string; expiresAt: string; firstViewedAt: string }
  | { status: "expired" }
  | { status: "missing" };

function cleanHtml(raw: string) {
  return raw
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "")
    .replace(/javascript:/gi, "");
}

function parsePublish(raw: unknown): { name: string; html: string } {
  if (!raw || typeof raw !== "object") throw new Error("Report content is required.");
  const name = String((raw as { name?: unknown }).name ?? "").trim().slice(0, 80);
  const html = cleanHtml(String((raw as { html?: unknown }).html ?? ""));
  if (html.length < 200) throw new Error("The report is not ready to share yet.");
  if (html.length > 1_500_000) throw new Error("This report is too large to share as a link.");
  return { name, html };
}

function parseRead(raw: unknown): { slug: string; code: string } {
  if (!raw || typeof raw !== "object") throw new Error("Link is not valid.");
  const slug = String((raw as { slug?: unknown }).slug ?? "");
  const code = String((raw as { code?: unknown }).code ?? "");
  if (!SLUG_RE.test(slug) || !CODE_RE.test(code)) throw new Error("Link is not valid.");
  return { slug, code };
}

export const publishShare = createServerFn({ method: "POST" })
  .validator(parsePublish)
  .handler(async ({ data }) => {
    const { saveShare } = await import("./share-blob.server");
    return saveShare(data.name, data.html);
  });

export const readShare = createServerFn({ method: "POST" })
  .validator(parseRead)
  .handler(async ({ data }): Promise<ShareView> => {
    const { openShare } = await import("./share-blob.server");
    return openShare(data.slug, data.code);
  });
