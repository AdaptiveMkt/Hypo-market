import { get, put } from "@vercel/blob";
import { INCOGNITO_HOURS, SHARE_HOURS, incognitoShareUrl, shareSlug, shareUrl } from "@/lib/share-report";

type StoredShare = {
  slug: string;
  html: string;
  hours: number;
  createdAt: string;
  firstViewedAt: string | null;
  expiresAt: string | null;
};

const memory = new Map<string, string>();
const HOUR_MS = 60 * 60 * 1000;

const STORE_ID = "store_dk2G5KgkmEt2uzGL";

function blobOptions() {
  return { access: "private" as const, storeId: STORE_ID };
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
  try {
    const result = await get(pathname(code), { ...blobOptions(), useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return memory.get(code) ?? null;
    return new Response(result.stream).text();
  } catch {
    return memory.get(code) ?? null;
  }
}

async function writeRaw(code: string, json: string) {
  try {
    await put(pathname(code), json, {
      ...blobOptions(),
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (/store does not exist/i.test(message)) {
      throw new Error("The temporary report link is not available yet. The report storage is not connected to this site.");
    }
    throw err;
  }
}

export async function saveShare(name: string, html: string, incognito = false, presetCode = "") {
  const reserved = /^[a-z0-9]{16}$/.test(presetCode);
  const code = reserved ? presetCode : randomCode();
  const hours = incognito ? INCOGNITO_HOURS : SHARE_HOURS;
  const slug = reserved || incognito ? `incognito-${code}` : shareSlug(name);
  const record: StoredShare = {
    slug,
    html,
    hours,
    createdAt: new Date().toISOString(),
    firstViewedAt: null,
    expiresAt: null,
  };
  await writeRaw(code, JSON.stringify(record));
  return { url: slug.startsWith("incognito-") ? incognitoShareUrl(code) : shareUrl(slug, code), slug, code, hours };
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
  const hours = record.hours === INCOGNITO_HOURS ? INCOGNITO_HOURS : SHARE_HOURS;
  const now = Date.now();
  if (record.expiresAt && now > Date.parse(record.expiresAt)) {
    return { status: "expired" as const, hours };
  }
  if (!record.firstViewedAt) {
    record.firstViewedAt = new Date(now).toISOString();
    record.expiresAt = new Date(now + hours * HOUR_MS).toISOString();
    record.hours = hours;
    await writeRaw(code, JSON.stringify(record));
  }
  return {
    status: "ready" as const,
    html: record.html,
    expiresAt: record.expiresAt ?? "",
    firstViewedAt: record.firstViewedAt ?? "",
    hours,
  };
}
