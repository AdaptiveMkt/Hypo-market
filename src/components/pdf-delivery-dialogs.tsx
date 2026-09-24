"use client";

import { useEffect, useRef, useState } from "react";
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

/** After the PDF is built. No file link is on the page until the visitor clicks Save or Open. */
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
  const [viewing, setViewing] = useState(false);
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
          Nothing is downloaded until you choose Save PDF to this computer. Open PDF views it here.
        </p>
        <p className="mt-3 break-all rounded-lg border border-teal/40 bg-cream/40 px-3 py-2 text-sm text-navy">
          {filename}
        </p>
        {note ? <p className="mt-2 text-sm text-navy">{note}</p> : null}
        {viewing ? (
          <iframe
            title={filename}
            src={url}
            className="mt-3 h-[70vh] w-full rounded-lg border border-line bg-paper"
          />
        ) : null}
        <div className="mt-4 stack-actions">
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
            onClick={() => setFull(true)}
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
          <iframe title={filename} src={url} className="min-h-0 w-full flex-1 bg-paper" />
        </div>
      ) : null}
    </div>
  );
}
