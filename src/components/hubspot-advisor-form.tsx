"use client";

import { useEffect, useRef } from "react";
import type { AdvisorParty } from "@/lib/report";

const PORTAL_ID = "8744592";
const FORM_ID = "20f78d66-2c90-479e-b20c-b92d5939d396";
const SCRIPT_SRC = `https://js.hsforms.net/forms/embed/${PORTAL_ID}.js`;

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
  onSubmitted,
}: {
  onSubmitted: (partial: Partial<AdvisorParty>) => void;
}) {
  const onSubmittedRef = useRef(onSubmitted);
  onSubmittedRef.current = onSubmitted;

  useEffect(() => {
    if (!document.getElementById("hs-forms-embed-8744592")) {
      const script = document.createElement("script");
      script.id = "hs-forms-embed-8744592";
      script.src = SCRIPT_SRC;
      script.defer = true;
      document.body.appendChild(script);
    }
    const onSuccess = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (detail?.formId && detail.formId !== FORM_ID) return;
      void readSubmission(event).then((partial) => onSubmittedRef.current(partial));
    };
    window.addEventListener("hs-form-event:on-submission:success", onSuccess);
    return () => window.removeEventListener("hs-form-event:on-submission:success", onSuccess);
  }, []);

  return (
    <div
      className="hs-form-frame min-h-40 min-w-0"
      data-region="na1"
      data-form-id={FORM_ID}
      data-portal-id={PORTAL_ID}
    />
  );
}
