import { type ReactNode } from "react";
import { TitleCollapse } from "@/components/accordion";
import { DesignationNotice } from "@/components/designation-notice";
import { designationsInText } from "@/lib/designations";
import { HYPO_SOURCES, LICENSE_LOOKUPS, SRC } from "@/lib/sources";

const LINK =
  "source-link font-semibold text-link underline underline-offset-2 hover:text-link";

const PHRASES: [string, string][] = [
  ["Adaptive Marketing Group", SRC.amg],
  ["CERTIFIED FINANCIAL PLANNER™", SRC.cfpVerify],
  ["CFP Board", SRC.cfpCode],
  ["CFP®", SRC.cfpVerify],
  ["ChFC®", SRC.chfc],
  ["CLU®", SRC.clu],
  ["RICP®", SRC.ricp],
  ["CLTC", SRC.cltcFind],
  ["LTCP", SRC.ltcp],
  ["CELA", SRC.nelfCela],
  ["CPA", SRC.cpaVerify],
  ["enrolled agent (EA)", SRC.ea],
  ["Enrolled Agent", SRC.ea],
  ["BrokerCheck", SRC.finraBrokercheck],
  ["Form ADV", SRC.secIapd],
  ["IAPD", SRC.secIapd],
  ["VSO", SRC.vaAccreditation],
  ["IRC §7702B", SRC.irc7702b],
  ["IRC §101(g)", SRC.irc101g],
  ["IRC §1035", SRC.irc1035],
  ["IRS Publication 502", SRC.irs502],
  ["Publication 502", SRC.irs502],
  ["Deficit Reduction Act", SRC.dra2005],
  ["DRA Partnership", SRC.ltcPartnership],
  ["Long-Term Care Partnership", SRC.ltcPartnership],
  ["Partnership program", SRC.ltcPartnership],
  ["Qualified Income Trust", SRC.medicaidElig],
  ["Miller Trust", SRC.medicaidElig],
  ["community spouse resource allowance", SRC.medicaidSpousal],
  ["Community spouse resource allowance", SRC.medicaidSpousal],
  ["spousal impoverishment", SRC.medicaidSpousal],
  ["Spousal impoverishment", SRC.medicaidSpousal],
  ["42 U.S.C. §1396r-5", SRC.spousalStatute],
  ["Aid and Attendance", SRC.vaAa],
  ["VA pension", SRC.vaPensionElig],
  ["Medicare Advantage", SRC.medicareAdvantage],
  ["Medicare Part A", SRC.medicarePartA],
  ["Medicare Part B", SRC.medicarePartB],
  ["Medicare Part D", SRC.medicarePartD],
  ["Original Medicare", SRC.medicare],
  ["Medigap", SRC.medicareMedigap],
  ["Medicare Supplement", SRC.medicareMedigap],
  ["Medicare", SRC.medicare],
  ["Medicaid", SRC.medicaid],
  ["Supplemental Security Income", SRC.ssaSsi],
  ["CareScout Cost of Care", SRC.carescout],
  ["CareScout", SRC.carescout],
  ["Genworth Cost of Care", SRC.genworth],
  ["Bureau of Labor Statistics", SRC.blsCpi],
  ["Consumer Price Index", SRC.blsCpi],
  ["NAIC Shopper’s Guide", SRC.naicShopper],
  ["Shopper’s Guide to Long-Term Care Insurance", SRC.naicShopper],
  ["NAIC life settlements guide (2022)", SRC.naicLifeSettlement],
  ["NAIC Viatical Settlements Model Act #697", SRC.naicModel697],
  ["Personal Worksheet", SRC.naicSuitability],
  ["2026 AALTCI Long-Term Care Insurance Price Index", SRC.aaltciPrice2026],
  ["AALTCI", SRC.aaltci],
  ["Milliman", SRC.millimanSurvey2025],
  ["LIMRA", SRC.limra],
  ["Society of Actuaries", SRC.soa],
  ["NAIC", SRC.naicLtc],
  ["CSRA", SRC.medicaidSpousal],
  ["MMMNA", SRC.medicaidSpousal],
  ["QIT", SRC.medicaidElig],
  ["SSI", SRC.ssaSsi],
];

export function AmgName({ className = LINK }: { className?: string }) {
  return (
    <a href={SRC.amg} target="_blank" rel="noopener noreferrer" className={className}>
      Adaptive Marketing Group
    </a>
  );
}

export function CopyrightMark({
  linkClass = LINK,
}: {
  linkClass?: string;
}) {
  return (
    <>
      © 2026 <AmgName className={linkClass} />. All rights reserved.
    </>
  );
}

export function Cite({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={LINK}
      data-source-href={href}
    >
      {children}
    </a>
  );
}

export function LinkedCopy({
  text,
  notice = false,
}: {
  text: string;
  notice?: boolean;
}) {
  const nodes: ReactNode[] = [];
  let rest = text;
  let i = 0;
  while (rest.length) {
    let hit: { at: number; phrase: string; href: string } | null = null;
    for (const [phrase, href] of PHRASES) {
      const at = rest.indexOf(phrase);
      if (at < 0) continue;
      if (!hit || at < hit.at) hit = { at, phrase, href };
    }
    if (!hit) {
      nodes.push(rest);
      break;
    }
    if (hit.at > 0) nodes.push(rest.slice(0, hit.at));
    nodes.push(
      <a
        key={`${hit.phrase}-${i++}`}
        href={hit.href}
        target="_blank"
        rel="noopener noreferrer"
        className={LINK}
        data-source-href={hit.href}
      >
        {hit.phrase}
      </a>,
    );
    rest = rest.slice(hit.at + hit.phrase.length);
  }
  const names = notice ? designationsInText(text) : [];
  return (
    <>
      {nodes}
      {names.length ? <DesignationNotice names={names} /> : null}
    </>
  );
}

export function SourceLinks({
  className = "",
  showTitle = true,
  pdfChecked,
  onPdfChange,
}: {
  className?: string;
  showTitle?: boolean;
  pdfChecked?: boolean;
  onPdfChange?: (checked: boolean) => void;
}) {
  return (
    <div className={className}>
      {showTitle ? (
        <TitleCollapse
          title="Sources used in this hypothetical"
          className="mt-0"
          pdfChecked={pdfChecked}
          onPdfChange={onPdfChange}
        >
          <SourceList />
        </TitleCollapse>
      ) : (
        <SourceList />
      )}
    </div>
  );
}

function SourceList() {
  return (
    <>
      <p className="mt-1 text-sm text-muted">
        Planning figures were drawn from the following public pages. Links open the
        publisher’s site. Re-check before any decision — agencies update tables, often
        each January 1 or December 1.
      </p>
      {HYPO_SOURCES.map((s) => (
        <TitleCollapse key={s.href} title={s.topic} className="mt-2">
          <p className="text-sm text-muted">
            <a href={s.href} target="_blank" rel="noopener noreferrer" className={LINK} data-source-href={s.href}>
              {s.label}
            </a>
            {s.note ? ` — ${s.note}` : null}
          </p>
        </TitleCollapse>
      ))}
    </>
  );
}

export function LicenseLookupLinks({
  className = "",
  showTitle = true,
}: {
  className?: string;
  showTitle?: boolean;
}) {
  return (
    <div className={className}>
      {showTitle ? (
        <TitleCollapse title="Look up a license or designation" className="mt-0">
          <LicenseList />
        </TitleCollapse>
      ) : (
        <LicenseList />
      )}
    </div>
  );
}

function LicenseList() {
  return (
    <>
      <p className="mt-1 text-sm text-muted">
        Confirm the person is licensed for the work they are doing. A designation (
        <Cite href={SRC.cfpVerify}>CFP®</Cite>, <Cite href={SRC.cltcFind}>CLTC</Cite>,{" "}
        <Cite href={SRC.ltcp}>LTCP</Cite>, <Cite href={SRC.nelfCela}>CELA</Cite>,{" "}
        <Cite href={SRC.chfc}>ChFC®</Cite>, <Cite href={SRC.clu}>CLU®</Cite>) shows
        education; it does not replace a state license or SEC/state registration.
      </p>
      {LICENSE_LOOKUPS.map((s) => (
        <TitleCollapse key={s.href} title={s.topic} className="mt-2">
          <p className="text-sm text-muted">
            <a href={s.href} target="_blank" rel="noopener noreferrer" className={LINK} data-source-href={s.href}>
              {s.label}
            </a>
            {s.note ? ` — ${s.note}` : null}
          </p>
        </TitleCollapse>
      ))}
    </>
  );
}
