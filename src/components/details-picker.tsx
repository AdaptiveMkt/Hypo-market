import { useEffect, useState } from "react";
import { Accordion, TitleCollapse } from "@/components/accordion";
import { DesignationNotice } from "@/components/designation-notice";
import { DESIGNATION_PDF_IDS, DESIGNATION_PDF_NAMES } from "@/lib/designations";
import {
  EMAIL_FROM,
  EMAIL_FROM_ADDRESS,
  PDF_CONTENT_DISPOSITION,
  PDF_MIME,
  TEST_MAIL_TO,
  type SmtpPublicStatus,
} from "@/lib/email-attachment";
import { sendTestPdfAttachment, getMailStatus } from "@/lib/send-report-mail";
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
            Client sitting (recommended)
            <span className="mt-0.5 block text-xs font-normal text-muted">
              Allocation, care options, compare insurance, year-by-year for each selected run, Explore Traditional, Asset-based, Annuity, and Hybrid, State Partnership, and Medicaid Information.
              Not the full packet.
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
                      s.id === "medicaidLtc" ||
                      s.id.startsWith("dh") ||
                      s.id === "eduHypo",
                  )
                : policyEnabled
                  ? g.items.filter((s) => showReciprocity || s.id !== "reciprocity")
                  : g.items.filter((s) => !isInsuranceDetail(s.id) && s.id !== "reciprocity")
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
  const [step, setStep] = useState<"attachment" | "sections">("attachment");
  const [testMsg, setTestMsg] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [mail, setMail] = useState<SmtpPublicStatus | null>(null);
  useEffect(() => {
    if (open) {
      setStep("attachment");
      setTestMsg("");
      void getMailStatus().then(setMail).catch(() => setMail(null));
    }
  }, [open]);
  const selected = DETAIL_SECTIONS.filter((s) => details[s.id]).length;
  const advisorCopyOk = Boolean(advisorEmail && clientReady);
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
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">
          Step {step === "attachment" ? "1 of 2" : "2 of 2"}
        </p>
        <h2 id="pdf-sections-title" className="font-display text-xl text-navy">
          {step === "attachment" ? "Email attachment settings" : "Select sections for the PDF"}
        </h2>

        {step === "attachment" ? (
          <>
            <p className="mt-2 text-sm text-muted">
              The end user always downloads the PDF on this device. Configure the advisor
              copy next. Mail is sent from {EMAIL_FROM_ADDRESS}.
            </p>
            <dl className="mt-4 grid gap-3 text-sm text-navy sm:grid-cols-2">
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">From</dt>
                <dd className="mt-0.5 break-all">{EMAIL_FROM}</dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">SMTP host</dt>
                <dd className="mt-0.5 break-all">{mail?.host ?? "Checking…"}</dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Port / security</dt>
                <dd className="mt-0.5">
                  {mail ? `${mail.port} · ${mail.secure ? "SSL (465)" : "STARTTLS (587)"}` : "587 · STARTTLS"}
                </dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Username</dt>
                <dd className="mt-0.5 break-all">{mail?.user ?? "Not set"}</dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Password</dt>
                <dd className="mt-0.5">{mail?.passwordSet ? "Set on host (never shown here)" : "Not set"}</dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Transport</dt>
                <dd className="mt-0.5">
                  {mail?.transport === "smtp"
                    ? "SMTP connected (TLS 1.2+)"
                    : mail?.transport === "resend"
                      ? "API fallback (Resend)"
                      : "Not connected — mailbox host, username, and password stay on the server"}
                </dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Advisor to</dt>
                <dd className="mt-0.5 break-all">
                  {advisorCopyOk
                    ? `${advisorName || "Advisor"} <${advisorEmail}>`
                    : "Not available — enter advisor email and end-user contact"}
                </dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Attachment type</dt>
                <dd className="mt-0.5">
                  {PDF_MIME} · {PDF_CONTENT_DISPOSITION}
                </dd>
              </div>
              <div className="rounded-lg border border-teal/40 bg-cream/40 px-3 py-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted">Filename</dt>
                <dd className="mt-0.5 break-all">{filenamePreview}</dd>
              </div>
            </dl>
            <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-2 text-sm font-semibold text-navy">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-teal"
                checked={advisorCopyOk && attachAdvisor}
                disabled={!advisorCopyOk}
                onChange={(e) => onAttachAdvisorChange?.(e.target.checked)}
              />
              <span>
                Attach the PDF and email it to the advisor
                <span className="mt-0.5 block text-xs font-normal text-muted">
                  {advisorCopyOk
                    ? "Required when both the advisor email and the end user’s contact are on this run. Uncheck to download only."
                    : "This option unlocks when the advisor email and the end user’s name or email are both entered."}
                </span>
              </span>
            </label>
            <p className="mt-3 text-xs text-muted">
              End-user download is always on. If this box is off or the advisor is missing,
              only the person at this device keeps the file. After that, they can ask to be
              contacted. Mailbox passwords are stored only on the host, sent over TLS 1.2 or
              newer, and are never written into this page or the PDF.
            </p>
            <div className="mt-4 rounded-lg border border-line px-3 py-3">
              <p className="text-sm font-semibold text-navy">Send a test attachment</p>
              <p className="mt-1 text-xs text-muted">
                Sends a one-page sample PDF ({PDF_MIME}) from {EMAIL_FROM_ADDRESS} to{" "}
                {TEST_MAIL_TO}. Open that inbox to confirm the file arrives and opens.
              </p>
              <button
                type="button"
                className="mt-2 btn-block rounded-lg border border-navy bg-navy text-cream hover:bg-teal disabled:opacity-50 md:max-w-xs"
                disabled={testBusy}
                onClick={() => {
                  setTestBusy(true);
                  setTestMsg("");
                  void sendTestPdfAttachment({ data: { to: TEST_MAIL_TO } })
                    .then((r) => {
                      setTestMsg(
                        r.emailed
                          ? `Test PDF sent to ${r.to} from ${EMAIL_FROM_ADDRESS}. Check that inbox.`
                          : `Test did not send to ${r.to}. ${r.error ?? "Connect Resend and verify the from-address, then try again."}`,
                      );
                    })
                    .catch((err) => {
                      setTestMsg(err instanceof Error ? err.message : "Test send failed.");
                    })
                    .finally(() => setTestBusy(false));
                }}
              >
                {testBusy ? "Sending test…" : `Send test to ${TEST_MAIL_TO}`}
              </button>
              {testMsg ? (
                <p className="mt-2 text-sm font-semibold text-navy" role="status">
                  {testMsg}
                </p>
              ) : null}
            </div>
            <div className="mt-4 stack-actions md:grid-cols-2">
              <button
                type="button"
                className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105"
                onClick={() => setStep("sections")}
              >
                Next — select sections
              </button>
            </div>
          </>
        ) : (
          <>
        <p className="mt-2 text-sm text-muted">
          {lockoutMode
            ? "This run is a Medicaid planning packet. Required legal disclaimers, sources, and how to find a qualified professional cannot be unchecked. Insurance design is not included."
            : "Sections 1–3, the Ready cards you left on screen, and a year-by-year column report for each selected run always print. Client sitting is the default and includes Explore Traditional, Asset-based, Annuity, and Hybrid. Other checked cards print in the same order as View. Then save the file to this computer."}
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
            onClick={() => onChange(lockoutMode ? lockoutDetails() : withRequiredDetails({ ...ALL_DETAILS_OFF }))}
          >
            Deselect all
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream"
            onClick={() => setStep("attachment")}
          >
            Back
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105"
            onClick={onConfirm}
          >
            Download PDF and save to this computer
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}