import { Cite } from "@/components/source-links";
import { SRC } from "@/lib/sources";
import { money } from "@/lib/utils";
import type { PolicyKind } from "@/lib/calc";
import { isLinkedKind } from "@/lib/calc";
import {
  COMBO_MARKET,
  INFLATION_BY_AGE,
  LINKED_BENEFIT_FEATURES,
  LTC_ANNUITY_FEATURES,
  WHAT_CONSUMERS_BUY_FEATURES,
  WHAT_CONSUMERS_BUY_INFORCE,
  WHAT_CONSUMERS_BUY_INTRO,
  WHAT_CONSUMERS_BUY_INFLATION_ANCHOR,
  WHAT_CONSUMERS_BUY_MARKET,
} from "@/lib/what-consumers-buy";

function MiniTable({
  rows,
}: {
  rows: { item: string; share: string }[];
}) {
  return (
    <table className="mt-2 w-full text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-muted">
          <th className="py-1 pr-2">Feature</th>
          <th className="py-1 text-right">Published mix</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.item} className="border-t border-line">
            <td className="py-1.5 pr-2 text-navy">{r.item}</td>
            <td className="py-1.5 text-right tabular-nums">{r.share}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function WhatConsumersBuyPanel({
  ageToday = 0,
  kind = "traditional",
}: {
  ageToday?: number;
  kind?: PolicyKind;
}) {
  if (isLinkedKind(kind)) {
    return <ComboConsumersBuyPanel ageToday={ageToday} kind={kind} />;
  }
  const f = WHAT_CONSUMERS_BUY_FEATURES;
  return (
    <div className="mt-2 text-sm text-muted">
      <p>{WHAT_CONSUMERS_BUY_INTRO}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {WHAT_CONSUMERS_BUY_MARKET.map((c) => (
          <div key={c.label} className="card px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
            <p className="font-display text-lg tabular-nums text-navy">{c.value}</p>
            <p className="mt-1 text-xs">{c.note}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Daily / monthly benefit at issue</p>
          <MiniTable rows={f.monthly} />
          <p className="mt-2 text-xs">{f.monthlyNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Benefit period (stand-alone)</p>
          <MiniTable rows={f.benefitPeriod} />
          <p className="mt-2 text-xs">{f.benefitPeriodNote}</p>
        </div>
        <div
          id={WHAT_CONSUMERS_BUY_INFLATION_ANCHOR}
          className="scroll-mt-8 card px-3 py-3"
        >
          <p className="font-semibold text-navy">Inflation / benefit-increase options</p>
          <MiniTable rows={f.inflation} />
          <p className="mt-2 text-xs">{f.inflationNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Elimination period</p>
          <MiniTable rows={f.elim} />
          <p className="mt-2 text-xs">{f.elimNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Other riders (couples and extras)</p>
          <MiniTable rows={f.riders} />
          <p className="mt-2 text-xs">{f.ridersNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Age and gender of buyers</p>
          <MiniTable rows={f.who} />
          <p className="mt-2 text-xs">{f.whoNote}</p>
        </div>
      </div>
      <p className="mt-3">{WHAT_CONSUMERS_BUY_INFORCE}</p>
      <InflationByAgePanel ageToday={ageToday} />
      <p className="mt-2 text-xs">
        <Cite href={SRC.millimanSurvey2025}>2025 Milliman LTCI Survey (Broker World PDF)</Cite>
        {" · "}
        <Cite href={SRC.limra}>LIMRA combination sales</Cite>
        {" · "}
        <Cite href={SRC.aaltciPrice2026}>AALTCI 2026 Price Index</Cite>
        {" · "}
        <Cite href={SRC.millimanPeak2026}>Milliman 2026 industry claims projection</Cite>
        . Educational only — not a quote.
      </p>
    </div>
  );
}

function ComboConsumersBuyPanel({
  ageToday = 0,
  kind,
}: {
  ageToday?: number;
  kind: PolicyKind;
}) {
  const f = LINKED_BENEFIT_FEATURES;
  const annuity = kind === "ltcAnnuity";
  return (
    <div className="mt-2 text-sm text-muted">
      <p>{annuity ? LTC_ANNUITY_FEATURES.intro : f.intro}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {COMBO_MARKET.map((c) => (
          <div key={c.label} className="card px-3 py-3">
            <p className="text-xs uppercase tracking-wide text-muted">{c.label}</p>
            <p className="font-display text-lg tabular-nums text-navy">{c.value}</p>
            <p className="mt-1 text-xs">{c.note}</p>
          </div>
        ))}
      </div>
      {annuity ? (
        <div className="mt-3 card px-3 py-3">
          <p className="font-semibold text-navy">Long-term care annuity — what is published</p>
          <MiniTable rows={LTC_ANNUITY_FEATURES.rows} />
          <p className="mt-2 text-xs">{LTC_ANNUITY_FEATURES.note}</p>
        </div>
      ) : null}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">What combination buyers purchase</p>
          <MiniTable rows={f.design} />
          <p className="mt-2 text-xs">{f.designNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Monthly LTC benefit</p>
          <MiniTable rows={f.monthly} />
          <p className="mt-2 text-xs">{f.monthlyNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Leverage / extension of benefits</p>
          <MiniTable rows={f.leverage} />
          <p className="mt-2 text-xs">{f.leverageNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">Elimination period</p>
          <MiniTable rows={f.elim} />
          <p className="mt-2 text-xs">{f.elimNote}</p>
        </div>
        <div
          id={WHAT_CONSUMERS_BUY_INFLATION_ANCHOR}
          className="scroll-mt-8 card px-3 py-3"
        >
          <p className="font-semibold text-navy">Inflation vs extension of benefits</p>
          <MiniTable rows={f.inflation} />
          <p className="mt-2 text-xs">{f.inflationNote}</p>
        </div>
        <div className="card px-3 py-3">
          <p className="font-semibold text-navy">
            AALTCI linked-benefit cost example (age 55 only)
          </p>
          <MiniTable rows={f.deposit} />
          <p className="mt-2 text-xs">{f.depositNote}</p>
        </div>
      </div>
      <p className="mt-3 text-xs">
        Age today {ageToday || "—"}. Combo mix is not published inside five-year issue
        bands.{" "}
        <Cite href={SRC.eyHybrid}>EY 2025 — Hybrid insurance on the rise (LIMRA 2024)</Cite>
        {" · "}
        <Cite href={SRC.millimanSurvey2025}>2025 Milliman LTCI Survey</Cite>
        {" · "}
        <Cite href={SRC.aaltciCosts2024}>AALTCI linked-benefit cost examples</Cite>
        {" · "}
        <Cite href={SRC.limra}>LIMRA</Cite>
        . Educational only — not a quote.
      </p>
    </div>
  );
}

export function InflationByAgePanel({
  ageToday = 0,
  compact = false,
}: {
  ageToday?: number;
  compact?: boolean;
}) {
  const d = INFLATION_BY_AGE;
  const band =
    ageToday >= 76 ? "76+" : ageToday >= 61 ? "61–75" : ageToday >= 18 ? "Under 61" : "";
  return (
    <div className={compact ? "text-sm text-muted" : "mt-4 text-sm text-muted"}>
      <p className="font-semibold text-navy">What people typically buy as benefits grow</p>
      <p className="mt-1">{d.intro}</p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-1 pr-2">Issue age</th>
              <th className="py-1 pr-2">Partnership inflation rule</th>
              <th className="py-1">What 2024 sales look like</th>
            </tr>
          </thead>
          <tbody>
            {d.partnership.map((r) => (
              <tr
                key={r.age}
                className={`border-t border-line align-top ${band === r.age ? "bg-gold/20" : ""}`}
              >
                <td className="py-1.5 pr-2 font-semibold text-navy">
                  {r.age}
                  {band === r.age ? " · this run" : ""}
                </td>
                <td className="py-1.5 pr-2">{r.rule}</td>
                <td className="py-1.5">{r.typical}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2">{d.millimanAge}</p>
      <p className="mt-2">{d.gender}</p>
      <p className="mt-3 font-semibold text-navy">
        AALTCI 2026 Price Index — annual premium by age, gender, and inflation
      </p>
      <p className="mt-1 text-xs">
        Illinois, $165,000 initial pool, select health, July 2026. Unstarred cells are
        published Index figures. <sup>*</sup> Scaled from age 55 using a published 2026 3%
        ratio. Age 70+ is not in the Index.
      </p>
      <div className="mt-2 grid gap-3 lg:grid-cols-2">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-1 pr-2">Age</th>
                <th className="py-1 pr-2 text-right">Man, level</th>
                <th className="py-1 pr-2 text-right">Man, 3%</th>
                <th className="py-1 pr-2 text-right">Man, 5%</th>
                <th className="py-1 pr-2 text-right">Woman, level</th>
                <th className="py-1 pr-2 text-right">Woman, 3%</th>
                <th className="py-1 text-right">Woman, 5%</th>
              </tr>
            </thead>
            <tbody>
              {d.premiums.map((r) => {
                const hi = ageToday >= 18 && Math.abs(ageToday - r.age) <= 2;
                const pub = new Set(r.published);
                return (
                  <tr
                    key={r.age}
                    className={`border-t border-line tabular-nums ${hi ? "bg-gold/20" : ""}`}
                  >
                    <td className="py-1.5 pr-2 font-semibold text-navy">
                      {r.age}
                      {hi ? " · near this run" : ""}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {money(r.m0)}
                      {pub.has("m0") ? "" : "*"}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {money(r.m3)}
                      {pub.has("m3") ? "" : "*"}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {money(r.m5)}
                      {pub.has("m5") ? "" : "*"}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {money(r.f0)}
                      {pub.has("f0") ? "" : "*"}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {money(r.f3)}
                      {pub.has("f3") ? "" : "*"}
                    </td>
                    <td className="py-1.5 text-right">
                      {money(r.f5)}
                      {pub.has("f5") ? "" : "*"}
                    </td>
                  </tr>
                );
              })}
              <tr className={`border-t border-line ${ageToday >= 68 ? "bg-gold/20" : ""}`}>
                <td className="py-1.5 pr-2 font-semibold text-navy">
                  70+
                  {ageToday >= 68 ? " · this run" : ""}
                </td>
                <td className="py-1.5 text-muted" colSpan={6}>
                  Not published by the 2026 Index
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[280px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-1 pr-2">Couple, both same age</th>
                <th className="py-1 pr-2 text-right">Level</th>
                <th className="py-1 pr-2 text-right">3% cpd</th>
                <th className="py-1 text-right">5% cpd</th>
              </tr>
            </thead>
            <tbody>
              {d.premiums.map((r) => {
                const hi = ageToday >= 18 && Math.abs(ageToday - r.age) <= 2;
                const pub = new Set(r.published);
                return (
                  <tr
                    key={`c-${r.age}`}
                    className={`border-t border-line tabular-nums ${hi ? "bg-gold/20" : ""}`}
                  >
                    <td className="py-1.5 pr-2 font-semibold text-navy">{r.age}</td>
                    <td className="py-1.5 pr-2 text-right">
                      {money(r.c0)}
                      {pub.has("c0") ? "" : "*"}
                    </td>
                    <td className="py-1.5 pr-2 text-right">
                      {money(r.c3)}
                      {pub.has("c3") ? "" : "*"}
                    </td>
                    <td className="py-1.5 text-right">
                      {money(r.c5)}
                      {pub.has("c5") ? "" : "*"}
                    </td>
                  </tr>
                );
              })}
              <tr className={`border-t border-line ${ageToday >= 68 ? "bg-gold/20" : ""}`}>
                <td className="py-1.5 pr-2 font-semibold text-navy">70+</td>
                <td className="py-1.5 text-muted" colSpan={3}>
                  Not published
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs font-semibold text-navy">
            Illinois couple both 60, $165,000 each, 3% compound — five carriers (July 2026)
          </p>
          <table className="mt-1 w-full min-w-[240px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-1 pr-2">Carrier (unnamed in Index)</th>
                <th className="py-1 text-right">Combined annual</th>
              </tr>
            </thead>
            <tbody>
              {d.ilCouple60_3pct.map((n, i) => (
                <tr key={n} className="border-t border-line tabular-nums">
                  <td className="py-1 pr-2">Company {i + 1}</td>
                  <td className="py-1 text-right">{money(n)}</td>
                </tr>
              ))}
              <tr className="border-t border-line tabular-nums font-semibold">
                <td className="py-1 pr-2">Average (used at age 60 couple 3%)</td>
                <td className="py-1 text-right">
                  {money(
                    Math.round(
                      d.ilCouple60_3pct.reduce((a, b) => a + b, 0) / d.ilCouple60_3pct.length,
                    ),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-2 text-xs">{d.premiumNote}</p>
      <p className="mt-1 text-xs">
        Source:{" "}
        <Cite href={SRC.aaltciPrice2026}>2026 AALTCI Long-Term Care Insurance Price Index</Cite>
        . Not a quote.
      </p>
      <p className="mt-2 text-xs">{d.millimanMix}</p>
      <p className="mt-2 text-xs">{d.age70}</p>
    </div>
  );
}
