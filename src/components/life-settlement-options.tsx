import { Cite } from "@/components/source-links";
import { SRC } from "@/lib/sources";
import { money } from "@/lib/utils";

export function LifeSettlementOptions({
  face,
  cashValue,
}: {
  face: number;
  cashValue: number;
}) {
  return (
    <div className="space-y-3 text-sm leading-relaxed text-muted">
      <p>
        Life insurance is disclosed on this run
        {face > 0 ? <> (face amount {money(face)})</> : null}
        {cashValue > 0 ? <> (cash value {money(cashValue)})</> : null}
        . The notes below are educational. They are not a quote, a referral, or tax advice. Cash from a settlement is not applied to the care bill in this model unless that cash is entered as a countable asset.
      </p>
      <h3 className="font-display text-base text-navy">Settlement options from the insurance company</h3>
      <p>
        These are ways a death benefit can be paid under the contract. They are not a sale of the policy. The policy form controls which options exist. Common options are a lump sum, interest paid while the proceeds stay with the insurer, installments for a fixed period, installments of a fixed amount, and a life-income annuity. A retained-asset account is an insurer-held account the beneficiary draws on. It is not a bank account and it is not FDIC-insured. Ask the insurer what the contract offers before considering a sale.{" "}
        <Cite href={SRC.naicLifeSettlement}>NAIC life settlements guide (2022)</Cite>
        {" · "}
        <Cite href={SRC.irsLifeProceeds}>IRS — life insurance proceeds</Cite>
      </p>
      <h3 className="font-display text-base text-navy">Accelerated death benefit</h3>
      <p>
        The insurer may pay part of the death benefit while the insured is living if the contract includes that feature. For a terminal illness, IRC §101(g) generally applies when a physician certifies that death is reasonably expected within 24 months. A chronic-illness acceleration uses a stricter tax test than a typical long-term care claim. The payment reduces what is left for heirs. It is not a third-party sale.{" "}
        <Cite href={SRC.irc101g}>26 U.S.C. §101(g)</Cite>
      </p>
      <h3 className="font-display text-base text-navy">Viatical settlement</h3>
      <p>
        A viatical settlement is a sale of the policy by an owner who is terminally or chronically ill. A licensed viatical settlement provider pays cash now, pays remaining premiums, and collects the death benefit later. If the seller meets the §101(g) illness test and the buyer is a qualified provider, the cash can be taxed like an accelerated death benefit. It is still a sale, not a long-term care claim. State licensing follows the{" "}
        <Cite href={SRC.naicModel697}>NAIC Viatical Settlements Model Act #697</Cite>
        , which the{" "}
        <Cite href={SRC.naicModelIndex2026}>NAIC Summer 2026 model index</Cite>
        {" "}still lists, and the matching regulation #698. States adopt those models with variations.{" "}
        <Cite href={SRC.naicLifeSettlement}>NAIC life settlements guide (2022)</Cite>
      </p>
      <h3 className="font-display text-base text-navy">Life settlement and third-party buyers</h3>
      <p>
        A life settlement is a sale by an owner who is not terminally or chronically ill — for example, the death benefit is no longer needed or the premium is no longer wanted. The buyer pays less than the face amount, more than the cash surrender value in many cases, takes over future premiums, and collects the death benefit. Gain above the owner’s basis is generally taxable.{" "}
        <Cite href={SRC.naicLifeSettlement}>NAIC life settlements guide (2022)</Cite>
        {" · "}
        <Cite href={SRC.irsLifeProceeds}>IRS — life insurance proceeds</Cite>
      </p>
      <p>
        Third-party buyers are life-settlement providers and the funds that finance them. One example is{" "}
        <Cite href={SRC.coventry}>Coventry</Cite>
        . Naming a company is an illustration of the type of buyer, not an endorsement, a referral, or a statement that a policy will qualify. Other licensed providers and brokers operate in this market. The{" "}
        <Cite href={SRC.lisa}>Life Insurance Settlement Association (LISA)</Cite>
        {" "}is the industry trade group. Confirm that any provider or broker is licensed in the state of the policy before sharing medical or policy information. Compare the offer with the insurer’s surrender value, loan, and accelerated-death-benefit options first.
      </p>
    </div>
  );
}
