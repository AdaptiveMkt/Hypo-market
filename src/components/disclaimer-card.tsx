import {
  HOLD_HARMLESS_PARAS,
  HOLD_HARMLESS_TITLE,
  PRIVACY_POLICY_INTRO,
  PRIVACY_POLICY_PARAS,
  PRIVACY_POLICY_TITLE,
  TERMS_LIABILITY_SECTIONS,
  TERMS_MAY_DO,
  TERMS_MAY_NOT,
} from "@/lib/disclaimer";
import { TitleCollapse } from "@/components/accordion";
import { AllDesignationNotice } from "@/components/designation-notice";
import { Cite, LicenseLookupLinks, LinkedCopy, SourceLinks, CopyrightMark, AmgName } from "@/components/source-links";
import { WhatConsumersBuyPanel } from "@/components/what-consumers-buy-panel";
import { WHAT_CONSUMERS_BUY_ANCHOR } from "@/lib/what-consumers-buy";
import { DISCLAIMER_HEADING_ID, isRequiredDetail, type DetailFlags, type DetailId } from "@/lib/report-options";
import { SRC } from "@/lib/sources";

const INDUSTRY_INSIGHTS_HEADINGS = new Set(["Benefit triggers", "What consumers buy"]);

/** Shown on the advisor card under Designation, not in Hold harmless. */
export const ADVISOR_MOVED_HEADINGS = new Set([
  "Contact the appropriate professional",
  "Look up a license or designation",
  "Investment adviser registration",
  "CFP® Board Standards — fiduciary duty cannot be waived",
]);

export function DesignationNoticeFold({
  details,
  onPdfChange,
  className = "mt-3",
}: {
  details?: DetailFlags;
  onPdfChange?: (id: DetailId, on: boolean) => void;
  className?: string;
}) {
  const id = DISCLAIMER_HEADING_ID["Designation non-endorsement notice"];
  const pdf =
    id && onPdfChange
      ? {
          pdfChecked: details ? Boolean(details[id]) : true,
          onPdfChange: (v: boolean) => onPdfChange(id, v),
        }
      : {};
  return (
    <TitleCollapse
      title="Designation non-endorsement notice"
      className={className}
      defaultOpen
      pdfLocked
      {...pdf}
    >
      <AllDesignationNotice className="mt-0" />
    </TitleCollapse>
  );
}

export function AdvisorProfessionalFolds({
  details,
  onPdfChange,
  lockout = false,
}: {
  details?: DetailFlags;
  onPdfChange?: (id: DetailId, on: boolean) => void;
  lockout?: boolean;
}) {
  const pdf = (heading: string) => {
    const id = DISCLAIMER_HEADING_ID[heading];
    if (!id) return {};
    const locked = isRequiredDetail(id, lockout);
    if (!onPdfChange && !locked) return {};
    return {
      pdfChecked: locked ? true : details ? Boolean(details[id]) : false,
      onPdfChange: onPdfChange ? (v: boolean) => onPdfChange(id, v) : undefined,
      pdfLocked: locked,
    };
  };
  const contact = HOLD_HARMLESS_PARAS.find(
    (p) => p.heading === "Contact the appropriate professional",
  );
  const iar = HOLD_HARMLESS_PARAS.find((p) => p.heading === "Investment adviser registration");
  const cfp = HOLD_HARMLESS_PARAS.find(
    (p) => p.heading === "CFP® Board Standards — fiduciary duty cannot be waived",
  );
  return (
    <div className="sm:col-span-2">
      {contact ? (
        <TitleCollapse
          title={contact.heading}
          className="mt-3"
          {...pdf(contact.heading)}
        >
          <p className="text-sm text-muted">
            <LinkedCopy text={contact.body} />
          </p>
        </TitleCollapse>
      ) : null}
      <TitleCollapse
        title="Look up a license or designation"
        className="mt-2"
        {...pdf("Look up a license or designation")}
      >
        <LicenseLookupLinks className="mt-1" showTitle={false} />
      </TitleCollapse>
      {iar ? (
        <TitleCollapse title={iar.heading} className="mt-2" {...pdf(iar.heading)}>
          <p className="text-sm text-muted">
            <LinkedCopy text={iar.body} />
          </p>
        </TitleCollapse>
      ) : null}
      {cfp ? (
        <TitleCollapse title={cfp.heading} className="mt-2" {...pdf(cfp.heading)}>
          <p className="text-sm text-muted">
            <LinkedCopy text={cfp.body} />
          </p>
        </TitleCollapse>
      ) : null}
    </div>
  );
}

export function DisclaimerCard({
  className = "",
  include,
  details,
  onPdfChange,
  expanded = false,
}: {
  className?: string;
  /** When set, only checked hold-harmless titles print (PDF / View). */
  include?: DetailFlags;
  details?: DetailFlags;
  onPdfChange?: (id: DetailId, on: boolean) => void;
  /** Show every section open. Used on the full terms page. */
  expanded?: boolean;
}) {
  const on = (heading: string) => {
    if (!include) return true;
    const id = DISCLAIMER_HEADING_ID[heading];
    if (!id) return true;
    return Boolean(include[id]) || isRequiredDetail(id);
  };
  const pdf = (heading: string) => {
    const id = DISCLAIMER_HEADING_ID[heading];
    if (!id) return {};
    const locked = isRequiredDetail(id);
    if (!onPdfChange && !locked) return {};
    return {
      pdfChecked: locked ? true : details ? Boolean(details[id]) : false,
      onPdfChange: onPdfChange ? (v: boolean) => onPdfChange(id, v) : undefined,
      pdfLocked: locked,
    };
  };
  const paras = HOLD_HARMLESS_PARAS.filter(
    (p) =>
      !INDUSTRY_INSIGHTS_HEADINGS.has(p.heading) &&
      !ADVISOR_MOVED_HEADINGS.has(p.heading) &&
      on(p.heading),
  );
  const showMayDo = on("What you may do");
  const showMayNot = on("What you may not do");
  const showHold = on(HOLD_HARMLESS_TITLE);
  const showLiability = on("Limitation of liability and other terms");
  const showAssumptions = on("Assumptions and cost data");
  const showSources = on("Sources used in this hypothetical");
  const showPrivacy = on("Privacy policy");
  if (
    include &&
    !paras.length &&
    !showPrivacy &&
    !showMayDo &&
    !showMayNot &&
    !showHold &&
    !showLiability &&
    !showAssumptions &&
    !showSources
  )
    return null;

  const liability = TERMS_LIABILITY_SECTIONS.filter(
    (p) => p.heading !== "Benefit triggers",
  );

  return (
    <div className={className}>
      <p className="text-sm text-muted">
        This Long Term Care Asset Utilization Modeling tool is an educational hypothetical
        only. It is not a quote, illustration, or advice. Viewing, downloading, or sharing
        a report is agreement to these disclosures and terms of use. <CopyrightMark />
      </p>

      {showMayDo ? (
      <TitleCollapse defaultOpen={expanded} title="What you may do" className="mt-3" {...pdf("What you may do")}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {TERMS_MAY_DO.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </TitleCollapse>
      ) : null}

      {showMayNot ? (
      <TitleCollapse defaultOpen={expanded} title="What you may not do" className="mt-2" {...pdf("What you may not do")}>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
          {TERMS_MAY_NOT.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-muted">
          Permission for any other use requires written consent from <AmgName />.
        </p>
      </TitleCollapse>
      ) : null}

      {showHold ? (
      <TitleCollapse defaultOpen={expanded}
        title={HOLD_HARMLESS_TITLE}
        className="mt-2"
        hint="Click the title to view publisher, legal, and privacy disclosures."
        {...pdf(HOLD_HARMLESS_TITLE)}
      >
        {paras.map((p) => {
          const extra = p.heading === "What consumers buy" ? <WhatConsumersBuyPanel /> : null;
          const body = (
            <TitleCollapse defaultOpen={expanded} key={p.heading} title={p.heading} className="mt-2" {...pdf(p.heading)}>
              <p className="text-sm text-muted">
                <LinkedCopy text={p.body} />
              </p>
              {extra}
            </TitleCollapse>
          );
          if (p.heading === "What consumers buy") {
            return (
              <div key={p.heading} id={WHAT_CONSUMERS_BUY_ANCHOR} className="scroll-mt-8">
                {body}
              </div>
            );
          }
          return body;
        })}
      </TitleCollapse>
      ) : null}

      {showLiability ? (
      <TitleCollapse defaultOpen={expanded}
        title="Limitation of liability and other terms"
        className="mt-2"
        {...pdf("Limitation of liability and other terms")}
      >
        {liability.map((p) => (
          <TitleCollapse defaultOpen={expanded} key={`tou-${p.heading}`} title={p.heading} className="mt-2">
            <p className="text-sm text-muted">
              <LinkedCopy text={p.body} />
            </p>
          </TitleCollapse>
        ))}
      </TitleCollapse>
      ) : null}

      {showPrivacy ? (
        <PrivacyPolicyBlock expanded={expanded} details={details} onPdfChange={onPdfChange} />
      ) : null}

      {showAssumptions ? (
      <TitleCollapse defaultOpen={expanded}
        title="Assumptions and cost data"
        className="mt-2"
        {...pdf("Assumptions and cost data")}
      >
        <p className="text-sm text-muted">
          Figures change with the assumptions you enter (care setting, timing, CPI,
          returns, tax rate, and any benefits). State care costs are rounded annual medians
          from the <Cite href={SRC.carescout}>CareScout</Cite> /{" "}
          <Cite href={SRC.genworth}>Genworth Cost of Care Survey 2025</Cite> (published
          2026). A local provider’s price may differ.
        </p>
      </TitleCollapse>
      ) : null}

      {showSources ? (
      <SourceLinks
        className="mt-2"
        pdfChecked={details ? Boolean(details.dhSources) : undefined}
        onPdfChange={onPdfChange ? (v) => onPdfChange("dhSources", v) : undefined}
      />
      ) : null}
    </div>
  );
}

export function PrivacyPolicyBlock({
  className = "mt-2",
  details,
  onPdfChange,
  expanded = false,
}: {
  className?: string;
  details?: DetailFlags;
  onPdfChange?: (id: DetailId, on: boolean) => void;
  expanded?: boolean;
}) {
  return (
    <div className={className}>
      <TitleCollapse defaultOpen={expanded}
        title={PRIVACY_POLICY_TITLE}
        className="mt-0"
        pdfChecked={details ? Boolean(details.dhPrivacy) : undefined}
        onPdfChange={onPdfChange ? (v) => onPdfChange("dhPrivacy", v) : undefined}
      >
        <p className="text-sm text-muted">
          <LinkedCopy text={PRIVACY_POLICY_INTRO} />
        </p>
        {PRIVACY_POLICY_PARAS.map((p) => (
          <TitleCollapse defaultOpen={expanded} key={p.heading} title={p.heading} className="mt-2">
            <p className="text-sm text-muted">
              <LinkedCopy text={p.body} />
            </p>
          </TitleCollapse>
        ))}
      </TitleCollapse>
    </div>
  );
}
