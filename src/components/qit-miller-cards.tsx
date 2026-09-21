import { MoreInfo } from "@/components/more-info";
import { TitleCollapse } from "@/components/accordion";
import { LinkedCopy } from "@/components/source-links";
import { millerTrustMedicaidImpact, qitRules } from "@/lib/qit";

export function QitMillerCards({ state }: { state: string }) {
  const qit = qitRules(state);
  const miller = millerTrustMedicaidImpact(state);
  return (
    <>
      <MoreInfo title={qit.title} summary={qit.summary}>
        {qit.bullets.map((b) => (
          <TitleCollapse key={b.heading} title={b.heading}>
            <p className="text-sm text-muted"><LinkedCopy text={b.body} /></p>
          </TitleCollapse>
        ))}
        <p className="mt-3 text-xs">
          Local name: {qit.note.localName}. Deposit: {qit.note.deposit}.
        </p>
      </MoreInfo>
      <MoreInfo title={miller.title} summary={miller.summary}>
        {miller.bullets.map((b) => (
          <TitleCollapse key={b.heading} title={b.heading}>
            <p className="text-sm text-muted"><LinkedCopy text={b.body} /></p>
          </TitleCollapse>
        ))}
      </MoreInfo>
    </>
  );
}