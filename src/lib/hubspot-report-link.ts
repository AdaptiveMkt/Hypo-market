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

export function rememberAdvisorLead(partial: Partial<AdvisorLeadNotice>) {
  const next = { ...remembered };
  for (const [key, value] of Object.entries(partial) as [keyof AdvisorLeadNotice, string | undefined][]) {
    if (value?.trim()) next[key] = value.trim();
  }
  remembered = next;
  return remembered;
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
  if (includeLink) add("report_link", lead.reportUrl);
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

/** Updates the advisor's HubSpot contact with the temporary report address. */
export async function sendReportLinkToHubspot(lead: { email: string; name: string; phone: string; firm: string; url: string }) {
  const full = rememberAdvisorLead({
    email: lead.email,
    name: lead.name,
    phone: lead.phone,
    firm: lead.firm,
    reportUrl: lead.url,
  });
  if (!full.email.includes("@") || !full.reportUrl) return;
  try {
    const hsq = ((window as unknown as { _hsq?: unknown[] })._hsq ??= []);
    hsq.push(["identify", { email: full.email.trim(), report_link: full.reportUrl }]);
    hsq.push(["trackPageView"]);
  } catch {
    /* tracking is optional */
  }
  try {
    const { notifyAdvisorLead } = await import("@/lib/send-report-mail");
    void notifyAdvisorLead({ data: full });
  } catch {
    /* mail is optional */
  }
  try {
    const saved = await postLead(full, true);
    if (saved) return;
    const again = await postLead(full, false);
    if (!again) await postLead({ ...full, name: "", phone: "", firm: "", address: "", state: "", zip: "" }, false);
  } catch {
    /* the hypothetical still runs if HubSpot is unavailable */
  }
}
