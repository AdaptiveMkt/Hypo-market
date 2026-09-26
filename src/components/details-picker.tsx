import { useEffect, useState } from "react";
import { Accordion, TitleCollapse } from "@/components/accordion";
import { DesignationNotice } from "@/components/designation-notice";
import { DESIGNATION_PDF_IDS, DESIGNATION_PDF_NAMES } from "@/lib/designations";
import {
  ALL_DETAILS_ON,
  ALL_DETAILS_OFF,
  allDetailsOn,
  CLIENT_SITTING,
  DEFAULT_DETAILS,
  isClientSitting,
  DETAIL_GROUPS,
  DETAIL_HINTS,
  DETAIL_SECTIONS,
  isInsuranceDetail,
  isRequiredDetail,
  lockoutDetails,
  withRequiredDetails,
  withScenarioDetails,
  TAX_SECTION_LABEL,
  type DetailFlags,
} from "@/lib/report-options";

export function DetailsPicker({
  details,
  onChange,
  policyEnabled = true,
  lockoutMode = false,
  lockedOpen = false,
  heading,
  hint,
  className = "mb-6 card px-4 py-3",
  showReciprocity = false,
}: {
  details: DetailFlags;
  onChange: (next: DetailFlags) => void;
  policyEnabled?: boolean;
  lockoutMode?: boolean;
  lockedOpen?: boolean;
  heading?: string;
  hint?: string;
  className?: string;
  showReciprocity?: boolean;
}) {
  const full = allDetailsOn(details);
  const sitting = isClientSitting(details);
  const selected = DETAIL_SECTIONS.filter((s) => details[s.id]).length;
  const [open, setOpen] = useState(true);
  const shown = lockedOpen || open;
  const apply = (next: DetailFlags) => onChange(withScenarioDetails(next, lockoutMode));
  return (
    <div className={className}>
      <Accordion
        open={shown}
        onToggle={lockedOpen ? undefined : () => setOpen((v) => !v)}
        panelClassName="border-t border-teal/40 pt-3"
        summary={
          <span className="font-display text-lg text-navy">
            {heading ?? "Full details report"}
            <span className="mt-0.5 block text-xs font-sans font-normal text-muted">
              {hint ??
                `${selected} of ${DETAIL_SECTIONS.length} sections expanded. Click to ${
                  shown ? "collapse" : "expand"
                } this menu.`}
            </span>
          </span>
        }
      >
        {lockoutMode ? (
          <p className="text-sm text-navy">
            Countable assets are below the suitability floor. This PDF includes Medicaid
            planning, required legal disclaimers, sources, and how to find a qualified
            professional. Insurance design cannot be added on this run.
          </p>
        ) : (
          <>
        <label className="flex min-h-11 cursor-pointer items-start gap-2 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-teal"
            checked={sitting}
            onChange={(e) =>
              apply(e.target.checked ? { ...CLIENT_SITTING } : { ...DEFAULT_DETAILS })
            }
          />
          <span>
            Sitting with client
            <span className="mt-0.5 block text-xs font-normal text-muted">
              Default for the PDF. Includes allocation, care options, compare insurance, year-by-year for each selected run, Explore Traditional, Asset-based, Annuity, and Hybrid, State Partnership, and Medicaid Information. Check any other section below to add it.
            </span>
          </span>
        </label>
        <label className="mt-2 flex min-h-11 cursor-pointer items-start gap-2 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            className="mt-1 size-4 accent-teal"
            checked={full}
            onChange={(e) =>
              apply(e.target.checked ? { ...ALL_DETAILS_ON } : { ...DEFAULT_DETAILS })
            }
          />
          <span>
            Expand / include all optional sections
            <span className="mt-0.5 block text-xs font-normal text-muted">
              Makes View and PDF much longer. Use for a full file, not a first sitting.
            </span>
          </span>
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="min-h-11 rounded-lg border border-navy bg-navy px-4 text-sm font-semibold text-cream hover:bg-teal"
            onClick={() => apply({ ...ALL_DETAILS_ON })}
          >
            Select all
          </button>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-card-border bg-paper px-4 text-sm font-semibold text-navy hover:bg-cream"
            onClick={() => apply({ ...ALL_DETAILS_OFF })}
          >
            Deselect all
          </button>
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Optional sections — expand only if selected
        </p>
        <p className="mt-1 text-xs text-muted">
          Suggested order: numbers first, then insurance design, then Medicaid Information.
          {!policyEnabled
            ? ` Insurance design, Partnership, riders, ${TAX_SECTION_LABEL}, and claims history stay hidden until Include insurance in the run is checked.`
            : ""}
        </p>
          </>
        )}
        <div className="mt-3 space-y-4">
          {DETAIL_GROUPS.map((g) => {
            if (lockoutMode) {
              if (g.heading === "See the numbers" || g.heading === "Insurance design") return null;
            } else if (g.heading === "Insurance design" && !policyEnabled) {
              return null;
            }
            const items = (
              lockoutMode
                ? g.items.filter(
                    (s) =>
                      s.id !== "dhHoldHarmlessCard" &&
                      (s.id === "medicaidLtc" ||
                      s.id.startsWith("dh") ||
                      s.id === "eduHypo"),
                  )
                : policyEnabled
                  ? g.items.filter((s) => s.id !== "dhHoldHarmlessCard" && (showReciprocity || s.id !== "reciprocity"))
                  : g.items.filter((s) => s.id !== "dhHoldHarmlessCard" && !isInsuranceDetail(s.id) && s.id !== "reciprocity")
            );
            if (!items.length) return null;
            return (
            <div key={g.heading}>
              <p className="text-xs font-semibold uppercase tracking-wide text-navy">{g.heading}</p>
              <p className="mb-1 text-xs text-muted">{g.hint}</p>
              <div className="grid gap-2">
                {items.map((s) => {
                  const locked = isRequiredDetail(s.id, lockoutMode);
                  return (
                    <div key={s.id} className="rounded-lg border border-teal/40 bg-paper px-3 py-2">
                      <TitleCollapse
                        className="mt-0"
                        title={s.label}
                        hint={DETAIL_HINTS[s.id]}
                        pdfChecked={locked ? true : details[s.id]}
                        pdfLocked={locked}
                        onPdfChange={(on) => {
                          if (locked) return;
                          apply({ ...details, [s.id]: on });
                        }}
                      >
                        <p className="text-sm text-muted">{DETAIL_HINTS[s.id]}</p>
                        {locked ? (
                          <p className="mt-1 text-xs font-semibold text-muted">Required in PDF — cannot be unchecked.</p>
                        ) : (
                          <p className="mt-1 text-xs text-muted">Check Add to PDF on the right. Open the title to read what this section includes.</p>
                        )}
                      </TitleCollapse>
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      </Accordion>
    </div>
  );
}

/** Shown when Download PDF is requested — user must pick optional sections first. */
export function PdfSectionsDialog({
  open,
  details,
  onChange,
  policyEnabled,
  lockoutMode = false,
  onCancel,
  onConfirm,
  showReciprocity = false,
  advisorEmail = "",
  advisorName = "",
  clientReady = false,
  attachAdvisor = true,
  onAttachAdvisorChange,
  filenamePreview = "asset-utilization-model.pdf",
}: {
  open: boolean;
  details: DetailFlags;
  onChange: (next: DetailFlags) => void;
  policyEnabled: boolean;
  lockoutMode?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  showReciprocity?: boolean;
  advisorEmail?: string;
  advisorName?: string;
  clientReady?: boolean;
  attachAdvisor?: boolean;
  onAttachAdvisorChange?: (on: boolean) => void;
  filenamePreview?: string;
}) {
  useEffect(() => {
    if (!open) return;
    onChange(lockoutMode ? lockoutDetails() : withScenarioDetails({ ...CLIENT_SITTING }, false));
  }, [open, lockoutMode]);
  const selected = DETAIL_SECTIONS.filter((s) => details[s.id]).length;
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-navy/55 p-4 pt-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-sections-title"
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div className="card-xl w-full max-w-3xl bg-paper p-4 shadow-[var(--shadow-card)] md:p-5">
        <h2 id="pdf-sections-title" className="font-display text-xl text-navy">
          Select sections for the PDF
        </h2>
        <p className="mt-2 text-sm text-muted">
          {lockoutMode
            ? "This run is a Medicaid planning packet. Required legal disclaimers, sources, and how to find a qualified professional cannot be unchecked. Insurance design is not included."
            : "Sitting with client is selected by default. Sections 1–3 and the Ready cards always print. Check any other section below to add it to this PDF. Then save the file to this computer."}
        </p>
        {DESIGNATION_PDF_IDS.some((id) => details[id]) ? (
          <DesignationNotice
            names={[
              ...new Set(
                DESIGNATION_PDF_IDS.flatMap((id) =>
                  details[id] ? DESIGNATION_PDF_NAMES[id] ?? [] : [],
                ),
              ),
            ]}
            className="mt-3"
          />
        ) : null}
        <DetailsPicker
          details={details}
          onChange={onChange}
          policyEnabled={policyEnabled}
          lockoutMode={lockoutMode}
          showReciprocity={showReciprocity}
          lockedOpen
          heading="Optional sections"
          hint={`${selected} of ${DETAIL_SECTIONS.length} will appear in the PDF.`}
          className="mt-4 card px-4 py-3"
        />
        <div className="mt-4 stack-actions md:grid-cols-3">
          <button
            type="button"
            className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream"
            onClick={() => onChange(lockoutMode ? lockoutDetails() : withRequiredDetails({ ...ALL_DETAILS_OFF }))}
          >
            Deselect all
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105"
            onClick={onConfirm}
          >
            Download PDF and save to this computer
          </button>
        </div>
      </div>
    </div>
  );
}