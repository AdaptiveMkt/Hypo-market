import {
  LIFETIME_BENEFIT_MARK,
  LIFETIME_BENEFIT_NOTE,
  policyKindLabel,
  remainingToneAt,
  remainingToneClass,
  type PolicyKind,
  type YearRow,
} from "@/lib/calc";
import { KIND_TAB } from "@/lib/kind-tabs";
import { money, moneyCents } from "@/lib/utils";

const MODEL_START_YEAR = new Date().getFullYear();

function calendarYear(modelYear: number) {
  return MODEL_START_YEAR + Math.max(1, modelYear) - 1;
}

export function KindYearTabs({
  kinds,
  active,
  onChange,
}: {
  kinds: PolicyKind[];
  active: PolicyKind;
  onChange: (kind: PolicyKind) => void;
}) {
  if (kinds.length === 0) return null;
  return (
    <div className="mb-3 flex min-w-0 gap-1 overflow-x-auto" role="tablist" aria-label="Year-by-year insurance type">
      {kinds.map((kind) => {
        const tab = KIND_TAB[kind];
        const selected = kind === active;
        return (
          <button
            key={kind}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`shrink-0 whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold ${
              selected ? tab.active : tab.idle
            }`}
            onClick={() => onChange(kind)}
          >
            {policyKindLabel(kind)}
          </button>
        );
      })}
    </div>
  );
}

export function YearByYearTable({
  rows,
  allRows,
  policyEnabled,
  lifetime,
  showNote = true,
}: {
  rows: YearRow[];
  allRows: YearRow[];
  policyEnabled: boolean;
  lifetime: boolean;
  showNote?: boolean;
}) {
  const last = allRows.at(-1);
  const totalOutYear =
    allRows.find((x) => {
      const left = policyEnabled && !lifetime
        ? x.remaining + Math.max(0, x.insurancePoolRemaining)
        : x.remaining;
      return (x.status === "Care year" || x.status === "After care") && left <= 0;
    })?.year ?? null;

  return (
    <div className="overflow-x-auto pb-4">
      <table className="w-full min-w-[720px] table-fixed text-sm">
        <thead>
          <tr className="border-b border-gold text-[11px] font-semibold leading-tight text-muted">
            <th className="w-[3.25rem] py-2 px-1 text-center align-bottom">Year</th>
            <th className="py-2 px-1 text-center align-bottom">Countable Assets<br />(net after tax)</th>
            {policyEnabled ? (
              <th className="py-2 px-1 text-center align-bottom">Insurance<br />Benefit Pool</th>
            ) : null}
            <th className="py-2 px-1 text-center align-bottom">Total<br />Remaining</th>
            <th className="py-2 px-1 text-center align-bottom">Annual Care<br />Costs* <span className="normal-case font-medium">(est)</span></th>
            {policyEnabled ? (
              <>
                <th className="py-2 px-1 text-center align-bottom">Insurance<br />Benefits</th>
                <th className="py-2 px-1 text-center align-bottom">Insurance<br />Balance</th>
                <th className="py-2 px-1 text-center align-bottom">Co-pay from<br />Countable Assets</th>
              </>
            ) : (
              <th className="py-2 px-1 text-center align-bottom">Co-pay from<br />Countable Assets</th>
            )}
            <th className="py-2 px-1 text-center align-bottom">Cumulative<br />Shortfall</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const insLeft = lifetime && policyEnabled ? null : Math.max(0, r.insurancePoolRemaining);
            const totalLeft = policyEnabled
              ? (insLeft == null ? r.remainingNet : r.remainingNet + insLeft)
              : r.remainingNet;
            const insGone =
              policyEnabled &&
              !lifetime &&
              r.status === "Care year" &&
              Math.round(r.insurancePoolRemaining) <= 0;
            const allGone = totalOutYear != null && r.year === totalOutYear;
            const gone = insGone || allGone;
            const remainIdx = allRows.findIndex((x) => x.year === r.year);
            const remainTone = remainingToneAt(allRows, remainIdx, policyEnabled, lifetime);
            const remainClass = remainingToneClass(remainTone);
            const remainTitle =
              remainTone === "depleted"
                ? "Funds depleted"
                : remainTone === "drawing"
                  ? "Funds drawing down"
                  : undefined;
            const cell = gone ? "py-2 px-1 text-center font-bold amt-red" : "py-2 px-1 text-center";
            return (
              <tr
                key={r.year}
                className={`border-t tabular-nums ${gone ? "border-deplete bg-cream" : "border-line text-navy"}`}
              >
                <td className={cell}>{calendarYear(r.year)}</td>
                <td className={cell}>{money(r.remainingNetStart)}</td>
                {policyEnabled ? (
                  <td className={cell}>{lifetime ? LIFETIME_BENEFIT_MARK : moneyCents(r.insurancePoolStart)}</td>
                ) : null}
                <td className={`py-2 px-1 text-center ${remainClass}`} title={remainTitle}>
                  {lifetime && policyEnabled
                    ? `${moneyCents(r.remainingNet)} + lifetime*`
                    : moneyCents(totalLeft)}
                </td>
                <td className={`${cell} ${r.cost ? "font-bold amt-red" : ""}`}>{moneyCents(r.cost)}</td>
                {policyEnabled ? (
                  <>
                    <td className={cell}>{moneyCents(r.insurance)}</td>
                    <td className={cell}>{lifetime ? LIFETIME_BENEFIT_MARK : moneyCents(r.insurancePoolRemaining)}</td>
                  </>
                ) : null}
                <td className={`${cell} ${r.drawn ? "font-bold amt-red" : ""}`}>
                  {r.drawn > 0 ? money(-r.drawn) : money(0)}
                </td>
                <td className={`${gone ? "py-2 font-bold amt-red" : "py-2"} px-1 text-center`}>
                  {r.shortfallCumulative ? moneyCents(r.shortfallCumulative) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gold tabular-nums">
            <td className="py-2 px-1 text-center font-semibold">End of run</td>
            <td className="py-2 px-1 text-center">—</td>
            {policyEnabled ? <td className="py-2 px-1 text-center">—</td> : null}
            <td className="py-2 px-1 text-center">—</td>
            <td className="py-2 px-1 text-center font-bold amt-red">
              {moneyCents(last?.costCumulative ?? 0)}
            </td>
            {policyEnabled ? (
              <>
                <td className="py-2 px-1 text-center">{moneyCents(last?.insuranceCumulative ?? 0)}</td>
                <td className="py-2 px-1 text-center">—</td>
              </>
            ) : null}
            <td className="py-2 px-1 text-center font-bold amt-red">
              {(last?.drawnCumulative ?? 0) > 0
                ? money(-(last?.drawnCumulative ?? 0))
                : money(0)}
            </td>
            <td className="py-2 px-1 text-center">
              {last?.shortfallCumulative ? moneyCents(last.shortfallCumulative) : "—"}
            </td>
          </tr>
        </tfoot>
      </table>
      {showNote ? (
      <p className="mt-2 text-xs text-muted">
        {policyEnabled
          ? "Insurance Benefit Pool is remaining coverage at the start of that year. Countable Assets are net after tax (deferred accounts reduced by this run’s tax rate) before this year’s co-pay. Annual Care Costs* (est) are modeled from published median costs and this run’s inflation — not a quote. Insurance pays first up to that year’s maximum. If the bill is at or under that maximum and the pool still has room, Co-pay from Countable Assets is $0.00. Any amount assets do pay is shown as a negative number. Insurance Balance is the pool after that calendar year’s covered claim is subtracted. Total Remaining is Insurance Balance plus countable assets net after tax after the co-pay. "
          : null}
        {policyEnabled ? "Total Remaining" : "Countable Assets"} turns bold green when the pool starts declining, and bold red when it is depleted.
        The table runs through the wait until care and every modeled care year — it does not stop at year 10 or at depletion.
        {lifetime && policyEnabled ? ` ${LIFETIME_BENEFIT_NOTE}` : ""}
      </p>
      ) : null}
    </div>
  );
}
