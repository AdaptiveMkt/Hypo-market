import { createServerFn } from "@tanstack/react-start";
import { fetchLtcNewsCityCosts, type LtcNewsCityCosts } from "@/lib/ltc-news-lookup";

export type { LtcNewsCityCosts };

export const lookupLtcNewsCity = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const o = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    const city = String(o.city ?? "").trim().slice(0, 80);
    const state = String(o.state ?? "").trim().slice(0, 40);
    if (city.length < 2) throw new Error("Enter a city.");
    if (!state) throw new Error("Select a care state first.");
    return { city, state };
  })
  .handler(async ({ data }): Promise<{ ok: true; costs: LtcNewsCityCosts } | { ok: false; error: string }> => {
    try {
      const costs = await fetchLtcNewsCityCosts(data.city, data.state);
      return { ok: true, costs };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Could not load LTC News costs." };
    }
  });
