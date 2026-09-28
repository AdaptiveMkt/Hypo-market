import { get, put } from "@vercel/blob";
import { SHARE_HOURS, shareSlug, shareUrl } from "@/lib/share-report";

type StoredShare = {
  slug: string;
  html: string;
  createdAt: string;
  firstViewedAt: string | null;
  expiresAt: string | null;
};

const memory = new Map<string, string>();
const HOUR_MS = 60 * 60 * 1000;

function token() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || "";
}

function pathname(code: string) {
  return `shares/${code}.json`;
}

function randomCode() {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function readRaw(code: string): Promise<string | null> {
  if (!token()) return memory.get(code) ?? null;
  try {
    const result = await get(pathname(code), { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    return new Response(result.stream).text();
  } catch {
    return null;
  }
}

async function writeRaw(code: string, json: string) {
  if (!token()) {
    memory.set(code, json);
    return;
  }
  await put(pathname(code), json, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

export async function saveShare(name: string, html: string) {
  const slug = shareSlug(name);
  const code = randomCode();
  const record: StoredShare = {
    slug,
    html,
    createdAt: new Date().toISOString(),
    firstViewedAt: null,
    expiresAt: null,
  };
  await writeRaw(code, JSON.stringify(record));
  return { url: shareUrl(slug, code), slug, code };
}

export async function openShare(slug: string, code: string) {
  const raw = await readRaw(code);
  if (!raw) return { status: "missing" as const };
  let record: StoredShare;
  try {
    record = JSON.parse(raw) as StoredShare;
  } catch {
    return { status: "missing" as const };
  }
  if (record.slug !== slug) return { status: "missing" as const };
  const now = Date.now();
  if (record.expiresAt && now > Date.parse(record.expiresAt)) {
    return { status: "expired" as const };
  }
  if (!record.firstViewedAt) {
    const opened = new Date(now);
    record.firstViewedAt = opened.toISOString();
    record.expiresAt = new Date(now + SHARE_HOURS * HOUR_MS).toISOString();
    await writeRaw(code, JSON.stringify(record));
  }
  return {
    status: "ready" as const,
    html: record.html,
    expiresAt: record.expiresAt ?? "",
    firstViewedAt: record.firstViewedAt ?? "",
  };
}
