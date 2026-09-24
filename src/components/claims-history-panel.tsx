import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TitleCollapse } from "@/components/accordion";
import { Cite } from "@/components/source-links";
import { SRC } from "@/lib/sources";
import { CHART } from "@/lib/palette";
import { money } from "@/lib/utils";
import {
  AALTCI_2024_SAMPLE,
  CLAIMANT_CHART,
  CLAIMS_CHART,
  CLAIMS_SERIES,
  CLAIM_CAUSES,
  GENWORTH_CLAIMS,
  GENWORTH_RATIO_CHART,
  GENWORTH_RATIOS,
  INDUSTRY_CONTEXT,
  LIMRA_COMBO,
  MILLIMAN_SURVEY_2025,
  RATE_STABILITY,
  REPORTING_HISTORY,
  SOA_LIMRA,
  UW_DECLINES,
} from "@/lib/claims-history";

export const UW_DECLINES_ANCHOR = "uw-declines";

export function ClaimsHistoryPanel({
  defaultOpen = false,
}: {
  defaultOpen?: boolean;
}) {
  const s = AALTCI_2024_SAMPLE;
  const g = GENWORTH_CLAIMS;
  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Private long-term care insurance has been paying claims for decades — first as
        nursing-home-only contracts in the 1970s, then as comprehensive policies that
        also reimburse home care and assisted living. The figures below are{" "}
        <strong className="text-navy">published industry snapshots</strong>, not this
        run’s projection and not a promise that any one policy will pay.{" "}
        <em>Paid</em> benefits (cash out the door) are not the same as{" "}
        <em>incurred</em> claims (paid plus reserve changes). Traditional stand-alone
        LTCI is easier to tally than linked-benefit / hybrid products.
      </p>

      <TitleCollapse title="Claim history — benefits paid and people on claim" className="mt-3" defaultOpen={defaultOpen}>
      <div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Traditional LTCI paid, 2023</p>
          <p className="font-display text-lg tabular-nums text-navy">$14.1 billion</p>
          <p className="text-xs text-muted">
            About 353,000 people.{" "}
            <Cite href={SRC.aaltci2023Paid}>AALTCI, Jan 2024</Cite>
          </p>
        </div>
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Stand-alone incurred, 2024</p>
          <p className="font-display text-lg tabular-nums text-navy">~$17 billion</p>
          <p className="text-xs text-muted">
            NAIC Experience Forms.{" "}
            <Cite href={SRC.milliman2024}>Milliman, Dec 2025</Cite>
          </p>
        </div>
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Genworth benefits paid</p>
          <p className="font-display text-lg tabular-nums text-navy">~$35 billion</p>
          <p className="text-xs text-muted">
            Through 31 Dec 2025; $32B / 389k+ claims through 2024.{" "}
            <Cite href={SRC.genworthLtcExp}>Genworth / CareScout</Cite>
          </p>
        </div>
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Average claim size, 2024</p>
          <p className="font-display text-lg tabular-nums text-navy">~$180,000</p>
          <p className="text-xs text-muted">
            vs ~$110,000 in 2015.{" "}
            <Cite href={SRC.milliman2024}>Milliman / NAIC</Cite>
          </p>
        </div>
      </div>

      <h3 className="mb-2 font-display text-lg text-navy">Benefits paid and incurred over time</h3>
      <p className="mb-3 text-sm text-muted">
        Bars are AALTCI <strong>paid</strong> totals for traditional LTCI in the years they
        published a nationwide number. The line is Milliman/NAIC <strong>incurred</strong>{" "}
        (2023–2024). Gaps are years without a comparable published total — not years with
        zero claims.
      </p>
      <div className="mb-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={CLAIMS_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: CHART.tick, fontSize: 12 }} />
            <YAxis
              tick={{ fill: CHART.tick, fontSize: 12 }}
              tickFormatter={(v: number) => `$${v}B`}
            />
            <Tooltip
              formatter={(v, name) => [`$${Number(v).toFixed(1)} billion`, String(name)]}
              contentStyle={{ background: CHART.paper, border: `1px solid ${CHART.grid}`, borderRadius: 8 }}
            />
            <Legend />
            <Bar dataKey="paid" name="Paid (AALTCI, $B)" fill={CHART.cost} radius={[4, 4, 0, 0]} />
            <Line
              type="monotone"
              dataKey="incurred"
              name="Incurred (NAIC/Milliman, $B)"
              stroke={CHART.remaining}
              strokeWidth={2.5}
              connectNulls
              dot={{ r: 4, fill: CHART.remaining }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <h3 className="mb-2 font-display text-lg text-navy">People on claim</h3>
      <div className="mb-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={CLAIMANT_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: CHART.tick, fontSize: 12 }} />
            <YAxis tick={{ fill: CHART.tick, fontSize: 12 }} tickFormatter={(v: number) => `${v}k`} />
            <Tooltip
              formatter={(v) => [`${Number(v)} thousand people`, "On claim (published)"]}
              contentStyle={{ background: CHART.paper, border: `1px solid ${CHART.grid}`, borderRadius: 8 }}
            />
            <Bar dataKey="claimants" name="People on claim (thousands)" fill={CHART.insurance} radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">Year</th>
              <th className="py-2 pr-2 text-right">Paid</th>
              <th className="py-2 pr-2 text-right">Incurred</th>
              <th className="py-2 pr-2 text-right">People</th>
              <th className="py-2">Published note</th>
            </tr>
          </thead>
          <tbody>
            {CLAIMS_SERIES.filter((r) => r.year >= 2022).map((r) => (
              <tr key={r.year} className="border-t border-line align-top">
                <td className="py-2 pr-2 font-semibold tabular-nums text-navy">{r.year}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{r.paidB != null ? `$${r.paidB}B` : "—"}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{r.incurredB != null ? `$${r.incurredB}B` : "—"}</td>
                <td className="py-2 pr-2 text-right tabular-nums">
                  {r.claimantsK != null ? `${r.claimantsK}k` : "—"}
                </td>
                <td className="py-2 text-muted">
                  {r.note} <span className="block text-xs">{r.source}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mb-2 font-display text-lg text-navy">Where claims are used (AALTCI samples)</h3>
      <p className="mb-3 text-sm text-muted">
        Jesse Slome of <Cite href={SRC.aaltci}>AALTCI</Cite> has long described LTCI as
        “nursing-home-avoidance” coverage: most dollars now go to home care and assisted
        living, not a skilled-nursing bed. The 2024 Connecticut Partnership sample is the
        latest detailed mix AALTCI circulated — useful for mix, not a nationwide census.
      </p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">2024 CT Partnership sample</p>
          <p className="mt-1 text-muted">{s.note}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>
              {s.claimants.toLocaleString("en-US")} claimants of {s.policies.toLocaleString("en-US")}{" "}
              in-force policies
            </li>
            <li>
              {s.femalePct}% female / {s.malePct}% male; {s.marriedPct}% married
            </li>
            <li>
              Bought at average age {s.buyAge}; claimed at mean age {s.claimAgeMean} (range{" "}
              {s.claimAgeRange})
            </li>
            <li>
              Paid-to-date {money(s.paidMin)} to {money(s.paidMax)}
            </li>
            <li>
              Home health aide {s.homeAidePct}% · assisted living {s.alPct}% · nursing home{" "}
              {s.nursingPct}% · skilled home visit {s.snVisitPct}%
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted">
            <Cite href={SRC.aaltci2024Claims}>AALTCI, 16 Sep 2024</Cite> (citing the
            Connecticut Partnership for Long-Term Care).
          </p>
        </div>
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">Largest published claims (illustrative)</p>
          <p className="mt-1 text-muted">
            Tail claims last years and can exceed $1 million. They are rare relative to
            the typical paid claim, which is why a benefit period and inflation rider
            change this model’s shortfall so much.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>
              2024 CT sample max paid-to-date {money(s.paidMax)}.{" "}
              <Cite href={SRC.aaltci2024Claims}>AALTCI 2024 claims</Cite>
            </li>
            <li>
              Mean paid-to-date in an earlier Connecticut Partnership cut (2022 AALTCI
              write-up): about $142,000; largest $1.9 million.
            </li>
          </ul>
        </div>
      </div>
      </div>
      </TitleCollapse>

      <TitleCollapse title="Why claims start, and why applications are declined" defaultOpen={defaultOpen}>
      <div>
      <p className="mb-3 text-sm text-muted">
        Two different questions. <strong className="text-navy">Claim cause</strong> is
        why an already-issued policy starts paying.{" "}
        <strong className="text-navy">Underwriting decline</strong> is why a new
        application never becomes a policy. Tax-qualified policies generally pay when
        two of six ADLs are expected to last 90+ days, or there is severe cognitive
        impairment needing supervision, after the elimination period.
      </p>

      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">Primary reasons new claims start</p>
          <p className="mt-1 text-muted">{CLAIM_CAUSES.note}</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-1 pr-2">Initial cause</th>
                  <th className="py-1 text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {CLAIM_CAUSES.overall.map((r) => (
                  <tr key={r.cause} className="border-t border-line">
                    <td className="py-1.5 pr-2">
                      <span className="font-semibold text-navy">{r.cause}</span>
                      <span className="block text-xs text-muted">{r.note}</span>
                    </td>
                    <td className="py-1.5 text-right tabular-nums">{r.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">Cause by age band</p>
          <p className="mt-1 text-muted">
            Younger claims are more often cancer, injury, or nervous-system disease.
            After 75, Alzheimer’s dominates both home care and facility claims.
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-1 pr-2">Age</th>
                  <th className="py-1 pr-2">Home care</th>
                  <th className="py-1">Facility</th>
                </tr>
              </thead>
              <tbody>
                {CLAIM_CAUSES.byAge.map((r) => (
                  <tr key={r.age} className="border-t border-line align-top">
                    <td className="py-1.5 pr-2 font-semibold text-navy">{r.age}</td>
                    <td className="py-1.5 pr-2">{r.home}</td>
                    <td className="py-1.5">
                      {r.facility}
                      <span className="block text-xs text-muted">{r.extra}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-semibold text-navy">When claims begin</p>
          <p className="mt-1 text-xs text-muted">{CLAIM_CAUSES.whenClaimsBeginNote}</p>
          <p className="mt-2 text-xs text-muted">
            <Cite href={SRC.aaltci2024Claims}>AALTCI 2024 LTCI claims data</Cite>
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">Share of applicants declined, by age</p>
          <p className="mt-1 text-muted">{UW_DECLINES.milliman2024Note}</p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-1 pr-2">Issue age</th>
                  <th className="py-1 text-right">Declined (2024)</th>
                </tr>
              </thead>
              <tbody>
                {UW_DECLINES.milliman2024.map((r) => (
                  <tr key={r.age} className="border-t border-line tabular-nums">
                    <td className="py-1.5 pr-2 font-semibold text-navy">{r.age}</td>
                    <td className="py-1.5 text-right">{r.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted">
            <Cite href={SRC.millimanSurvey2025}>2025 Milliman LTCI Survey</Cite>
          </p>
        </div>
        <div
          id={UW_DECLINES_ANCHOR}
          className="scroll-mt-8 card px-4 py-3 text-sm"
        >
          <p className="font-semibold text-navy">Primary reasons coverage is declined</p>
          <p className="mt-1 text-muted">{UW_DECLINES.note}</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-muted">
            {UW_DECLINES.reasons.map((t) => (
              <li key={t.slice(0, 48)}>{t}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            <Cite href={SRC.millimanSurvey2025}>2025 Milliman LTCI Survey</Cite>
          </p>
        </div>
      </div>
      </div>
      </TitleCollapse>

      <TitleCollapse title="Rate stability and loss ratios" defaultOpen={defaultOpen}>
      <div>
      <p className="mb-3 text-sm text-muted">{RATE_STABILITY.intro}</p>
      <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-muted">
        {RATE_STABILITY.bullets.map((b) => (
          <li key={b.slice(0, 48)}>{b}</li>
        ))}
      </ul>
      <h3 className="mb-2 font-display text-lg text-navy">One carrier’s book: Genworth</h3>
      <p className="mb-3 text-sm text-muted">
        {g.note} That is the deepest public claims dataset in the U.S. market, and the
        same organization (via CareScout) publishes the Cost of Care survey this
        hypothetical uses for state medians. Paying claims and raising in-force premiums
        are both part of the record: Genworth reports about $34.5 billion NPV of approved
        in-force rate actions since 2012.{" "}
        <Cite href={SRC.genworthLtcExp}>Genworth experience / 4Q 2025</Cite>
      </p>

      <h3 className="mb-2 font-display text-lg text-navy">Genworth claims ratios — three different numbers</h3>
      <p className="mb-3 text-sm text-muted">
        “Claims ratio” is used three ways, and they are not interchangeable.{" "}
        <strong className="text-navy">Calendar-year loss ratio</strong> is incurred
        claims ÷ earned premiums <em>this year</em>.{" "}
        <strong className="text-navy">Lifetime / inception-to-date loss ratio</strong>{" "}
        is the same fraction over the whole history of the block (what rate filings
        target). <strong className="text-navy">Actual-to-expected (A/E)</strong> is
        how this year’s claims, deaths, and lapses compared with the company’s current
        best-estimate model — a dollar variance, not a percent of premium.
      </p>
      <p className="mb-3 text-sm text-muted">
        A calendar-year ratio over 100% does <em>not</em> mean the company paid more
        than it will ever collect. LTC is prefunded: most premium arrives in the
        healthy years; most claims arrive after age 80. Once a closed block is in its
        claim years, the current-year ratio is supposed to print above 100%. The
        industry individual Form 1 current ratio was{" "}
        <strong className="text-navy">129.2%</strong> in 2024; inception-to-date was{" "}
        <strong className="text-navy">66.9%</strong>.{" "}
        <Cite href={SRC.naicLtcExp}>NAIC LTCI Experience Report 2024, Form 1</Cite>
      </p>

      <div className="mb-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={GENWORTH_RATIO_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 28 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
            <XAxis dataKey="label" interval={0} tick={{ fill: CHART.tick, fontSize: 10 }} />
            <YAxis tick={{ fill: CHART.tick, fontSize: 12 }} tickFormatter={(v: number) => `${v}%`} />
            <Tooltip
              formatter={(v) => [`${Number(v).toFixed(1)}%`, "Loss ratio"]}
              contentStyle={{ background: CHART.paper, border: `1px solid ${CHART.grid}`, borderRadius: 8 }}
            />
            <Bar dataKey="ratio" name="Loss ratio %" fill={CHART.remaining} radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">2024 Form 1 (direct)</th>
              <th className="py-2 pr-2 text-right">Earned premium</th>
              <th className="py-2 pr-2 text-right">Incurred claims</th>
              <th className="py-2 pr-2 text-right">Loss ratio</th>
              <th className="py-2 text-right">Open claims</th>
            </tr>
          </thead>
          <tbody>
            {GENWORTH_RATIOS.calendar.map((r) => (
              <tr key={r.label} className="border-t border-line tabular-nums">
                <td className="py-2 pr-2 font-semibold text-navy">{r.label}</td>
                <td className="py-2 pr-2 text-right">${r.earnedM.toLocaleString("en-US")}M</td>
                <td className="py-2 pr-2 text-right">${r.incurredM.toLocaleString("en-US")}M</td>
                <td className="py-2 pr-2 text-right">{r.ratio.toFixed(1)}%</td>
                <td className="py-2 text-right">
                  {r.openClaims != null ? r.openClaims.toLocaleString("en-US") : "—"}
                </td>
              </tr>
            ))}
            <tr className="border-t border-gold bg-cream font-semibold tabular-nums">
              <td className="py-2 pr-2 text-navy">GLIC + GLIC of NY</td>
              <td className="py-2 pr-2 text-right">
                ${GENWORTH_RATIOS.combined.earnedM.toLocaleString("en-US")}M
              </td>
              <td className="py-2 pr-2 text-right">
                ${GENWORTH_RATIOS.combined.incurredM.toLocaleString("en-US")}M
              </td>
              <td className="py-2 pr-2 text-right">{GENWORTH_RATIOS.combined.ratio.toFixed(1)}%</td>
              <td className="py-2 text-right">
                {GENWORTH_RATIOS.combined.openClaims.toLocaleString("en-US")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mb-4 text-xs text-muted">{GENWORTH_RATIOS.naicNote}</p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">Lifetime ratio — Choice I example</p>
          <p className="mt-1 text-muted">{GENWORTH_RATIOS.choiceI.note}</p>
          <p className="mt-2 text-muted">
            Original priced lifetime loss ratio{" "}
            <strong className="text-navy">{GENWORTH_RATIOS.choiceI.originalLlr}%</strong>
            {" "}→ 2024 best-estimate{" "}
            <strong className="text-navy">{GENWORTH_RATIOS.choiceI.updatedLlr}%</strong>
            {" "}({GENWORTH_RATIOS.choiceI.limited}% limited-benefit / {GENWORTH_RATIOS.choiceI.lifetime}%
            lifetime-benefit). That gap is why in-force rate actions and benefit-reduction
            offers exist.{" "}
            <Cite href={SRC.genworthChoiceI}>VA SERFF Choice I, Sep 2025</Cite>
          </p>
        </div>
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">A/E — claims running hotter than the model</p>
          <p className="mt-1 text-muted">
            Since LDTI, Genworth books a quarterly gap when actual claims, lapses, and
            deaths miss the long-term assumption. Unfavorable A/E has been driven by{" "}
            <em>higher claims</em> and <em>lower terminations</em> (people living longer
            on claim and keeping policies).{" "}
            <Cite href={SRC.genworth10k2025}>10-K 2025</Cite>
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            {GENWORTH_RATIOS.ae.map((r) => (
              <li key={r.year}>
                {r.year}: ${r.preTaxM} million pre-tax unfavorable. {r.note}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="mb-2 font-display text-lg text-navy">Direct paid claims are still climbing</h3>
      <p className="mb-3 text-sm text-muted">
        GAAP earned premiums on the closed block are drifting down (
        {GENWORTH_RATIOS.gaapPremiums.map((p) => `${p.year} $${(p.premiumsM / 1000).toFixed(2)}B`).join(", ")}
        ) while cash claims rise. Direct paid claims by product (4Q 2024 earnings): $
        {GENWORTH_RATIOS.paidDirect[0].paidM.toLocaleString("en-US")} million in 2020 → $
        {GENWORTH_RATIOS.paidDirect[GENWORTH_RATIOS.paidDirect.length - 1].paidM.toLocaleString("en-US")}{" "}
        million in 2024. Older PCS blocks are past peak age; Choice I (avg age ~78) and
        Choice II (~75) are still heading into peak claim years (85+).{" "}
        {GENWORTH_RATIOS.future.note}{" "}
        <Cite href={SRC.genworth10k2025}>10-K 2025</Cite>
      </p>
      <div className="mb-4 h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={GENWORTH_RATIOS.paidDirect} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fill: CHART.tick, fontSize: 12 }} />
            <YAxis tick={{ fill: CHART.tick, fontSize: 12 }} tickFormatter={(v: number) => `$${v}M`} />
            <Tooltip
              formatter={(v) => [`$${Number(v).toLocaleString("en-US")} million`, "Direct paid claims"]}
              contentStyle={{ background: CHART.paper, border: `1px solid ${CHART.grid}`, borderRadius: 8 }}
            />
            <Bar dataKey="paidM" name="Direct paid claims ($M)" fill={CHART.cost} radius={[4, 4, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className="mb-4 text-sm text-muted">
        What this means for the hypothetical: a policy that is paying is doing what the
        industry’s largest book is doing — reimbursing care, often for years, while the
        carrier’s <em>current-year</em> ratio looks “over 100%.” Solvency is judged on
        reserves, remaining premiums, in-force rate actions, and the lifetime ratio, not
        on one calendar year. This model still treats insurance as paying first only when
        you include a policy in the run; it does not use Genworth’s ratio as this
        client’s claim probability.
      </p>
      </div>
      </TitleCollapse>

      <TitleCollapse title="Reporting history (SOA, LIMRA, NAIC, Milliman)" defaultOpen={defaultOpen}>
      <div>
      <p className="mb-3 text-sm text-muted">{REPORTING_HISTORY.intro}</p>
      <div className="mb-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-2">Source</th>
              <th className="py-2 pr-2">What is reported</th>
              <th className="py-2">Years in this hypo</th>
            </tr>
          </thead>
          <tbody>
            {REPORTING_HISTORY.rows.map((r) => (
              <tr key={r.who} className="border-t border-line align-top">
                <td className="py-2 pr-2 font-semibold text-navy">{r.who}</td>
                <td className="py-2 pr-2 text-muted">{r.what}</td>
                <td className="py-2 text-muted">{r.years}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="mb-2 font-display text-lg text-navy">How the industry got here</h3>
      <ul className="mb-4 list-disc space-y-2 pl-5 text-sm text-muted">
        {INDUSTRY_CONTEXT.map((p) => (
          <li key={p.slice(0, 48)}>{p}</li>
        ))}
      </ul>
      <p className="mb-4 text-sm text-muted">
        Regulator background:{" "}
        <Cite href={SRC.naicLtc}>NAIC Long-Term Care Insurance topic</Cite>. Annual
        company-level earned premium and incurred claims:{" "}
        <Cite href={SRC.naicLtcExp}>NAIC LTCI Experience Report (2024)</Cite>. Forward
        paid-claim path:{" "}
        <Cite href={SRC.millimanPeak}>Milliman 2025 industry claims projection</Cite>.
      </p>

      <h3 className="mb-2 font-display text-lg text-navy">
        SOA and LIMRA — how often claims start, and what is selling now
      </h3>
      <p className="mb-3 text-sm text-muted">
        The Society of Actuaries Research Institute and LIMRA run the industry’s
        intercompany experience studies (incidence, claim termination, lapse, mortality).
        Those tables are why later products are priced with low lapses and age-steep
        incidence — and why early blocks needed rate increases. AALTCI and NAIC count{" "}
        <em>dollars paid</em>; SOA/LIMRA count <em>how often a life becomes a claim</em>.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">SOA 2000–2016 claims</p>
          <p className="font-display text-lg tabular-nums text-navy">
            {SOA_LIMRA.study2016.claims.toLocaleString("en-US")}
          </p>
          <p className="text-xs text-muted">
            {SOA_LIMRA.study2016.companies} carriers, {SOA_LIMRA.study2016.premiumShare}% of
            2016 premium. Published before the five-year source window, so it is not linked.
          </p>
        </div>
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Overall incidence</p>
          <p className="font-display text-lg tabular-nums text-navy">
            {SOA_LIMRA.study2016.incidencePct}%
          </p>
          <p className="text-xs text-muted">
            {SOA_LIMRA.study2016.exposureM} million life-years. Younger durations pull this
            average down.
          </p>
        </div>
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Claim termination / death</p>
          <p className="font-display text-lg tabular-nums text-navy">
            {SOA_LIMRA.study2016.termPct}% / {SOA_LIMRA.study2016.claimMortPct}%
          </p>
          <p className="text-xs text-muted">
            {SOA_LIMRA.study2016.deaths.toLocaleString("en-US")} deaths of{" "}
            {SOA_LIMRA.study2016.terminations.toLocaleString("en-US")} terminations.
          </p>
        </div>
        <div className="rounded-lg bg-cream px-3 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">LIMRA combo premium, 2023</p>
          <p className="font-display text-lg tabular-nums text-navy">
            ${LIMRA_COMBO.individualPremiumM.toLocaleString("en-US")}M
          </p>
          <p className="text-xs text-muted">
            {LIMRA_COMBO.individualPolicies.toLocaleString("en-US")} individual life policies
            with an LTC feature.{" "}
            <Cite href={SRC.limra}>LIMRA</Cite> via{" "}
            <Cite href={SRC.millimanSurvey2025}>Milliman survey</Cite>
          </p>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">{SOA_LIMRA.study2016.note}</p>

      <h4 className="mb-2 text-sm font-semibold text-navy">
        Incidence rises with age
      </h4>
      <p className="mb-4 text-sm text-muted">
        Intercompany incidence tables published before September 2021 are not cited.
        The 4 Aug 2025 SOA, LIMRA, and NAIC update is the current experience-study reference,
        and its report is not in this hypothetical yet.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">LIMRA — what is selling is combination, not stand-alone</p>
          <p className="mt-1 text-muted">{LIMRA_COMBO.note}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
            <li>
              Individual life + LTC feature, 2023: $
              {LIMRA_COMBO.individualPremiumM.toLocaleString("en-US")} million /{" "}
              {LIMRA_COMBO.individualPolicies.toLocaleString("en-US")} policies (avg $
              {LIMRA_COMBO.avgPremium.toLocaleString("en-US")})
            </li>
            <li>
              Linked-benefit: ${LIMRA_COMBO.linkedBenefitPremiumM} million /{" "}
              {LIMRA_COMBO.linkedBenefitPolicies.toLocaleString("en-US")} policies
            </li>
            <li>
              §7702B acceleration of death benefit: ${LIMRA_COMBO.adb7702bPremiumM} million /{" "}
              {LIMRA_COMBO.adb7702bPolicies.toLocaleString("en-US")} policies
            </li>
            <li>
              Milliman survey stand-alone <em>new</em> sales: $
              {MILLIMAN_SURVEY_2025.standAloneNewSalesM} million in 2024 vs $
              {MILLIMAN_SURVEY_2025.standAloneNewSales2023M} million in 2023 — a fraction of
              LIMRA’s combination premium.
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted">
            <Cite href={SRC.limra}>LIMRA combination surveys</Cite> ·{" "}
            <Cite href={SRC.millimanSurvey2025}>2025 Milliman LTCI Survey</Cite>
          </p>
        </div>
        <div className="card px-4 py-3 text-sm">
          <p className="font-semibold text-navy">Milliman survey claims + SOA/LIMRA update</p>
          <p className="mt-1 text-muted">{MILLIMAN_SURVEY_2025.note}</p>
          <p className="mt-2 text-muted">
            {SOA_LIMRA.forthcoming.note}{" "}
            <Cite href={SRC.soaLimraNaic}>SOA / LIMRA / NAIC, 4 Aug 2025</Cite>
          </p>
        </div>
      </div>

      <p className="text-xs text-muted">
        Educational only. AALTCI is a trade association; Milliman is an actuarial
        consultant summarizing NAIC filings and a voluntary survey; Genworth is a
        carrier; LIMRA and the SOA Research Institute publish experience studies and
        sales surveys. None of these figures is this policy’s claim, a loss-ratio, or a
        guarantee of future payments. Confirm current filings with the carrier and the
        state insurance department.
      </p>
      </div>
      </TitleCollapse>
    </div>
  );
}