"use client";

import { useEffect, useRef, useState } from "react";
import { FieldPicker } from "@/components/field-picker";
import { STATE_NAMES } from "@/lib/costs";
import { submitContactRequest } from "@/lib/send-report-mail";
import { CONTACT_EMAIL } from "@/lib/email-attachment";
import { PdfPageView } from "@/components/pdf-page-view";

const fieldClass =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-navy";
const labelClass = "mb-1 block text-sm font-semibold text-navy";

export function ContactAskDialog({
  open,
  onYes,
  onNo,
}: {
  open: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy/55 p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-ask-title"
    >
      <div className="card-xl w-full max-w-lg bg-paper p-4 shadow-[var(--shadow-card)] md:p-5">
        <h2 id="contact-ask-title" className="font-display text-xl text-navy">
          Would you like someone to contact you?
        </h2>
        <p className="mt-2 text-sm text-muted">
          Your PDF is saved on this device. No advisor email was on this run, so no
          copy was emailed. If you would like a representative to follow up, we will
          ask for your name, phone, email, and state. That request is sent to{" "}
          {CONTACT_EMAIL}.
        </p>
        <div className="mt-4 stack-actions md:grid-cols-2">
          <button
            type="button"
            className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105"
            onClick={onYes}
          >
            Yes, contact me
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-navy text-navy hover:bg-cream"
            onClick={onNo}
          >
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdvisorCaptureDialog({
  open,
  name,
  phone,
  email,
  state,
  onChange,
  onCancel,
  onSubmit,
}: {
  open: boolean;
  name: string;
  phone: string;
  email: string;
  state: string;
  onChange: (partial: { name?: string; phone?: string; email?: string; state?: string }) => void;
  onCancel: () => void;
  onSubmit: () => void;
}) {
  if (!open) return null;
  const ready = Boolean(name.trim() && phone.trim() && email.includes("@") && state.trim());
  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy/55 p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-capture-title"
    >
      <form
        className="card-xl w-full max-w-lg bg-paper p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit();
        }}
      >
        <h2 id="advisor-capture-title" className="font-display text-xl text-navy">
          Advisor information
        </h2>
        <p className="mt-2 text-sm text-muted">
          Name, phone, email, and state are required before this DEMO report can be saved.
          Delivery is not sent from this screen.
        </p>
        <div className="mt-4 grid gap-3">
          <div>
            <label className={labelClass} htmlFor="advisor-save-name">Name</label>
            <input id="advisor-save-name" required className={fieldClass} value={name} autoComplete="name" onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="advisor-save-phone">Phone</label>
            <input id="advisor-save-phone" required className={fieldClass} value={phone} autoComplete="tel" onChange={(e) => onChange({ phone: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="advisor-save-email">Email</label>
            <input id="advisor-save-email" required type="email" className={fieldClass} value={email} autoComplete="email" onChange={(e) => onChange({ email: e.target.value })} />
          </div>
          <div>
            <label className={labelClass} htmlFor="advisor-save-state">State</label>
            <FieldPicker
              id="advisor-save-state"
              value={state}
              placeholder="Select a state…"
              options={STATE_NAMES.map((s) => ({ value: s, label: s }))}
              onChange={(v) => onChange({ state: v })}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn-block rounded-lg bg-navy text-cream hover:bg-teal disabled:opacity-40" disabled={!ready}>
            Save PDF
          </button>
        </div>
      </form>
    </div>
  );
}

export function ContactRequestDialog({
  open,
  initial,
  onCancel,
  onSent,
}: {
  open: boolean;
  initial?: { name?: string; phone?: string; email?: string; state?: string };
  onCancel: () => void;
  onSent: (ok: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [ack, setAck] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const place = state || "[state]";
  const ackText = `I am requesting additional information, please send me at least two qualified professional Long term care representatives in ${place}.`;
  if (!open) return null;

  async function submit() {
    setError("");
    if (!state) {
      setError("Select a state.");
      return;
    }
    if (!ack) {
      setError("Check the box to request contact in your state.");
      return;
    }
    setBusy(true);
    try {
      const r = await submitContactRequest({
        data: { name, phone, email, state, acknowledged: true },
      });
      onSent(Boolean(r.emailed));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy/55 p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-form-title"
    >
      <div className="card-xl w-full max-w-lg bg-paper p-4 shadow-[var(--shadow-card)] md:p-5">
        <h2 id="contact-form-title" className="font-display text-xl text-navy">
          Contact request
        </h2>
        <p className="mt-2 text-sm text-navy">
          I am requesting contact of a long term care professional in my state. Please
          forward me the contact information of at least 2 individuals.
        </p>
        <p className="mt-2 text-sm text-muted">
          All four fields are required. Submit sends this request to {CONTACT_EMAIL}. This
          is not a quote or an application.
        </p>
        <div className="mt-3 grid gap-3">
          <div>
            <label className={labelClass} htmlFor="contact-req-name">Name</label>
            <input
              id="contact-req-name"
              className={fieldClass}
              value={name}
              autoComplete="name"
              required
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="contact-req-phone">Phone</label>
            <input
              id="contact-req-phone"
              className={fieldClass}
              value={phone}
              autoComplete="tel"
              required
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="contact-req-email">Email</label>
            <input
              id="contact-req-email"
              className={fieldClass}
              type="email"
              value={email}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="contact-req-state">State</label>
            <FieldPicker
              id="contact-req-state"
              value={state}
              placeholder="Select a state…"
              invalid={!state}
              options={STATE_NAMES.map((s) => ({ value: s, label: s }))}
              onChange={(next) => {
                setState(next);
                setAck(false);
              }}
            />
          </div>
          <label className="flex items-start gap-3 text-sm text-navy">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-teal"
              checked={ack}
              disabled={!state}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span>{ackText}</span>
          </label>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-deplete" role="alert">{error}</p> : null}
        <div className="mt-4 stack-actions md:grid-cols-2">
          <button
            type="button"
            className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105 disabled:opacity-50"
            disabled={busy || !ack}
            onClick={() => void submit()}
          >
            {busy ? "Sending…" : "Submit"}
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-navy text-navy hover:bg-cream"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/** After the PDF is built. No file link is on the page until the visitor clicks Save or Open. */
export function PdfReadyDialog({
  open,
  filename,
  url,
  pages,
  note,
  onContinue,
  onSaved,
}: {
  open: boolean;
  filename: string;
  url: string;
  pages: string[];
  note?: string;
  onContinue: () => void;
  onSaved?: () => void;
}) {
  const [viewing, setViewing] = useState(true);
  const [full, setFull] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!full) return;
    const node = stageRef.current;
    let entered = false;
    if (node && !document.fullscreenElement && node.requestFullscreen) {
      node.requestFullscreen().then(() => {
        entered = true;
      }).catch(() => {
        /* The overlay still fills the page if the browser blocks full screen. */
      });
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setFull(false);
    }
    function onFullChange() {
      if (document.fullscreenElement === node) entered = true;
      else if (entered) setFull(false);
    }
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullChange);
    };
  }, [full]);
  if (!open || !url) return null;

  function saveToComputer() {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    window.setTimeout(() => a.remove(), 0);
    onSaved?.();
  }

  function exitFull() {
    setFull(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {
        /* already left */
      });
    }
  }

  return (
    <div
      className={`fixed inset-0 z-[70] flex justify-center bg-navy/55 ${
        viewing
          ? "items-stretch overflow-hidden p-2 pt-[max(0.5rem,env(safe-area-inset-top))]"
          : "items-start overflow-y-auto p-3 pt-10 sm:p-4 sm:pt-16"
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-ready-title"
    >
      <div
        className={`card-xl flex w-full flex-col bg-paper p-3 shadow-[var(--shadow-card)] sm:p-5 ${
          viewing ? "h-full max-h-full min-h-0 max-w-4xl" : "max-w-lg"
        }`}
      >
        <h2 id="pdf-ready-title" className="shrink-0 font-display text-xl text-navy">
          Your PDF is ready
        </h2>
        {viewing ? null : (
          <p className="mt-2 text-sm text-muted">
            Nothing is downloaded until you choose Save PDF to this computer. Open PDF
            shows the pages here on phone and desktop — same readable pages, not a blank
            frame.
          </p>
        )}
        <p className="mt-2 shrink-0 truncate rounded-lg border border-teal/40 bg-cream/40 px-3 py-2 text-sm text-navy">
          {filename}
        </p>
        {note && !viewing ? <p className="mt-2 text-sm text-navy">{note}</p> : null}
        {viewing && !full ? <PdfPageView pages={pages} fill /> : null}
        <div className={`shrink-0 stack-actions ${viewing ? "mt-2 grid grid-cols-2" : "mt-4"}`}>
          <button
            type="button"
            className="btn-block rounded-lg border border-gold bg-gold text-center text-masthead hover:brightness-105"
            onClick={saveToComputer}
          >
            Save PDF to this computer
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-navy bg-navy text-center text-cream hover:bg-teal"
            onClick={() => setViewing((v) => !v)}
          >
            {viewing ? "Hide PDF" : "Open PDF"}
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-gold bg-gold text-center text-masthead hover:brightness-105"
            onClick={() => {
              setViewing(true);
              setFull(true);
            }}
          >
            Full screen
          </button>
          <button
            type="button"
            className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
      {full ? (
        <div
          ref={stageRef}
          className="fixed inset-0 z-[90] flex h-[100dvh] w-screen flex-col bg-navy"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-2">
            <p className="min-w-0 truncate text-sm text-cream">{filename}</p>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-gold bg-gold px-4 py-2 text-sm font-semibold text-masthead"
              onClick={exitFull}
            >
              Exit full screen
            </button>
          </div>
          <PdfPageView pages={pages} fill />
        </div>
      ) : null}
    </div>
  );
}

const PLAN_DISCLAIMER =
  "By submitting, you ask that a licensed financial services professional who can discuss long-term care planning in your state may contact you in the way you selected. You do not have to buy insurance or any investment. You do not have to share any personal or financial information beyond what you choose to enter here. This request is not an application, a quote, or advice.";

export function PlanningAssistDialog({
  open,
  step,
  initial,
  onNo,
  onYes,
  onCloseForm,
  onSent,
}: {
  open: boolean;
  step: "ask" | "form";
  initial?: { name?: string; state?: string; age?: string; email?: string; phone?: string };
  onNo: () => void;
  onYes: () => void;
  onCloseForm: () => void;
  onSent: (ok: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [state, setState] = useState(initial?.state ?? "");
  const [age, setAge] = useState(initial?.age ?? "");
  const [partner, setPartner] = useState<"" | "yes" | "no">("");
  const [partnerAge, setPartnerAge] = useState("");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [prefer, setPrefer] = useState<"" | "Call" | "Text" | "Email">("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  async function submit() {
    setError("");
    if (name.trim().length < 2) {
      setError("Full name is required.");
      return;
    }
    if (partner === "yes" && !partnerAge.trim()) {
      setError("Enter the age of your spouse or domestic partner.");
      return;
    }
    setBusy(true);
    try {
      const r = await submitContactRequest({
        data: {
          name,
          phone,
          email,
          state,
          acknowledged: true,
          age,
          partner: partner === "yes" ? "Yes" : partner === "no" ? "No" : "",
          partnerAge: partner === "yes" ? partnerAge : "",
          prefer,
        },
      });
      onSent(Boolean(r.emailed));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-navy/55 p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-assist-title"
    >
      <div className="card-xl w-full max-w-lg bg-paper p-4 shadow-[var(--shadow-card)] md:p-5">
        {step === "ask" ? (
          <>
            <h2 id="plan-assist-title" className="font-display text-xl text-navy">
              Do you want assistance with long-term care planning?
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button type="button" className="btn-block rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-cream" onClick={onYes}>
                Yes
              </button>
              <button type="button" className="btn-block rounded-lg border border-navy px-4 py-2.5 text-sm font-semibold text-navy" onClick={onNo}>
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="plan-assist-title" className="font-display text-xl text-navy">
              Long-term care planning request
            </h2>
            <div className="mt-3 grid gap-3">
              <div>
                <label className={labelClass} htmlFor="plan-name">What is your full name? (required)</label>
                <input id="plan-name" className={fieldClass} value={name} autoComplete="name" required onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="plan-state">What is your state of residence?</label>
                <FieldPicker
                  id="plan-state"
                  value={state}
                  placeholder="Select a state…"
                  options={STATE_NAMES.map((s) => ({ value: s, label: s }))}
                  onChange={setState}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="plan-age">What is your age?</label>
                <input id="plan-age" className={fieldClass} inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value.replace(/[^\d]/g, "").slice(0, 3))} />
              </div>
              <div>
                <p className={labelClass}>Do you have a spouse or domestic partner?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className={`rounded-lg px-3 py-2 text-sm font-semibold ${partner === "yes" ? "bg-teal text-cream" : "border border-navy text-navy"}`} onClick={() => setPartner("yes")}>Yes</button>
                  <button type="button" className={`rounded-lg px-3 py-2 text-sm font-semibold ${partner === "no" ? "bg-teal text-cream" : "border border-navy text-navy"}`} onClick={() => setPartner("no")}>No</button>
                </div>
              </div>
              {partner === "yes" ? (
                <div>
                  <label className={labelClass} htmlFor="plan-partner-age">Age of spouse or domestic partner</label>
                  <input id="plan-partner-age" className={fieldClass} inputMode="numeric" value={partnerAge} onChange={(e) => setPartnerAge(e.target.value.replace(/[^\d]/g, "").slice(0, 3))} />
                </div>
              ) : null}
              <div>
                <label className={labelClass} htmlFor="plan-email">What is your email address?</label>
                <input id="plan-email" className={fieldClass} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelClass} htmlFor="plan-phone">What is your phone or text number?</label>
                <input id="plan-phone" className={fieldClass} autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <p className={labelClass}>Which way do you prefer to be contacted?</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["Call", "Text", "Email"] as const).map((way) => (
                    <button key={way} type="button" className={`rounded-lg px-3 py-2 text-sm font-semibold ${prefer === way ? "bg-teal text-cream" : "border border-navy text-navy"}`} onClick={() => setPrefer(way)}>
                      {way}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {error ? <p className="mt-2 text-sm font-semibold text-deplete" role="alert">{error}</p> : null}
            <button
              type="button"
              className="btn-block mt-4 rounded-lg bg-teal px-4 py-2.5 text-sm font-semibold text-cream disabled:opacity-50"
              disabled={busy}
              onClick={() => void submit()}
            >
              {busy ? "Sending…" : "Submit"}
            </button>
            <p className="mt-2 text-xs leading-relaxed text-muted">* {PLAN_DISCLAIMER}</p>
            <button type="button" className="mt-3 text-sm text-navy underline" disabled={busy} onClick={onCloseForm}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
