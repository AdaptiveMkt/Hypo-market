import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { INFLATION_BY_AGE } from "@/lib/what-consumers-buy";
import { moneyCents } from "@/lib/utils";

export const Route = createFileRoute("/commission-calculator")({
  component: CommissionCalculator,
  head: () => ({
    meta: [
      { title: "Commission calculator" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const AGES = [55, 60, 65] as const;
const INFLATION = [
  { id: 0, label: "Level" },
  { id: 3, label: "3% compound" },
  { id: 5, label: "5% compound" },
] as const;

type Age = (typeof AGES)[number];
type Infl = (typeof INFLATION)[number]["id"];

const SOURCE = "https://www.aaltci.org/2026-AALTCI-Long-Term-Care-Insurance-Price-Index/";

function industryPremium(age: Age, infl: Infl) {
  const row = INFLATION_BY_AGE.premiums.find((item) => item.age === age);
  if (!row) return { couple: 5050, single: 2975, man: 2200, woman: 3750 };
  const couple = infl === 0 ? row.c0 : infl === 5 ? row.c5 : row.c3;
  const man = infl === 0 ? row.m0 : infl === 5 ? row.m5 : row.m3;
  const woman = infl === 0 ? row.f0 : infl === 5 ? row.f5 : row.f3;
  return { couple, single: Math.round((man + woman) / 2), man, woman };
}

function num(raw: string) {
  const n = Number(raw.replace(/[$,\s]/g, ""));
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function dollars(n: number) {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function dollarsFromRaw(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";
  const [whole, frac] = cleaned.split(".");
  const shown = Number(whole || "0").toLocaleString("en-US");
  if (raw.trim().endsWith(".") && frac == null) return `$${shown}.`;
  return frac != null ? `$${shown}.${frac.slice(0, 2)}` : `$${shown}`;
}

function CommissionCalculator() {
  const [couples, setCouples] = useState("5");
  const [singles, setSingles] = useState("5");
  const [age, setAge] = useState<Age>(55);
  const [infl, setInfl] = useState<Infl>(3);
  const [couplePrem, setCouplePrem] = useState(dollars(industryPremium(55, 3).couple));
  const [singlePrem, setSinglePrem] = useState(dollars(industryPremium(55, 3).single));
  const [customPrem, setCustomPrem] = useState(false);
  const [fyRate, setFyRate] = useState("55");
  const [renewalRate, setRenewalRate] = useState("8");
  const [laterRate, setLaterRate] = useState("3");

  function useIndustry(nextAge = age, nextInfl = infl) {
    const next = industryPremium(nextAge, nextInfl);
    setCouplePrem(dollars(next.couple));
    setSinglePrem(dollars(next.single));
    setCustomPrem(false);
  }

  const published = industryPremium(age, infl);
  const run = useMemo(() => {
    const coupleCount = num(couples);
    const singleCount = num(singles);
    const coupleAnnual = num(couplePrem);
    const singleAnnual = num(singlePrem);
    const firstPct = Math.min(100, num(fyRate)) / 100;
    const renewalPct = Math.min(100, num(renewalRate)) / 100;
    const laterPct = Math.min(100, num(laterRate)) / 100;
    const couplePremium = coupleCount * coupleAnnual;
    const singlePremium = singleCount * singleAnnual;
    const newPremium = couplePremium + singlePremium;
    const firstYear = newPremium * firstPct;
    const renewalEach = newPremium * renewalPct;
    const laterEach = newPremium * laterPct;
    const classTotal = firstYear + renewalEach * 9 + laterEach * 10;
    let cumulative = 0;
    const years = Array.from({ length: 20 }, (_, index) => {
      const year = index + 1;
      const midClasses = Math.max(0, year - 1 - Math.max(0, year - 10));
      const lateStart = Math.max(1, year - 19);
      const lateEnd = year - 10;
      const lateClasses = lateEnd >= lateStart ? lateEnd - lateStart + 1 : 0;
      const renewal = renewalEach * midClasses + laterEach * lateClasses;
      const total = firstYear + renewal;
      cumulative += total;
      return { year, newPremium, firstYear, renewal, total, cumulative };
    });
    return {
      coupleCount,
      singleCount,
      lives: coupleCount * 2 + singleCount,
      couplePremium,
      singlePremium,
      newPremium,
      firstYear,
      renewalEach,
      laterEach,
      classTotal,
      years,
      twentyYearBook: years[19]?.cumulative ?? 0,
    };
  }, [couples, singles, couplePrem, singlePrem, fyRate, renewalRate, laterRate]);

  return (
    <main id="main-content" className="mx-auto max-w-5xl space-y-5 px-4 py-8 sm:px-6" tabIndex={-1}>
      <section className="card-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">Advisor illustration</p>
        <h1 className="mt-1 font-display text-2xl text-navy">Commission calculator</h1>
        <p className="mt-2 text-sm text-muted">
          This page is not in the site menu. It estimates long-term care insurance commission from the
          number of new clients you enter, an average first-year premium, a first-year commission, the
          renewal rate for years 2 through 10, and a lower rate for years 11 and after.
        </p>
      </section>

      <section className="card-xl p-5">
        <h2 className="border-b-2 border-gold pb-2 font-display text-xl text-navy">New clients, year 1</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-teal">
            Couples per year
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
              inputMode="numeric"
              value={couples}
              onChange={(event) => setCouples(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-teal">
            Single individuals per year
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
              inputMode="numeric"
              value={singles}
              onChange={(event) => setSingles(event.target.value)}
            />
          </label>
        </div>
        <p className="mt-3 text-sm text-muted">
          Defaults are 5 couples and 5 single individuals. A couple is one combined premium for both
          people, not two single premiums. People covered if each couple is two insureds: {run.lives}.
        </p>
      </section>

      <section className="card-xl p-5">
        <h2 className="border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Average annual premium, first year
        </h2>
        <p className="mt-3 text-sm text-muted">
          Industry default is the{" "}
          <a className="text-teal underline underline-offset-2" href={SOURCE} target="_blank" rel="noreferrer">
            2026 AALTCI Long-Term Care Insurance Price Index
          </a>
          , Illinois, $165,000 initial benefits per insured, select health, July 2026. The single figure is
          the average of the published male and female premiums. Change either dollar amount if your
          average is different.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-teal">
            Age used for the industry average
            <select
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
              value={age}
              onChange={(event) => {
                const next = Number(event.target.value) as Age;
                setAge(next);
                if (!customPrem) useIndustry(next, infl);
              }}
            >
              {AGES.map((item) => (
                <option key={item} value={item}>
                  Age {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-teal">
            Inflation design
            <select
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
              value={infl}
              onChange={(event) => {
                const next = Number(event.target.value) as Infl;
                setInfl(next);
                if (!customPrem) useIndustry(age, next);
              }}
            >
              {INFLATION.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-semibold text-teal">
            Couple's Annual Premium Combined Premiums
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
              inputMode="decimal"
              value={couplePrem}
              onChange={(event) => {
                setCouplePrem(dollarsFromRaw(event.target.value));
                setCustomPrem(true);
              }}
            />
          </label>
          <label className="block text-sm font-semibold text-teal">
            Single Individual Annual Premium
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
              inputMode="decimal"
              value={singlePrem}
              onChange={(event) => {
                setSinglePrem(dollarsFromRaw(event.target.value));
                setCustomPrem(true);
              }}
            />
          </label>
        </div>
        <p className="mt-3 text-sm text-navy">
          Age {age}, {INFLATION.find((item) => item.id === infl)?.label}: couple {moneyCents(published.couple)} combined
          (male {moneyCents(published.man)} + female {moneyCents(published.woman)} would be {moneyCents(published.man + published.woman)} before the couple discount).
          Single default {moneyCents(published.single)}.
        </p>
        {customPrem ? (
          <button
            type="button"
            className="mt-3 rounded-lg bg-[#0072b2] px-4 py-2.5 text-sm font-semibold text-white"
            onClick={() => useIndustry()}
          >
            Use industry average
          </button>
        ) : null}
      </section>

      <section className="card-xl p-5">
        <h2 className="border-b-2 border-gold pb-2 font-display text-xl text-navy">Commission rates</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <label className="block text-sm font-semibold text-teal">
            First-year commission
            <span className="mt-1 flex items-center gap-2">
              <input
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
                inputMode="decimal"
                value={fyRate}
                onChange={(event) => setFyRate(event.target.value)}
              />
              <span className="text-base font-normal text-navy">%</span>
            </span>
          </label>
          <label className="block text-sm font-semibold text-teal">
            Years 2–10 renewal
            <span className="mt-1 flex items-center gap-2">
              <input
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
                inputMode="decimal"
                value={renewalRate}
                onChange={(event) => setRenewalRate(event.target.value)}
              />
              <span className="text-base font-normal text-navy">%</span>
            </span>
          </label>
          <label className="block text-sm font-semibold text-teal">
            Years 11+ renewal
            <span className="mt-1 flex items-center gap-2">
              <input
                className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-base font-normal text-navy"
                inputMode="decimal"
                value={laterRate}
                onChange={(event) => setLaterRate(event.target.value)}
              />
              <span className="text-base font-normal text-navy">%</span>
            </span>
          </label>
        </div>
        <p className="mt-3 text-sm text-muted">
          * First-year commissions vary based on distribution channel and age. Typical first-year
          commission ranges from 50% to 65%, and renewal from 8% to 10%, for standard broker agreements.
          Not typical for lead generation or high-end, top-level producers.
        </p>
      </section>

      <section className="card-xl p-5" aria-live="polite">
        <h2 className="border-b-2 border-gold pb-2 font-display text-xl text-navy">This year-1 class</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Result label="Couple's annual premium" value={moneyCents(run.couplePremium)} detail={`${run.coupleCount} × combined premium`} />
          <Result label="Single individual annual premium" value={moneyCents(run.singlePremium)} detail={`${run.singleCount} × single premium`} />
          <Result label="First-year premium" value={moneyCents(run.newPremium)} detail="Couples plus singles" />
          <Result label="Year 1 commission" value={moneyCents(run.firstYear)} detail={`${fyRate || "0"}% of first-year premium`} />
          <Result label="Each year, years 2–10" value={moneyCents(run.renewalEach)} detail={`${renewalRate || "0"}% of the same premium`} />
          <Result label="Each year, years 11–20" value={moneyCents(run.laterEach)} detail={`${laterRate || "0"}% of the same premium`} />
          <Result label="Total on this class, 20 years" value={moneyCents(run.classTotal)} detail="Year 1, nine years at the renewal rate, ten years at the years 11+ rate" />
        </div>
      </section>

      <section className="card-xl p-5">
        <h2 className="border-b-2 border-gold pb-2 font-display text-xl text-navy">
          Same new clients each year
        </h2>
        <p className="mt-3 text-sm text-muted">
          If you write this same number of couples and singles every year, each new class pays the
          first-year rate in its own first year, the renewal rate in policy years 2 through 10, and the
          years 11+ rate in policy years 11 through 20.
          Over 20 years of writing at this pace, commission received is {moneyCents(run.twentyYearBook)}.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-center text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold text-teal">
                <th className="px-2 py-2">Year</th>
                <th className="px-2 py-2">New premium</th>
                <th className="px-2 py-2">First-year commission</th>
                <th className="px-2 py-2">Renewal commission</th>
                <th className="px-2 py-2">Commission this year</th>
                <th className="px-2 py-2">Cumulative</th>
              </tr>
            </thead>
            <tbody>
              {run.years.map((row) => (
                <tr key={row.year} className="border-b border-line/60">
                  <td className="px-2 py-1.5">{row.year}</td>
                  <td className="px-2 py-1.5">{moneyCents(row.newPremium)}</td>
                  <td className="px-2 py-1.5">{moneyCents(row.firstYear)}</td>
                  <td className="px-2 py-1.5">{moneyCents(row.renewal)}</td>
                  <td className="px-2 py-1.5 font-semibold">{moneyCents(row.total)}</td>
                  <td className="px-2 py-1.5">{moneyCents(row.cumulative)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-xl p-5">
        <h2 className="border-b-2 border-gold pb-2 font-display text-xl text-navy">What this leaves out</h2>
        <p className="mt-3 text-sm text-muted">
          Premium is held level. There is no rate increase, lapse, death, replacement, or chargeback.
          Years 2 through 10 use the renewal rate. Years 11 through 20 use the lower rate. Nothing is
          paid after policy year 20. A carrier contract can pay a different schedule. This is an advisor
          illustration, not a quote and not a commission agreement.
        </p>
      </section>
    </main>
  );
}

function Result({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-line bg-paper p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal">{label}</p>
      <p className="mt-1 font-display text-2xl text-navy">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  );
}
