const PORTAL_ID = "8744592";
const FORM_ID = "20f78d66-2c90-479e-b20c-b92d5939d396";
const SUBMIT_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

type Lead = {
  email: string;
  name: string;
  phone: string;
  firm: string;
  url: string;
};

function fields(lead: Lead, includeLink: boolean) {
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
  if (includeLink) add("report_link", lead.url);
  return rows;
}

function payload(lead: Lead, includeLink: boolean) {
  const hutk = document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/)?.[1] ?? "";
  return {
    fields: fields(lead, includeLink),
    context: {
      ...(hutk ? { hutk: decodeURIComponent(hutk) } : {}),
      pageUri: lead.url,
      pageName: "Report link",
    },
  };
}

async function postLead(lead: Lead, includeLink: boolean) {
  const res = await fetch(SUBMIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload(lead, includeLink)),
  });
  return res.ok;
}

/** Updates the advisor's HubSpot contact with the temporary report address. */
export async function sendReportLinkToHubspot(lead: Lead) {
  if (!lead.email.includes("@") || !lead.url) return;
  try {
    const hsq = ((window as unknown as { _hsq?: unknown[] })._hsq ??= []);
    hsq.push(["identify", { email: lead.email.trim(), report_link: lead.url }]);
    hsq.push(["trackPageView"]);
  } catch {
    /* tracking is optional */
  }
  try {
    const saved = await postLead(lead, true);
    if (saved) return;
    const again = await postLead(lead, false);
    if (!again) await postLead({ ...lead, name: "", phone: "", firm: "" }, false);
  } catch {
    /* the hypothetical still runs if HubSpot is unavailable */
  }
}
