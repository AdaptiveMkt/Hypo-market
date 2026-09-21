import { MoreInfo } from "@/components/more-info";
import { StateName } from "@/components/state-name";
import { medicaidProtectStrategies } from "@/lib/medicaid-protect";

export function MedicaidProtectCards({ state }: { state: string }) {
  const s = medicaidProtectStrategies(state);
  return (
    <MoreInfo title={s.title} summary={s.summary}>
      <ul className="mt-2 list-disc space-y-2 pl-5">
        {s.bullets.map((b) => (
          <li key={b.heading}>
            <strong className="text-navy">{b.heading}.</strong> {b.body}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs">
        Not a recommendation. Confirm with a qualified Medicaid or elder-care planning
        attorney in <StateName name={state} />. Transfers inside the look-back can create a penalty period.
      </p>
    </MoreInfo>
  );
}