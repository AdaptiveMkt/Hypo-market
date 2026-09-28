import { HOME24_FROM_44HR } from "@/lib/costs";

const PAGE = "https://www.ltcnews.com/long-term-care/cost-of-care";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const SERVICES = [
  "Home Healthcare",
  "Adult Day Care",
  "Assisted Living",
  "Memory Care",
  "Nursing Home",
] as const;

export type LtcNewsCityCosts = {
  city: string;
  state: string;
  label: string;
  source: string;
  /** 44-hour-week home health annual median from LTC News. */
  home44Annual: number;
  /** This model's around-the-clock figure: 44-hour annual × 2.8. */
  home24Annual: number;
  assistedAnnual: number;
  memoryAnnual: number;
  nursingAnnual: number;
  adultDayAnnual: number | null;
};

function dollars(raw: string): number {
  const n = Number(raw.replace(/[$,]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function decodeSnap(raw: string): string {
  return raw.split("&" + "quot;").join('"').split("&" + "#039;").join("'").split("&" + "amp;").join("&");
}

function annualFromCard(html: string, title: string): number {
  const start = html.indexOf(`>${title}<`);
  if (start < 0) return 0;
  let end = html.length;
  for (const other of SERVICES) {
    if (other === title) continue;
    const at = html.indexOf(`>${other}<`, start + title.length);
    if (at > start && at < end) end = at;
  }
  const amounts = [...html.slice(start, end).matchAll(/\$([0-9,]+)/g)].map((m) => dollars(m[1]));
  if (amounts.length >= 9) return amounts[8];
  if (amounts.length >= 6) return amounts[5];
  return 0;
}

function cookieHeader(res: Response): string {
  const raw = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  return raw
    .map((row) => row.split(";")[0])
    .filter(Boolean)
    .join("; ");
}

async function livewire(
  cookie: string,
  token: string,
  xsrf: string,
  components: unknown[],
): Promise<{
  components: { snapshot: string; effects?: { html?: string; dispatches?: { params?: unknown[] }[] } }[];
}> {
  const res = await fetch("https://www.ltcnews.com/livewire/update", {
    method: "POST",
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Livewire": "",
      "X-CSRF-TOKEN": token,
      "X-XSRF-TOKEN": xsrf,
      Referer: PAGE,
      Origin: "https://www.ltcnews.com",
      Cookie: cookie,
    },
    body: JSON.stringify({ _token: token, components }),
  });
  if (!res.ok) throw new Error("LTC News did not return cost data.");
  return (await res.json()) as {
    components: { snapshot: string; effects?: { html?: string; dispatches?: { params?: unknown[] }[] } }[];
  };
}

/** City medians from the LTC News Cost of Care Calculator. Throws if the city is not found. */
export async function fetchLtcNewsCityCosts(city: string, state: string): Promise<LtcNewsCityCosts> {
  const place = city.trim();
  const region = state.trim();
  if (place.length < 2 || !region) throw new Error("Enter a city and a care state.");

  const page = await fetch(PAGE, { headers: { "User-Agent": UA, Accept: "text/html" } });
  if (!page.ok) throw new Error("LTC News cost calculator is unavailable.");
  const html = await page.text();
  const cookie = cookieHeader(page);
  const token = html.match(/name="_token" content="([^"]+)"/)?.[1];
  if (!token) throw new Error("LTC News cost calculator is unavailable.");
  const xsrf = decodeURIComponent(cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? "");
  const snaps = [...html.matchAll(/wire:snapshot="([^"]+)"/g)].map((m) => decodeSnap(m[1]));
  const searchSnap = snaps.find((s) => s.includes("location-search"));
  const parentSnap = snaps.find((s) => s.includes("future-cost-calculator"));
  if (!searchSnap || !parentSnap) throw new Error("LTC News cost calculator is unavailable.");

  const query = `${place}, ${region}`;
  const searched = await livewire(cookie, token, xsrf, [
    { snapshot: searchSnap, updates: { query }, calls: [{ path: "", method: "search", params: [] }] },
  ]);
  const searchHtml = searched.components[0]?.effects?.html ?? "";
  if (/No results found/i.test(searchHtml)) {
    throw new Error(`LTC News has no cost match for ${query}.`);
  }
  const params = searched.components[0]?.effects?.dispatches?.[0]?.params?.[0];
  if (!params) throw new Error(`LTC News has no cost match for ${query}.`);

  const priced = await livewire(cookie, token, xsrf, [
    {
      snapshot: parentSnap,
      updates: {},
      calls: [{ path: "", method: "__dispatch", params: ["refresh-location", params] }],
    },
  ]);
  const card = priced.components[0]?.effects?.html ?? "";
  const home44 = annualFromCard(card, "Home Healthcare");
  const assisted = annualFromCard(card, "Assisted Living");
  const memory = annualFromCard(card, "Memory Care");
  const nursing = annualFromCard(card, "Nursing Home");
  const adult = annualFromCard(card, "Adult Day Care");
  if (!home44 || !assisted || !nursing) {
    throw new Error(`LTC News did not publish a full cost set for ${query}.`);
  }
  return {
    city: place,
    state: region,
    label: `${place}, ${region}`,
    source: PAGE,
    home44Annual: home44,
    home24Annual: Math.round(home44 * HOME24_FROM_44HR),
    assistedAnnual: assisted,
    memoryAnnual: memory || Math.round(assisted * 1.25),
    nursingAnnual: nursing,
    adultDayAnnual: adult || null,
  };
}
