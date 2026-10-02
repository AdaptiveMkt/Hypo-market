const PORTAL_ID = "8744592";
const FORM_ID = "20f78d66-2c90-479e-b20c-b92d5939d396";
const SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

export type AdvisorLeadNotice = {
  name: string;
  email: string;
  phone: string;
  firm: string;
  address: string;
  state: string;
  zip: string;
  reportUrl: string;
};

let remembered: AdvisorLeadNotice = {
  name: "",
  email: "",
  phone: "",
  firm: "",
  address: "",
  state: "",
  zip: "",
  reportUrl: "",
};

const CODE_KEY = "aum-report-code";
const LEAD_KEY = "aum-advisor-lead";

function newCode() {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** The address written into the hidden HubSpot Landing Page field before the form is submitted. */
export function reserveReportLink() {
  let code = "";
  try {
    code = sessionStorage.getItem(CODE_KEY) || "";
  } catch {
    code = "";
  }
  if (!/^[a-z0-9]{16}$/.test(code)) {
    code = newCode();
    try {
      sessionStorage.setItem(CODE_KEY, code);
    } catch {
      /* the link can still be created later */
    }
  }
  const url = `https://preserve-your-assets.com/incognito-${code}`;
  rememberAdvisorLead({ reportUrl: url });
  return { code, url };
}

export function reservedReportCode() {
  return reserveReportLink().code;
}

type HsForm = {
  setFieldValue?: (name: string, value: string | string[]) => void;
  getFormFieldValues?: () => Promise<{ name?: string }[]>;
};

function writeLandingPage(form: HsForm, url: string) {
  const write = (name: string) => {
    try {
      form.setFieldValue?.(name, [url]);
    } catch {
      form.setFieldValue?.(name, url);
    }
  };
  write("0-1/landing_page");
  void form.getFormFieldValues?.().then((rows) => {
    for (const row of rows ?? []) {
      const name = String(row.name ?? "");
      if (/landing[_-]?page/i.test(name)) write(name);
    }
  });
}

export function fillLandingPage(url: string, event?: Event) {
  const hs = (window as unknown as {
    HubSpotFormsV4?: {
      getForms?: () => HsForm[];
      getFormFromEvent?: (event: Event) => HsForm;
    };
  }).HubSpotFormsV4;
  const forms: HsForm[] = [];
  if (event && hs?.getFormFromEvent) {
    const form = hs.getFormFromEvent(event);
    if (form) forms.push(form);
  }
  for (const form of hs?.getForms?.() ?? []) forms.push(form);
  for (const form of forms) writeLandingPage(form, url);
}

export function rememberAdvisorLead(partial: Partial<AdvisorLeadNotice>) {
  const next = { ...remembered };
  for (const [key, value] of Object.entries(partial) as [keyof AdvisorLeadNotice, string | undefined][]) {
    if (value?.trim()) next[key] = value.trim();
  }
  remembered = next;
  try {
    sessionStorage.setItem(LEAD_KEY, JSON.stringify(next));
  } catch {
    /* private mode can block storage */
  }
  return remembered;
}

function storedLead(): AdvisorLeadNotice {
  try {
    const raw = sessionStorage.getItem(LEAD_KEY);
    if (!raw) return remembered;
    const parsed = JSON.parse(raw) as Partial<AdvisorLeadNotice>;
    return rememberAdvisorLead(parsed);
  } catch {
    return remembered;
  }
}

function fields(lead: AdvisorLeadNotice, includeLink: boolean) {
  const parts = lead.name.trim().split(/\s+/).filter(Boolean);
  const firstname = parts[0] ?? "";
  const lastname = parts.slice(1).join(" ");
  const rows: { objectTypeId: string; name: string; value: string }[] = [
    { objectTypeId: "0-1", name: "email", value: lead.email.trim() },
  ];
  const add = (name: string, value: string) => {
    if (value.trim()) rows.push({ objectTypeId: "0-1", name, value: value.trim() });
  };
  add("firstname", firstname);
  add("lastname", lastname);
  add("company", lead.firm);
  add("mobilephone", lead.phone);
  if (includeLink && lead.reportUrl) add("landing_page", lead.reportUrl);
  return rows;
}

function payload(lead: AdvisorLeadNotice, includeLink: boolean) {
  const hutk = document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/)?.[1] ?? "";
  return {
    fields: fields(lead, includeLink),
    context: {
      ...(hutk ? { hutk: decodeURIComponent(hutk) } : {}),
      pageUri: includeLink ? lead.reportUrl : "https://www.preserve-your-assets.com/",
      pageName: includeLink ? "Report link" : "Advisor contact",
    },
  };
}

async function postLead(lead: AdvisorLeadNotice, includeLink: boolean) {
  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload(lead, includeLink)),
  });
  return res.ok;
}

/** Sends the finished report address to the same HubSpot contact. */
export async function sendReportLinkToHubspot(lead: { email: string; name: string; phone: string; firm: string; url: string }) {
  rememberAdvisorLead({
    email: lead.email,
    name: lead.name,
    phone: lead.phone,
    firm: lead.firm,
    reportUrl: lead.url,
  });
  const ready = storedLead();
  if (!ready.reportUrl.startsWith("https://")) return;
  try {
    const { notifyAdvisorLead } = await import("@/lib/send-report-mail");
    void notifyAdvisorLead({ data: ready });
  } catch {
    /* site mail is optional; HubSpot is the notice that is already working */
  }
  if (!ready.email.includes("@")) return;
  try {
    const hsq = ((window as unknown as { _hsq?: unknown[] })._hsq ??= []);
    hsq.push(["identify", { email: ready.email.trim(), landing_page: ready.reportUrl }]);
    hsq.push(["trackPageView"]);
  } catch {
    /* tracking is optional */
  }
  const posted = await postLead(ready, true);
  if (!posted) await postLead(ready, false);
}
