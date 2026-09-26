import { TitleCollapse } from "@/components/accordion";
import { Cite } from "@/components/source-links";
import { IRC_101G_PER_DIEM_2026 } from "@/lib/irc-101g";
import { SRC } from "@/lib/sources";

const ITEMS: { title: string; body: string }[] = [
  {
    title: "Accelerated death benefit",
    body: "An accelerated death benefit is paid by the life insurance company from the death benefit while the insured is still living. It is a contract feature, not a sale of the policy. The payment reduces the face amount left for heirs. It is not tax-qualified long-term care insurance, and a §101(g)-only rider does not create an extra pool after the face is used.",
  },
  {
    title: "Terminal illness",
    body: "Under IRC §101(g), a terminal illness is a physician’s certification that the insured’s death is reasonably expected within 24 months. Amounts received on that basis are generally excluded from income. There is no daily dollar cap. The contract can still limit how much of the face may be accelerated.",
  },
  {
    title: "Chronic illness",
    body: `A chronic-illness acceleration uses the tax-qualified test: a licensed practitioner certifies that the insured cannot perform 2 of 6 activities of daily living without substantial assistance, or has a severe cognitive impairment. Many §101(g) riders also require the condition to last the rest of the insured’s life, which is stricter than a 90-day long-term care trigger. Indemnity payments to a chronically ill person are tax-free only up to the IRS per-diem ($${IRC_101G_PER_DIEM_2026} a day in 2026) unless actual qualified care costs are higher.`,
  },
  {
    title: "Viatical settlement",
    body: "A viatical settlement is a sale of the policy by someone who is terminally or chronically ill. A viatical settlement provider pays cash now, pays the remaining premiums, and collects the death benefit later. If the seller meets the §101(g) illness test and the buyer is a qualified provider, the cash can be taxed like an accelerated death benefit. It is still a sale to a third party, not a long-term care claim.",
  },
  {
    title: "Life settlement",
    body: "A life settlement is a sale of the policy by someone who is not terminally or chronically ill — for example, premiums are no longer wanted, or dependents no longer need the death benefit. The cash paid is less than the face amount. Gain above the owner’s basis is generally taxable. NAIC treats this as a different transaction from a viatical settlement.",
  },
  {
    title: "What this hypothetical does with these dollars",
    body: "None of these payments are applied to the care bill in this model. Cash value already entered as a countable asset can pay care. A face amount, an accelerated death benefit, a viatical settlement, or a life settlement is reported only. If cash is actually received, enter that cash as a countable asset before you run. This is not tax, legal, or insurance advice.",
  },
];

export function LifeBenefitDefs() {
  return (
    <div id="adb-definition" className="scroll-mt-24">
      <p className="mb-3 text-sm text-muted">
        Open a term. These are educational definitions for this hypothetical, not a policy
        contract.{" "}
        <Cite href={SRC.irc101g}>26 U.S.C. §101(g)</Cite>
        {" · "}
        <Cite href={SRC.naicLifeSettlement}>NAIC life settlements guide (2022)</Cite>
      </p>
      {ITEMS.map((item) => (
        <TitleCollapse key={item.title} title={item.title} className="mt-2" defaultOpen={false}>
          <p className="text-sm leading-relaxed text-muted">{item.body}</p>
        </TitleCollapse>
      ))}
    </div>
  );
}
