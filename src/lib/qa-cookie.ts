import type { AssetRois, Assets, LtcPolicy, PolicyKind, StructureFlags } from "@/lib/calc";
import type { AdvisorParty, ContactParty } from "@/lib/report";

const NAME = "aum-qa";
const MAX_AGE = 60 * 60 * 24 * 180;

export type AudienceRole = "interested" | "licensed-client" | "licensed-solo";

export type QaSave = {
  v: 1;
  audience?: AudienceRole;
  advisorCleared?: boolean;
  advisor?: AdvisorParty;
  finderIndex: number;
  finderPersonal: boolean;
  assets: Assets;
  assetRois: AssetRois;
  lifeFaceAmount?: number;
  excludableTouched: boolean;
  state: string;
  setting: string;
  cpiOverride: number | null;
  ageToday: number;
  claimAge: number;
  claimAgeTouched: boolean;
  duration: number;
  taxRate: number;
  annualIncome?: number;
  agiIncluded?: boolean;
  excludeHome: boolean;
  poolShown: boolean;
  client?: ContactParty;
  issueState: string;
  issueTouched: boolean;
  runKinds: StructureFlags;
  yearKind: PolicyKind;
  policy: LtcPolicy;
  kindBook: Record<PolicyKind, LtcPolicy>;
  section2Confirmed: boolean;
  section3Confirmed: boolean;
  partnershipOn: boolean;
  protectPct: number;
};

export function readQaCookie(): QaSave | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((part) => part.startsWith(`${NAME}=`));
  if (!row) return null;
  try {
    const data = JSON.parse(decodeURIComponent(row.slice(NAME.length + 1))) as QaSave;
    if (!data || data.v !== 1 || !data.assets || typeof data.finderIndex !== "number") return null;
    return data;
  } catch {
    return null;
  }
}

export function writeQaCookie(data: QaSave) {
  if (typeof document === "undefined") return;
  const body = encodeURIComponent(JSON.stringify(data));
  if (body.length > 3800) return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NAME}=${body}; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearQaCookie() {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
