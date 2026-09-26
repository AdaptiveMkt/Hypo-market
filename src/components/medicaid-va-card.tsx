import { type ReactNode } from "react";
import { TitleCollapse } from "@/components/accordion";
import { PayoutSpendDownCard } from "@/components/payout-spenddown-card";
import { QitMillerCards } from "@/components/qit-miller-cards";
import { Cite, LinkedCopy } from "@/components/source-links";
import { StateName } from "@/components/state-name";
import { VeteranMedicaidCards } from "@/components/veteran-medicaid-cards";
import type { LtcPolicy } from "@/lib/calc";
import { medicaidLtcOverview } from "@/lib/medicaid-ltc";
import {
  eligibilityRules,
  MEDICAID_FUTURE_QUALIFIER,
  type MedicaidProfile,
} from "@/lib/medicaid";
import { medicaidProtectStrategies } from "@/lib/medicaid-protect";
import { assetProtectionLimits, type PreservationImpact } from "@/lib/partnership";
import { reciprocityOutcome } from "@/lib/reciprocity";
import { incomeLimitNotes, maptRules } from "@/lib/mapt";
import { ssiAssetLimitsForLtc } from "@/lib/ssi-2026";
import { SRC } from "@/lib/sources";
import { money } from "@/lib/utils";
import {
  vaAidAttendance,
  vaBenefitsEligibility,
  VA_NET_WORTH_2026,
  VA_PENSION_EXTRA_CHILD,
  VA_PENSION_LIMITS_2026,
  VA_PENSION_PENALTY_RATE,
  VA_RATES_REVIEWED,
} from "@/lib/va-aa";

function Fold({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <div id={id} className={id ? "scroll-mt-28" : undefined}>
      <TitleCollapse title={title} className="mt-2" openOnHash={id}>
        {children}
      </TitleCollapse>
    </div>
  );
}

function Step({ n, label }: { n: string; label: string }) {
  return (
    <p className="mb-1 mt-4 border-b border-line pb-1 font-display text-sm text-navy">
      {n}. {label}
    </p>
  );
}

export function MedicaidVaBody({
  state,
  policy,
  medicaid,
  veteran,
  onVeteranChange,
  preservation,
  issueState,
  preferTap = true,
}: {
  state: string;
  policy: LtcPolicy;
  medicaid: MedicaidProfile;
  veteran: boolean;
  onVeteranChange?: (on: boolean) => void;
  preservation?: PreservationImpact;
  issueState?: string;
  preferTap?: boolean;
}) {
  const ltc = medicaidLtcOverview(state);
  const ssi = ssiAssetLimitsForLtc(state);
  const elig = eligibilityRules(state);
  const income = incomeLimitNotes(state);
  const mapt = maptRules(state);
  const protect = medicaidProtectStrategies(state);
  const vaElig = vaBenefitsEligibility();
  const aa = vaAidAttendance();
  const ceiling = assetProtectionLimits(state, medicaid.individualLimit);
  const recip = reciprocityOutcome(issueState || state, state, policy, preferTap);

  return (
    <div className="space-y-1 text-sm text-muted">
      <label className="mb-2 flex min-h-11 cursor-pointer items-start gap-2 text-sm font-semibold text-navy">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-teal"
          checked={veteran}
          disabled={!onVeteranChange}
          onChange={(e) => onVeteranChange?.(e.target.checked)}
        />
        <span>
          Wartime veteran or surviving spouse
          <span className="mt-0.5 block text-xs font-normal text-muted">
            * Wartime VA limits are illustrated only if selected.
          </span>
        </span>
      </label>

      <p className="mb-2 text-xs text-muted">
        Read in this order: what Medicaid pays, whether you could qualify, this state’s
        numbers, how spend-down works, then ways to protect remaining assets. VA notes appear
        last if the wartime box is checked.
      </p>
      <p className="mb-2 text-xs leading-relaxed text-muted">
        <LinkedCopy text={MEDICAID_FUTURE_QUALIFIER} />
      </p>
      <p className="mb-2 text-xs leading-relaxed text-muted">
        In this hypothetical:{" "}
        <a href="#qit-miller" className="source-link">QIT</a>
        {" · "}
        <a href="#mapt-trust" className="source-link">MAPT</a>
        {" · "}
        <a href="#ssi-program" className="source-link">SSI</a>
        {" · "}
        <a href="#cpi-education" className="source-link">CPI</a>
        . Sources:{" "}
        <Cite href={SRC.medicaid}>Medicaid</Cite>
        {" · "}
        <Cite href={SRC.ssaSsi}>Supplemental Security Income</Cite>
        {" · "}
        <Cite href={SRC.blsCpi}>Bureau of Labor Statistics</Cite>
        {" · "}
        <Cite href={SRC.spousalStatute}>42 U.S.C. §1396r-5</Cite>
        .
      </p>

      <p><LinkedCopy text={ltc.lead} /></p>

      {preservation?.paragraphs.length ? (
        <Fold title="This run — remaining assets and Medicaid spend-down">
          {preservation.paragraphs.map((p) => (
            <p key={p.slice(0, 56)} className="mb-2 leading-relaxed">
              <LinkedCopy text={p} />
            </p>
          ))}
        </Fold>
      ) : null}

      <Step n="1" label="What Medicaid long-term care can pay" />
      <Fold title="Covered settings">
        <ul className="list-disc space-y-1 pl-4">
          {ltc.covers.map((b) => (
            <li key={b.slice(0, 40)}><LinkedCopy text={b} /></li>
          ))}
        </ul>
      </Fold>

      <Step n="2" label="The eligibility tests" />
      <Fold title={elig.title}>
        <p className="mb-2">
          Educational planning notes for <StateName name={state} /> — not a determination of
          eligibility.
        </p>
        {elig.bullets.map((b) => (
          <Fold key={b.heading} title={b.heading}>
            <p><LinkedCopy text={b.body} /></p>
          </Fold>
        ))}
      </Fold>

      <Step n="3" label="This state’s 2026 numbers and what is not counted" />
      <Fold title={income.title}>
        <p className="mb-2"><LinkedCopy text={income.intro} /></p>
        <ul className="list-disc space-y-1 pl-4">
          {income.rows.map((r) => (
            <li key={r.label}>
              <strong className="text-navy">{r.label}.</strong> <LinkedCopy text={r.value} />
            </li>
          ))}
        </ul>
      </Fold>
      <Fold title={`Exempt assets in ${state}`}>
        <p>
          Other assets often treated as exempt for Medicaid long-term care in{" "}
          <StateName name={state} /> (2026 planning figures). This model does not auto-exclude
          them — enter a total on the Excludable assets line if you are keeping them out of
          the countable pool:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-4">
          <li>One vehicle used for transportation (any value in most states)</li>
          <li>Household goods and personal effects (furniture, clothing, appliances)</li>
          <li>Wedding / engagement ring</li>
          <li>Burial plot(s) for the applicant and immediate family</li>
          <li>Irrevocable prepaid funeral / burial contract</li>
          <li>
            Designated burial funds (<StateName name={state} /> typically up to{" "}
            {money(medicaid.burialFund)})
          </li>
          <li>
            Term life (no cash value), or cash-value life if total face is small (often{" "}
            {money(medicaid.lifeFace)} or less in <StateName name={state} />)
          </li>
          <li>Certain retirement accounts in payout status (confirm in <StateName name={state} />)</li>
          <li>Property essential to a trade or business / self-support</li>
        </ul>
        <p className="mt-2">
          Homestead is handled on the residence line. <StateName name={state} /> 2026 home-equity cap
          for a single LTC applicant:{" "}
          {medicaid.homeEquity ? money(medicaid.homeEquity) : "no stated cap"}. Cap usually does
          not apply while a spouse, minor child, or blind/disabled child lives there.
          {medicaid.notes.length ? ` ${medicaid.notes.join(" ")}` : ""} Countable examples: extra
          vehicles, investment real estate, stocks, most cash-value life above the face-value
          threshold, and accounts not in payout.
        </p>
      </Fold>
      <Fold title={ltc.impoverishment.title}>
        <p className="mb-2">{ltc.impoverishment.lead}</p>
        {ltc.impoverishment.bullets.map((b) => (
          <Fold key={b.heading} title={b.heading}>
            <p><LinkedCopy text={b.body} /></p>
          </Fold>
        ))}
      </Fold>

      <Step n="4" label="If you are over the limits — spend-down and income" />
      <Fold title={ltc.spendTitle}>
        <ul className="list-disc space-y-1 pl-4">
          {ltc.spendBullets.map((b) => (
            <li key={b.slice(0, 40)}><LinkedCopy text={b} /></li>
          ))}
        </ul>
      </Fold>
      <Fold id="qit-miller" title="Qualified Income Trust (QIT / Miller Trust)">
        <QitMillerCards state={state} />
      </Fold>
      <Fold title="How this hypothetical spends down">
        <PayoutSpendDownCard
          state={state}
          policy={policy}
          individualLimit={medicaid.individualLimit}
          collapsible={false}
        />
      </Fold>

      <Step n="5" label="Ways to protect remaining assets" />
      <Fold title="Partnership long-term care insurance">
        <p>{ltc.partnership}</p>
        <p className="mt-2 text-xs">
          Partnership can protect assets equal to benefits paid, without a five-year wait on
          those paid benefits. It does not replace the income test or a QIT. That disregard
          is current-rule planning only — it does not assume Medicaid will still be solvent
          or that the Partnership benefit will remain the same.
        </p>
        <Fold title={ceiling.title}>
          <ul className="list-disc space-y-1 pl-4">
            {ceiling.bullets.map((b) => (
              <li key={b.slice(0, 48)}><LinkedCopy text={b} /></li>
            ))}
          </ul>
        </Fold>
        <Fold title={recip.title}>
          <ul className="list-disc space-y-1 pl-4">
            {recip.bullets.map((b) => (
              <li key={b.slice(0, 48)}><LinkedCopy text={b} /></li>
            ))}
          </ul>
        </Fold>
      </Fold>
      <Fold id="mapt-trust" title={mapt.title}>
        <p className="mb-2">
          Educational only — a MAPT must be drafted by a qualified Medicaid or elder-care
          planning attorney. This model does not create or value a trust. MAPT principal
          generally needs a five-year look-back to clear.
        </p>
        {mapt.bullets.map((b) => (
          <Fold key={b.heading} title={b.heading}>
            <p><LinkedCopy text={b.body} /></p>
          </Fold>
        ))}
      </Fold>
      <Fold title="Other asset-protection strategies">
        <p className="mb-2">
          Partnership, CSRA, MAPT, and QIT are covered above. These notes are additional
          educational techniques only — not a recommendation.
        </p>
        {protect.bullets
          .filter((b) => !/partnership|csra|mapt|qualified income|miller|spend-down/i.test(b.heading))
          .map((b) => (
            <Fold key={b.heading} title={b.heading}>
              <p><LinkedCopy text={b.body} /></p>
            </Fold>
          ))}
      </Fold>

      <Step n="6" label="Related programs (do not confuse with Medicaid LTC)" />
      <Fold id="ssi-program" title={ssi.title}>
        <p className="mb-2"><LinkedCopy text={ssi.lead} /></p>
        {ssi.bullets.map((b) => (
          <Fold key={b.heading} title={b.heading}>
            <p><LinkedCopy text={b.body} /></p>
          </Fold>
        ))}
        <p className="mt-2 text-xs"><LinkedCopy text={ssi.note} /></p>
      </Fold>

      {veteran ? (
        <>
          <Step n="7" label="VA benefits (wartime veteran or surviving spouse)" />
          <Fold title={vaElig.title}>
            <p className="mb-2"><LinkedCopy text={vaElig.lead} /></p>
            <ul className="list-disc space-y-1.5 pl-4">
              {vaElig.bullets.map((b) => (
                <li key={b.heading}>
                  <strong className="text-navy">{b.heading}. </strong>
                  <LinkedCopy text={b.body} />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs">
              Confirm with a Veterans Service Officer (
              <Cite href={SRC.vaAccreditation}>VSO</Cite>
              ). Not a VA claim. Rates last reviewed {VA_RATES_REVIEWED}.
            </p>
          </Fold>
          <Fold title="VA Aid and Attendance and disability rating">
            <p className="mb-2"><LinkedCopy text={aa.summary} /></p>
            {aa.bullets.map((b) => (
              <Fold key={b.heading} title={b.heading}>
                <p><LinkedCopy text={b.body} /></p>
              </Fold>
            ))}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-muted">
                    <th className="py-1 pr-2">2026 VA pension MAPR (A&A)</th>
                    <th className="py-1 pr-2 text-right">Basic / mo</th>
                    <th className="py-1 pr-2 text-right">Housebound / mo</th>
                    <th className="py-1 text-right">Aid & Attendance / mo</th>
                  </tr>
                </thead>
                <tbody>
                  {VA_PENSION_LIMITS_2026.map((r) => (
                    <tr key={r.household} className="border-t border-line tabular-nums">
                      <td className="py-1 pr-2">{r.household}</td>
                      <td className="py-1 pr-2 text-right">{money(r.basicMonthly)}</td>
                      <td className="py-1 pr-2 text-right">{money(r.houseboundMonthly)}</td>
                      <td className="py-1 text-right">{money(r.aaMonthly)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs">
              MAPR already includes basic pension. Add {money(VA_PENSION_EXTRA_CHILD)} / year
              per extra child. Penalty divisor {money(VA_PENSION_PENALTY_RATE)} / month. Net
              worth {money(VA_NET_WORTH_2026)}. Housebound cannot be stacked with A&A.
            </p>
            <VeteranMedicaidCards state={state} />
          </Fold>
        </>
      ) : null}

      <p className="mt-3 text-xs">
        Next step: considering Medicaid planning, contact a qualified Medicaid or elder-care
        planning attorney. Not a determination of eligibility.
      </p>
    </div>
  );
}

export function MedicaidVaCard({
  state,
  policy,
  medicaid,
  veteran,
  onVeteranChange,
  preservation,
  issueState,
  preferTap,
  pdfChecked,
  onPdfChange,
  defaultOpen = false,
  pdfLocked = false,
}: {
  state: string;
  policy: LtcPolicy;
  medicaid: MedicaidProfile;
  veteran: boolean;
  onVeteranChange?: (on: boolean) => void;
  preservation?: PreservationImpact;
  issueState?: string;
  preferTap?: boolean;
  pdfChecked?: boolean;
  onPdfChange?: (on: boolean) => void;
  defaultOpen?: boolean;
  pdfLocked?: boolean;
}) {
  return (
    <div id="medicaid-va-card" className="mt-5 scroll-mt-28 card-xl px-4 py-2 lg:scroll-mt-8">
      <TitleCollapse
        title="Medicaid Information"
        className="mt-0"
        defaultOpen={defaultOpen}
        hint="Click the title to view coverage, eligibility, spend-down, protection options, and VA (if selected)."
        pdfChecked={pdfChecked}
        onPdfChange={onPdfChange}
        pdfLocked={pdfLocked}
      >
        <MedicaidVaBody
          state={state}
          policy={policy}
          medicaid={medicaid}
          veteran={veteran}
          onVeteranChange={onVeteranChange}
          preservation={preservation}
          issueState={issueState}
          preferTap={preferTap}
        />
      </TitleCollapse>
    </div>
  );
}
