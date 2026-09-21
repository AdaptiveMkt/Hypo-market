import {
  project,
  yearsPoolLasts,
  type Holding,
  type LtcPolicy,
  type Projection,
} from "./calc";
import { SETTING_SHORT, type CareSetting } from "./costs";

export type SensitivityMetric = {
  remaining: number;
  shortfall: number;
  yearsAtClaim: number;
  firstCost: number;
  depletedYear: number | null;
};

export type SensitivityRow = {
  key: string;
  factor: string;
  shock: string;
  label: string;
  isBase: boolean;
  remaining: number;
  shortfall: number;
  yearsAtClaim: number;
  firstCost: number;
  depletedYear: number | null;
  dRemain: number;
  dShort: number;
};

export type SensitivityResult = {
  base: SensitivityMetric;
  rows: SensitivityRow[];
  mostRemaining: SensitivityRow | null;
  mostShortfall: SensitivityRow | null;
  insight: string;
};

function metric(p: Projection): SensitivityMetric {
  const ins = p.lifetimeBenefit ? Number.POSITIVE_INFINITY : Number(p.benefitPoolAtClaim ?? 0);
  const combined = p.lifetimeBenefit ? Number.POSITIVE_INFINITY : p.startPool + (Number.isFinite(ins) ? ins : 0);
  return {
    remaining: p.endPool,
    shortfall: p.shortfallTotal,
    yearsAtClaim: p.lifetimeBenefit ? Number.POSITIVE_INFINITY : yearsPoolLasts(combined, p.firstCost),
    firstCost: p.firstCost,
    depletedYear: p.depletedYear,
  };
}

export function hypothesisSensitivity(opts: {
  pool: number;
  state: string;
  setting: CareSetting;
  delay: number;
  duration: number;
  cpiPct: number;
  roiPct: number;
  taxRatePct: number;
  iraBalance: number;
  iraRoiPct: number;
  policy: LtcPolicy;
  holdings?: Holding[];
}): SensitivityResult {
  const run = (patch: Partial<typeof opts> & { holdings?: Holding[] }) =>
    project({ ...opts, ...patch, policy: opts.policy, holdings: patch.holdings ?? opts.holdings });
  const baseP = run({});
  const base = metric(baseP);
  const rows: SensitivityRow[] = [];

  const add = (
    key: string,
    factor: string,
    shock: string,
    label: string,
    p: Projection,
    isBase = false,
  ) => {
    const m = metric(p);
    rows.push({
      key,
      factor,
      shock,
      label,
      isBase,
      remaining: m.remaining,
      shortfall: m.shortfall,
      yearsAtClaim: m.yearsAtClaim,
      firstCost: m.firstCost,
      depletedYear: m.depletedYear,
      dRemain: m.remaining - base.remaining,
      dShort: m.shortfall - base.shortfall,
    });
  };

  add(
    "base",
    "This run",
    "Base",
    `${opts.cpiPct.toFixed(1)}% CPI · ${opts.roiPct.toFixed(1)}% gross R.O.I. · care in ${opts.delay} yr · ${opts.duration} yr ${SETTING_SHORT[opts.setting]}`,
    baseP,
    true,
  );

  for (const d of [-1, 1, 2]) {
    const v = Math.max(0, Number((opts.cpiPct + d).toFixed(1)));
    if (v === opts.cpiPct) continue;
    add(`cpi-${d}`, "Care CPI", d > 0 ? `+${d} pt` : `${d} pt`, `${v.toFixed(1)}% compound`, run({ cpiPct: v }));
  }
  for (const d of [-2, 2]) {
    const v = Math.max(0, Number((opts.roiPct + d).toFixed(1)));
    if (v === opts.roiPct) continue;
    const shocked = opts.holdings?.map((h) =>
      h.deferred ? h : { ...h, roiPct: Math.max(-5, h.roiPct + d) },
    );
    add(
      `roi-${d}`,
      "Gross R.O.I.",
      d > 0 ? `+${d} pt` : `${d} pt`,
      `${v.toFixed(1)}% taxable (all non-IRA lines)`,
      run({ roiPct: v, holdings: shocked }),
    );
  }

  if (opts.delay !== 0) {
    add("delay-0", "Care start", "Now", "Care starts this year", run({ delay: 0 }));
  }
  add(
    `delay-${opts.delay + 2}`,
    "Care start",
    `+2 yr`,
    `Care in ${opts.delay + 2} years`,
    run({ delay: opts.delay + 2 }),
  );

  const shorter = Math.max(1, opts.duration - 2);
  if (shorter !== opts.duration) {
    add(`dur-${shorter}`, "Years of care", `−${opts.duration - shorter} yr`, `${shorter} year${shorter === 1 ? "" : "s"} modeled`, run({ duration: shorter }));
  }
  add(
    `dur-${opts.duration + 2}`,
    "Years of care",
    "+2 yr",
    `${opts.duration + 2} years modeled`,
    run({ duration: opts.duration + 2 }),
  );

  (["home24", "al", "memory", "nhs", "nh"] as CareSetting[]).forEach((s) => {
    if (s === opts.setting) return;
    add(`set-${s}`, "Care setting", SETTING_SHORT[s], SETTING_SHORT[s], run({ setting: s }));
  });

  if (opts.taxRatePct !== 0) {
    add("tax-0", "Tax on R.O.I.", "0%", "No tax on taxable return", run({ taxRatePct: 0 }));
  }
  if (opts.taxRatePct !== 24) {
    add("tax-24", "Tax on R.O.I.", "24%", "24% tax on taxable return", run({ taxRatePct: 24 }));
  }

  const movers = rows.filter((r) => !r.isBase);
  const mostRemaining = movers.slice().sort((a, b) => Math.abs(b.dRemain) - Math.abs(a.dRemain))[0] ?? null;
  const mostShortfall = movers.slice().sort((a, b) => Math.abs(b.dShort) - Math.abs(a.dShort))[0] ?? null;

  let insight =
    "One-way sensitivity: each row changes a single assumption from this run. Other inputs stay fixed. Not a forecast.";
  if (mostRemaining) {
    insight = `This hypo is most sensitive to ${mostRemaining.factor.toLowerCase()} (${mostRemaining.shock}): remaining countable assets move ${mostRemaining.dRemain >= 0 ? "+" : ""}${Math.round(mostRemaining.dRemain).toLocaleString("en-US")} versus this run.`;
    if (mostShortfall && mostShortfall.key !== mostRemaining.key && Math.abs(mostShortfall.dShort) > 0) {
      insight += ` Unpaid shortfall moves the most under ${mostShortfall.factor.toLowerCase()} (${mostShortfall.shock}).`;
    }
    insight += " One-way only — not a forecast.";
  }

  return { base, rows, mostRemaining, mostShortfall, insight };
}