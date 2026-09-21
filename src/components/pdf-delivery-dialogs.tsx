"use client";

import { useState } from "react";
import { FieldPicker } from "@/components/field-picker";
import { STATE_NAMES } from "@/lib/costs";
import { submitContactRequest } from "@/lib/send-report-mail";

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
          info@fundingltcmarketplace.com.
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
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const r = await submitContactRequest({
        data: { name, phone, email, state },
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
        <p className="mt-2 text-sm text-muted">
          All four fields are required. Submit sends this request to{" "}
          info@fundingltcmarketplace.com. This is not a quote or an application.
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
              onChange={setState}
            />
          </div>
        </div>
        {error ? <p className="mt-2 text-sm font-semibold text-deplete" role="alert">{error}</p> : null}
        <div className="mt-4 stack-actions md:grid-cols-2">
          <button
            type="button"
            className="btn-block rounded-lg border border-gold bg-gold text-masthead hover:brightness-105 disabled:opacity-50"
            disabled={busy}
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

/** After the PDF is built — a real clickable save, not a background download that browsers may block. */
export function PdfReadyDialog({
  open,
  filename,
  url,
  note,
  onContinue,
}: {
  open: boolean;
  filename: string;
  url: string;
  note?: string;
  onContinue: () => void;
}) {
  if (!open || !url) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-navy/55 p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-ready-title"
    >
      <div className="card-xl w-full max-w-lg bg-paper p-4 shadow-[var(--shadow-card)] md:p-5">
        <h2 id="pdf-ready-title" className="font-display text-xl text-navy">
          Your PDF is ready
        </h2>
        <p className="mt-2 text-sm text-muted">
          Save it on this computer. Your browser may also have started a download — if it did
          not, use the button below.
        </p>
        <p className="mt-3 break-all rounded-lg border border-teal/40 bg-cream/40 px-3 py-2 text-sm text-navy">
          {filename}
        </p>
        {note ? <p className="mt-2 text-sm text-navy">{note}</p> : null}
        <div className="mt-4 stack-actions">
          <a
            href={url}
            download={filename}
            className="btn-block rounded-lg border border-gold bg-gold text-center text-masthead hover:brightness-105"
          >
            Save PDF to this computer
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-block rounded-lg border border-navy bg-navy text-center text-cream hover:bg-teal"
          >
            Open PDF
          </a>
          <button
            type="button"
            className="btn-block rounded-lg border border-card-border text-navy hover:bg-cream"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
