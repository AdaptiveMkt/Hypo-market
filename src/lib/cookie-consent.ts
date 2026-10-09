const NAME = "aum-consent";
const MAX_AGE = 60 * 60 * 24 * 180;

export type ConsentChoice = "analytics" | "essential";

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function gtag(): Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { gtag?: Gtag }).gtag;
}

function fbq(): ((...args: unknown[]) => void) | undefined {
  if (typeof window === "undefined") return undefined;
  return window.fbq;
}

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((part) => part.startsWith(`${NAME}=`));
  if (!row) return null;
  const value = decodeURIComponent(row.slice(NAME.length + 1));
  return value === "analytics" || value === "essential" ? value : null;
}

export function writeConsent(choice: ConsentChoice) {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NAME}=${choice}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
  gtag()?.("consent", "update", {
    analytics_storage: choice === "analytics" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  if (choice === "essential") fbq()?.("consent", "revoke");
  else {
    fbq()?.("consent", "grant");
    fbq()?.("track", "PageView");
  }
}
