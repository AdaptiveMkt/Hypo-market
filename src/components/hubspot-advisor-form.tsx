"use client";

import { useEffect, useRef } from "react";
import type { AdvisorParty } from "@/lib/report";
import { fillRegistrationMessage, rememberAdvisorLead, reserveReportLink } from "@/lib/hubspot-report-link";

const PORTAL_ID = "8744592";
const FORM_ID = "20f78d66-2c90-479e-b20c-b92d5939d396";

type HsField = { name?: string; value?: unknown };

type HsFormApi = {
  getFormFieldValues?: () => Promise<HsField[]>;
};

type HsGlobal = {
  getFormFromEvent?: (event: Event) => HsFormApi;
};

function textValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const row = value as Record<string, unknown>;
    const phone = [row.countryCode, row.dialCode, row.number, row.phone, row.nationalNumber]
      .map(textValue)
      .filter(Boolean)
      .join(" ");
    if (phone) return phone;
    if ("value" in row) return textValue(row.value);
  }
  return "";
}

function mapHubspotFields(values: HsField[]): Partial<AdvisorParty> {
  const byName = new Map<string, string>();
  for (const row of values) {
    const raw = String(row.name ?? "").toLowerCase();
    const key = (raw.split("/").pop() ?? raw).replace(/[\s_|-]+/g, "");
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
  const street = pick("address", "streetaddress", "address1");
  const city = pick("city");
  const next: Partial<AdvisorParty> = {};
  const set = (key: keyof AdvisorParty, value: string) => {
    if (value) next[key] = value;
  };
  set("name", name);
  set("email", pick("email"));
  set("phone", pick("mobilephone", "phone", "phonenumber", "mobile"));
  set("firm", pick("company", "firm", "companyname"));
  set("designation", pick("jobtitle", "designation", "title"));
  set("state", pick("state", "stateregion", "region"));
  set("zip", pick("zip", "zipcode", "postalcode", "postal"));
  set("address", [street, city].filter(Boolean).join(", "));
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
  /** Ignored. Kept so an older call site still typechecks. */
  instanceId?: string;
}) {
  const onSubmittedRef = useRef(onSubmitted);
  onSubmittedRef.current = onSubmitted;

  useEffect(() => {
    const { url } = reserveReportLink();
    const apply = () => fillRegistrationMessage(url);
    apply();
    const onReady = () => apply();
    window.addEventListener("hs-form-event:on-ready", onReady);
    const timer = window.setInterval(apply, 600);
    const stop = window.setTimeout(() => window.clearInterval(timer), 10000);
    const onSuccess = (event: Event) => {
      const detail = (event as CustomEvent<{ formId?: string }>).detail;
      if (detail?.formId && detail.formId !== FORM_ID) return;
      void readSubmission(event).then((partial) => {
        const reportUrl = reserveReportLink().url;
        rememberAdvisorLead({
          name: partial.name ?? "",
          email: partial.email ?? "",
          phone: partial.phone ?? "",
          firm: partial.firm ?? "",
          address: partial.address ?? "",
          state: partial.state ?? "",
          zip: partial.zip ?? "",
          reportUrl,
        });
        void import("@/lib/send-report-mail").then(({ notifyAdvisorLead }) =>
          notifyAdvisorLead({
            data: {
              name: partial.name ?? "",
              email: partial.email ?? "",
              phone: partial.phone ?? "",
              firm: partial.firm ?? "",
              address: partial.address ?? "",
              state: partial.state ?? "",
              zip: partial.zip ?? "",
              reportUrl,
            },
          }),
        );
        onSubmittedRef.current(partial);
      });
    };
    window.addEventListener("hs-form-event:on-submission:success", onSuccess);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(stop);
      window.removeEventListener("hs-form-event:on-ready", onReady);
      window.removeEventListener("hs-form-event:on-submission:success", onSuccess);
    };
  }, []);

  return (
    <div className="min-w-0 rounded-lg bg-white p-3 text-navy" style={{ colorScheme: "light" }}>
      <div
        className="hs-form-frame min-h-64 min-w-0"
        data-region="na1"
        data-form-id={FORM_ID}
        data-portal-id={PORTAL_ID}
      />
    </div>
  );
}
