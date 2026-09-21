import { TitleCollapse } from "@/components/accordion";
import { StateName } from "@/components/state-name";
import { payoutThenSpendDown } from "@/lib/payout-spenddown";
import type { LtcPolicy } from "@/lib/calc";

export function PayoutSpendDownCard({
  state,
  policy,
  individualLimit,
  collapsible = true,
}: {
  state: string;
  policy: LtcPolicy;
  individualLimit: number;
  collapsible?: boolean;
}) {
  const block = payoutThenSpendDown(state, policy, individualLimit);
  const body = (
    <div className="text-sm text-muted">
      <ol className="list-decimal space-y-2 pl-5">
        {block.payout.map((s) => (
          <TitleCollapse key={s.heading} title={s.heading} className="mt-1">
            <p>{s.body}</p>
          </TitleCollapse>
        ))}
      </ol>
      <TitleCollapse title={block.spendTitle}>
      <p>{block.spendIntro}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {block.spendRules.map((b) => (
          <li key={b.slice(0, 40)}>{b}</li>
        ))}
      </ul>
      {block.strategies.map((s) => (
        <TitleCollapse key={s.heading} title={s.heading}>
          <p>{s.body}</p>
        </TitleCollapse>
      ))}
      </TitleCollapse>
      <p className="mt-2 text-xs">
        Educational only — not a Medicaid determination or a recommendation to spend down,
        gift, or buy a policy. Confirm with an elder-law or Medicaid specialist in <StateName name={state} />.
      </p>
    </div>
  );

  if (!collapsible) {
    return (
      <div className="card px-4 py-3">
        <p className="mb-2 font-display text-base text-navy">{block.title}</p>
        {body}
      </div>
    );
  }

  return (
    <div className="card px-4 py-3">
      <TitleCollapse title={block.title} className="mt-0">
        {body}
      </TitleCollapse>
    </div>
  );
}