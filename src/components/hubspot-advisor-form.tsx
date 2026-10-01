"use client";

import { useEffect, useRef, useState } from "react";
import type { AdvisorParty } from "@/lib/report";

const PORTAL_ID = "8744592";
const FORM_ID = "20f78d66-2c90-479e-b20c-b92d5939d396";

type HsField = { name?: string; value?: unknown };

type HsFormApi = {
  getFormFieldValues?: () => Promise<HsField[]>;
};

type HsGlobal = {
  getFormFromEvent?: (event: Event) => HsFormApi;
};

function textValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] ?? "").trim();
  if (value == null) return "";
  return String(value).trim();
}

function mapHubspotFields(values: HsField[]): Partial<AdvisorParty> {
  const byName = new Map<string, string>();
  for (const row of values) {
    const key = String(row.name ?? "").toLowerCase().replace(/[\s_-]+/g, "");
    const value = textValue(row.value);
    if (key && value) byName.set(key, value);
  }
  const pick = (...keys: string[]) => {
    for (const key of keys) {
      const hit = byName.get(key);
      if (hit) return hit;
    }
    return "";
  };
  const name =
    pick("name", "fullname") ||
    [pick("firstname"), pick("lastname")].filter(Boolean).join(" ");
  const next: Partial<AdvisorParty> = {};
  const set = (key: keyof AdvisorParty, value: string) => {
    if (value) next[key] = value;
  };
  set("name", name);
  set("email", pick("email"));
  set("phone", pick("phone", "mobilephone", "phonenumber"));
  set("firm", pick("company", "firm", "companyname"));
  set("designation", pick("jobtitle", "designation", "title"));
  set("state", pick("state", "stateregion"));
  set("zip", pick("zip", "zipcode", "postalcode", "postal"));
  set("address", pick("address", "address1", "street"));
  return next;
}

async function readSubmission(event: Event) {
  const hs = (window as unknown as { HubSpotFormsV4?: HsGlobal }).HubSpotFormsV4;
  try {
    const form = hs?.getFormFromEvent?.(event);
    const values = (await form?.getFormFieldValues?.()) ?? [];
    return mapHubspotFields(values);
  } catch {
    return {};
  }
}

export function HubspotAdvisorForm({
  instanceId,
  onSubmitted,
}: {
  instanceId: string;
  onSubmitted: (partial: Partial<AdvisorParty>) => void;
}) {
  const onSubmittedRef = useRef(onSubmitted);
  onSubmittedRef.current = onSubmitted;
  const frameRef = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const onSuccess = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (detail?.formId && detail.formId !== FORM_ID) return;
      void readSubmission(event).then((partial) => onSubmittedRef.current(partial));
    };
    window.addEventListener("hs-form-event:on-submission:success", onSuccess);
    const timer = window.setTimeout(() => {
      if (!frameRef.current?.querySelector("iframe") && attempt < 2) setAttempt((n) => n + 1);
    }, 1200);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("hs-form-event:on-submission:success", onSuccess);
    };
  }, [attempt, instanceId]);

  return (
    <div className="min-w-0 rounded-lg bg-white p-3 text-navy" style={{ colorScheme: "light" }}>
      <div
        key={attempt}
        ref={frameRef}
        className="hs-form-frame min-h-64 min-w-0"
        data-region="na1"
        data-form-id={FORM_ID}
        data-portal-id={PORTAL_ID}
        data-instance-id={`${instanceId}-${attempt}`}
      />
    </div>
  );
}
