import { TitleCollapse } from "@/components/accordion";
import { Cite, CopyrightMark, LinkedCopy } from "@/components/source-links";
import { StateName } from "@/components/state-name";
import {
  assetBasedLtcPool,
  isLifetimeBenefit,
  isLinkedKind,
  leverageLabel,
  monthlyFromDaily,
  policyForCompareLane,
  policyKindLabel,
  specifiedFaceAmount,
  type LtcPolicy,
} from "@/lib/calc";
import { HOLD_HARMLESS_SHORT } from "@/lib/disclaimer";
import { SRC } from "@/lib/sources";
import { money } from "@/lib/utils";
import { IRC_101G_PER_DIEM_2026 } from "@/lib/irc-101g";
import { linkedCopy } from "@/lib/linked-products";

function riderWords(p: LtcPolicy) {
  if (p.benefitInflationPct <= 0 || p.inflationMethod === "none") {
    return "Level — the daily / monthly maximum does not increase.";
  }
  if (p.inflationMethod === "simple") {
    return `${p.benefitInflationPct}% simple: each year adds ${p.benefitInflationPct}% of the original daily benefit.`;
  }
  return `${p.benefitInflationPct}% compound: each year the current daily maximum is multiplied by ${(1 + p.benefitInflationPct / 100).toFixed(2)}.`;
}

function OutlineDisclaimer() {
  return (
    <div className="mt-4 card px-3 py-3 text-xs leading-relaxed text-muted">
      <p className="font-semibold uppercase tracking-wide text-navy">Disclaimer</p>
      <p className="mt-1">
        This is a specimen outline of coverage for education only. It is{" "}
        <strong className="text-navy">not a policy, contract, illustration, quote, proposal of
        insurance, or offer to sell</strong>. Company name, form number, and issue state are
        placeholders. A licensed insurer in the issue state must provide the real outline and
        policy. Benefits, premiums, underwriting, exclusions, waiting periods, and benefit
        triggers vary by company, form, age, health, marital status, and state of issue.
        Policies have exclusions, waiting periods, and benefit triggers — this is not a claim
        decision. Insurance does not pay until a licensed health-care practitioner certifies a
        benefit trigger and any elimination period has run.
      </p>
      <p className="mt-2">
        <LinkedCopy text={HOLD_HARMLESS_SHORT} />
      </p>
      <p className="mt-2">
        Contact a licensed insurance producer in your state (CLTC or LTCP recommended), and
        the appropriate tax, legal, or financial professional for your situation.{" "}
        <CopyrightMark />
      </p>
    </div>
  );
}

function Notice() {
  return (
    <>
      <p className="mt-3 text-xs">
        <strong className="text-navy">Notice to buyer:</strong> This specimen may not cover all
        of the costs associated with long-term care. Review all policy limitations.
      </p>
      <p className="mt-2 text-xs">
        <strong className="text-navy">Caution:</strong> Issuance of a real policy is based on
        answers on the application. If answers are incorrect or untrue, the company may deny
        benefits or rescind the policy. This is not a quote, illustration, or offer.
      </p>
    </>
  );
}

function LinkedSpecimen({
  policy,
  state,
  kind,
}: {
  policy: LtcPolicy;
  state?: string;
  kind: "assetBased" | "hybridLife" | "ltcAnnuity";
}) {
  const copy = linkedCopy(kind);
  const monthly = policy.monthlyBenefit || Math.round(monthlyFromDaily(policy.dailyBenefit));
  const face = specifiedFaceAmount(policy);
  const pool = assetBasedLtcPool(policy);
  const residual = money(face * (Math.max(0, policy.residualPct) / 100));
  const titles = {
    assetBased: {
      product: "Linked-benefit / asset-based life",
      form: "SAMPLE-AB-LTC-OC-2026",
    },
    hybridLife: {
      product: "Hybrid life insurance with LTC acceleration",
      form: "SAMPLE-HYB-LTC-OC-2026",
    },
    ltcAnnuity: {
      product: "Long-term care annuity",
      form: "SAMPLE-ANN-LTC-OC-2026",
    },
  }[kind];

  return (
    <div className="card px-4 py-4 text-sm text-muted">
      <p className="text-center font-display text-lg text-navy">[Sample Company]</p>
      <p className="text-center text-xs">[Address — City & State] · [Telephone]</p>
      <p className="mt-2 text-center font-semibold uppercase tracking-wide text-navy">
        {titles.product}
      </p>
      <p className="text-center font-semibold text-navy">Specimen outline of coverage</p>
      <p className="text-center text-xs">{titles.form} · not a filed form</p>
      <Notice />

      <ol className="mt-4 list-decimal space-y-3 pl-5">
        <li>
          <strong className="text-navy">Type of contract. </strong>
          {copy.chassis}. Individual contract — not a group certificate.
          {state ? (
            <>
              {" "}
              Care in this hypothetical is modeled in <StateName name={state} /> — that is not
              an issue-state filing.
            </>
          ) : null}
        </li>
        <li>
          <strong className="text-navy">What this product is. </strong>
          {copy.definition}
        </li>
        <li>
          <strong className="text-navy">Federal tax chassis. </strong>
          {kind === "hybridLife" ? (
            <>
              Acceleration of the death benefit while living is intended to qualify under IRC
              §101(g) (terminal or chronic illness). Any extension of benefits after the face is
              used is intended as a tax-qualified LTC rider under IRC §7702B. A §101(g)-only
              chronic-illness rider is <em>not</em> long-term care insurance and generally cannot
              be advertised as such. 2026 chronic-illness indemnity exclusion: $
              {IRC_101G_PER_DIEM_2026}/day.{" "}
              <Cite href={SRC.irc101g}>26 U.S.C. §101(g)</Cite>
              {" · "}
              <Cite href={SRC.irc7702b}>26 U.S.C. §7702B</Cite>.
            </>
          ) : kind === "ltcAnnuity" ? (
            <>
              A tax-qualified LTC rider on an annuity is intended under IRC §7702B — not §101(g).
              §101(g) applies only to life death-benefit accelerations. Qualifying LTC paid under
              a 7702B rider is generally excluded from income up to qualified costs or the IRS
              per-diem.{" "}
              <Cite href={SRC.irc7702b}>26 U.S.C. §7702B</Cite>. This is not tax advice.
            </>
          ) : (
            <>
              Linked-benefit / asset-based forms are typically a life (or combo) contract with a
              tax-qualified LTC rider (IRC §7702B) and often a residual death benefit. Some
              designs also use §101(g) acceleration of the face. Confirm which code the issued
              form uses.{" "}
              <Cite href={SRC.irc7702b}>26 U.S.C. §7702B</Cite>
              {" · "}
              <Cite href={SRC.irc101g}>26 U.S.C. §101(g)</Cite>.
            </>
          )}
        </li>
        <li>
          <strong className="text-navy">How a claim is paid. </strong>
          {copy.howItPays} {copy.ifClaim}
        </li>
        <li>
          <strong className="text-navy">If no claim is paid. </strong>
          {copy.ifNoClaim} * Death benefits vary by company and policy type. See policy language.
        </li>
        <li>
          <strong className="text-navy">Benefit trigger. </strong>
          {copy.triggerBody} {copy.elimNote}
        </li>
        <li>
          <strong className="text-navy">Benefits illustrated (this run or planning default). </strong>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            <li>Monthly LTC maximum: {money(monthly)}.</li>
            {kind === "hybridLife" ? (
              <li>
                Specified / face amount to support that monthly (2% of face planning convention):{" "}
                {money(face)}.
              </li>
            ) : (
              <li>
                Single premium / deposit illustrated: {money(policy.singlePremium || face)}.
              </li>
            )}
            <li>
              Leverage / extension: {leverageLabel(policy.leverage)}. LTC pool at issue about{" "}
              {money(pool)}.
            </li>
            <li>Elimination period: {policy.elimDays} days.</li>
            <li>Benefit Increase Option: {riderWords(policy)}</li>
            <li>
              {copy.residualLabel}: {policy.residualPct}% floor (about {residual} of the illustrated
              face / deposit).
            </li>
            <li>
              Partnership / Medicaid asset disregard: generally <strong>not</strong> available on
              linked-benefit, hybrid life, or LTC annuity forms. Traditional stand-alone §7702B
              policies may be DRA Partnership-certified in participating states.
            </li>
          </ul>
        </li>
        <li>
          <strong className="text-navy">Premium / funding. </strong>
          {kind === "ltcAnnuity"
            ? `Annuity premium or 1035 exchange illustrated at ${money(policy.singlePremium || face)}. A 1035 tax-free exchange from another life or annuity contract may fund this chassis — confirm with a tax professional.`
            : `Single premium or 1035 exchange illustrated at ${money(policy.singlePremium || face)}. Recurring-premium hybrids exist; this specimen uses a single deposit. Not a quoted rate.`}{" "}
          <Cite href={SRC.irc1035}>IRC §1035</Cite>.
        </li>
        <li>
          <strong className="text-navy">Cash surrender / liquidity. </strong>
          {kind === "ltcAnnuity"
            ? "Annuity cash surrender is often subject to a declining contingent deferred sales charge (for example 7 or 10 years). This model can illustrate a schedule if you turn it on — it is optional, not a forced value."
            : "Linked-benefit life may have a cash-surrender value, often reduced by a declining surrender charge in early years. Optional in this hypothetical. Loans or withdrawals usually reduce the LTC pool and the death benefit."}
        </li>
        <li>
          <strong className="text-navy">Limitations and exclusions. </strong>
          Benefit trigger and elimination period must be met. Unlicensed or family care,
          preexisting conditions, and care outside the United States are commonly limited.
          A §101(g)-only rider stops when the face is exhausted (no extension). THIS SPECIMEN
          MAY NOT COVER ALL EXPENSES ASSOCIATED WITH YOUR LONG-TERM CARE NEEDS.
        </li>
        <li>
          <strong className="text-navy">Alzheimer’s disease and other organic brain disorders. </strong>
          Qualifying cognitive impairment, including Alzheimer’s disease and other dementias, is
          covered when the cognitive trigger on the form is met. The diagnosis alone is not a
          claim.
        </li>
        <li>
          <strong className="text-navy">Information. </strong>
          Contact a licensed insurer for a real outline of coverage.{" "}
          <Cite href={SRC.naicShopper}>NAIC Shopper’s Guide (PDF)</Cite>
          {" · "}
          <Cite href={SRC.naicModel640}>NAIC Model Act #640</Cite>
          {" · "}
          <Cite href={SRC.iiprcOutline}>IIPRC outline standards</Cite>.
        </li>
      </ol>
      <OutlineDisclaimer />
    </div>
  );
}

export function SampleLtcPolicy({
  policy,
  state,
  defaultOpen = false,
}: {
  policy: LtcPolicy;
  state?: string;
  defaultOpen?: boolean;
}) {
  const lifetime = isLifetimeBenefit(policy.benefitYears);
  const monthly = Math.round(monthlyFromDaily(policy.dailyBenefit));
  const pool = lifetime
    ? "Lifetime (no period cap)"
    : money(policy.dailyBenefit * 365 * policy.benefitYears);
  const linked = isLinkedKind(policy.kind);

  return (
    <TitleCollapse title="Sample traditional LTC policy (NAIC outline of coverage)" defaultOpen={defaultOpen}>
      <p className="mb-3 text-sm text-muted">
        Specimen only — not a policy, quote, illustration, or offer. Company, form number, and
        issue state are placeholders. Benefit amounts below are copied from{" "}
        <strong className="text-navy">this run</strong> so you can see how an outline is laid
        out. A real outline must come from a licensed insurer in the issue state. Sources:{" "}
        <Cite href={SRC.naicModel640}>NAIC Long-Term Care Insurance Model Act (#640)</Cite>
        ;{" "}
        <Cite href={SRC.iiprcOutline}>
          IIPRC Individual LTC Outline of Coverage standards (IIPRC-LTC-I-3-OC)
        </Cite>
        ;{" "}
        <Cite href={SRC.naicShopper}>NAIC A Shopper’s Guide to Long-Term Care Insurance</Cite>.
      </p>

      <div className="card px-4 py-4 text-sm text-muted">
        <p className="text-center font-display text-lg text-navy">[Sample Company]</p>
        <p className="text-center text-xs">[Address — City & State] · [Telephone]</p>
        <p className="mt-2 text-center font-semibold uppercase tracking-wide text-navy">
          Long-term care insurance
        </p>
        <p className="text-center font-semibold text-navy">Outline of coverage</p>
        <p className="text-center text-xs">Form SAMPLE-LTC-OC-2026 · not a filed form</p>
        <Notice />

        <ol className="mt-4 list-decimal space-y-3 pl-5">
          <li>
            <strong className="text-navy">Type of policy. </strong>
            This specimen is an <em>individual</em> {policyKindLabel(policy.kind).toLowerCase()}{" "}
            contract. It is not a group certificate.
            {state ? (
              <>
                {" "}
                Care in this hypothetical is modeled in <StateName name={state} /> — that is not
                an issue-state filing.
              </>
            ) : null}
          </li>
          <li>
            <strong className="text-navy">Purpose of outline of coverage. </strong>
            This outline is a brief description of important features. It is{" "}
            <strong>not an insurance contract</strong>. Only a issued policy contains governing
            provisions. Read any real policy carefully.
          </li>
          <li>
            <strong className="text-navy">Federal tax consequences. </strong>
            This specimen is written as intended to be a federally tax-qualified long-term care
            insurance contract under IRC §7702B(b). A non-qualified contract would disclose that
            benefits may be taxable. This is not tax advice.
          </li>
          <li>
            <strong className="text-navy">Continuance / renewability. </strong>
            RENEWABILITY: THIS POLICY IS GUARANTEED RENEWABLE. You may keep it in force by
            paying premiums on time. The company cannot change policy terms on its own, except
            that <strong>it may increase the premium you pay</strong> on a class basis with
            state approval. Waiver of premium: premiums are typically waived after the insured
            is on claim and has satisfied the elimination period (assumed in this hypothetical).
          </li>
          <li>
            <strong className="text-navy">Terms under which the company may change premiums. </strong>
            The company may change premiums for a class of insureds if future experience
            (claims, persistency, interest) differs from pricing, subject to the issue-state
            insurance department. This specimen is not noncancellable (premiums are not
            guaranteed for life).
          </li>
          <li>
            <strong className="text-navy">Free look / refund. </strong>
            You may return the policy within 30 days of delivery for a full premium refund (NAIC
            model; some states require longer). This specimen does not include a return-of-premium
            on death or surrender unless a linked-product residual or cash-surrender value is
            separately illustrated.
          </li>
          <li>
            <strong className="text-navy">This is not Medicare supplement coverage. </strong>
            If you are eligible for Medicare, review the Guide to Health Insurance for People
            with Medicare. Neither a sample company nor its agents represent Medicare, the
            federal government, or any state government.
          </li>
          <li>
            <strong className="text-navy">Long-term care coverage. </strong>
            Policies of this category are designed to provide coverage for one or more necessary
            diagnostic, preventive, therapeutic, rehabilitative, maintenance, or personal care
            services, in a setting other than an acute care unit of a hospital — such as a
            nursing home, assisted living, the community, or the home.
            {linked
              ? " This specimen’s linked / hybrid lane pays a monthly cash or accelerated benefit up to the monthly maximum after the trigger, subject to the elimination period and remaining pool."
              : " This specimen pays reimbursement of actual charges for qualifying care up to the daily or monthly maximum, after the elimination period, until the pool is exhausted."}
          </li>
          <li>
            <strong className="text-navy">Benefits provided by this policy (this run). </strong>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                Daily maximum today: {money(policy.dailyBenefit)} (about {money(monthly)}{" "}
                monthly).
              </li>
              <li>
                Benefit period / pool:{" "}
                {lifetime
                  ? "lifetime (no period cap)"
                  : `${policy.benefitYears} ${policy.benefitYears === 1 ? "year" : "years"} · pool today ${pool}`}
                .
              </li>
              <li>Elimination period: {policy.elimDays} days of qualifying care.</li>
              <li>Benefit Increase Option: {riderWords(policy)}</li>
              <li>
                Covered settings (comprehensive specimen): licensed nursing facility, assisted
                living / residential care, home health care, adult day care, and hospice — actual
                charges up to the daily/monthly max. Unlicensed or family care is commonly
                limited or excluded.
              </li>
              <li>
                Eligibility for payment of benefits: a licensed health-care practitioner must
                certify that you are unable to perform two of six Activities of Daily Living
                without substantial assistance, expected to last at least 90 days, or that you
                have a severe cognitive impairment requiring substantial supervision. Then the
                elimination period must run.
              </li>
            </ul>
          </li>
          <li>
            <strong className="text-navy">Limitations and exclusions. </strong>
            Common NAIC-model limitations (confirm the issued contract): preexisting conditions
            (often 6 months); care outside the United States; services by a family member or
            unlicensed provider; treatment for alcoholism or drug addiction (on some forms);
            illness caused by war; services paid by Medicare, workers’ compensation, or other
            insurance; care in an acute hospital unit. THIS POLICY MAY NOT COVER ALL THE
            EXPENSES ASSOCIATED WITH YOUR LONG-TERM CARE NEEDS.
          </li>
          <li>
            <strong className="text-navy">Relationship of cost of care and benefits. </strong>
            Care costs usually rise. {riderWords(policy)} If care inflates faster than the rider,
            you pay the difference from other resources (the shortfall in this hypothetical).
          </li>
          <li>
            <strong className="text-navy">Alzheimer’s disease and other organic brain disorders. </strong>
            Qualifying cognitive impairment, including Alzheimer’s disease and other dementias,
            is covered when the cognitive trigger is met. The diagnosis alone is not a claim;
            certification and the elimination period still apply.
          </li>
          <li>
            <strong className="text-navy">Premium (this run). </strong>
            {linked
              ? `Linked / asset-based specimen: single premium or deposit illustrated at ${money(policy.singlePremium)} (or face/monthly as entered). Not a quoted rate.`
              : `Illustrated annual premium ${money(policy.annualPremium)}. Premiums vary by issue state, age, underwriting & rate class, marital status, benefit selection, and riders. This is not a quote or a proposal of insurance.`}
          </li>
          <li>
            <strong className="text-navy">Additional features (specimen). </strong>
            30-day free look; guaranteed renewable; waiver of premium on claim after the
            elimination period; contingent nonforfeiture on a large rate increase (NAIC model).
            Optional riders not automatically included: restoration of benefits, shared care,
            return of premium, shortened-benefit nonforfeiture elected at issue.
          </li>
          <li>
            <strong className="text-navy">Information and counseling. </strong>
            Contact the state agency listed in the NAIC Shopper’s Guide for general questions.
            Contact a licensed insurer for questions about a real policy.{" "}
            <Cite href={SRC.naicShopper}>Open the Shopper’s Guide (PDF)</Cite>
            {" · "}
            <Cite href={SRC.iiprcOutline}>Blank IIPRC outline standards (PDF)</Cite>
            {" · "}
            <Cite href={SRC.naicModel640}>NAIC Model Act #640 (PDF)</Cite>.
          </li>
        </ol>
        <OutlineDisclaimer />
      </div>
    </TitleCollapse>
  );
}

const LINKED_KINDS: { key: "assetBased" | "hybridLife" | "ltcAnnuity"; title: string }[] = [
  { key: "assetBased", title: "Sample asset-based single premium policy" },
  { key: "hybridLife", title: "Sample hybrid life insurance policy" },
  { key: "ltcAnnuity", title: "Sample long-term care annuity policy" },
];

export function SamplePolicyPack({
  policy,
  state,
  countable = 0,
  defaultOpen = false,
}: {
  policy: LtcPolicy;
  state?: string;
  countable?: number;
  defaultOpen?: boolean;
}) {
  const trad = policyForCompareLane("traditional", policy, countable);
  return (
    <div className="space-y-1">
      <p className="mb-2 text-xs text-muted">
        Four specimen outlines — traditional reimbursement, asset-based single premium, hybrid
        life, and LTC annuity. None is a filed form, quote, or offer. Figures follow this run
        when that design is selected; otherwise planning defaults are used.
      </p>
      <SampleLtcPolicy policy={trad} state={state} defaultOpen={defaultOpen && policy.kind === "traditional"} />
      {LINKED_KINDS.map((row) => {
        const p = policyForCompareLane(row.key, policy, countable);
        return (
          <TitleCollapse
            key={row.key}
            title={row.title}
            defaultOpen={defaultOpen && policy.kind === row.key}
          >
            <p className="mb-3 text-sm text-muted">
              Specimen only — not a policy, quote, illustration, or offer. Linked-benefit,
              hybrid, and annuity forms are generally <strong>not</strong> DRA Partnership
              certified. A real outline of coverage must come from a licensed insurer in the
              issue state.
            </p>
            <LinkedSpecimen policy={p} state={state} kind={row.key} />
          </TitleCollapse>
        );
      })}
    </div>
  );
}
