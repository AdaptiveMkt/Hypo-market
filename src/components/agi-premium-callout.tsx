import { TARGET_INCOME_RATE } from "@/lib/calc";
import { money } from "@/lib/utils";

export function agiTargetPremium(agi: number) {
  const n = Math.max(0, Math.round(Number(agi) || 0));
  return n > 0 ? Math.round(n * TARGET_INCOME_RATE) : 0;
}

export function agiTargetSentence(agi: number) {
  const amount = agiTargetPremium(agi);
  if (amount <= 0) return "";
  return `(*) Based on your AGI, the target premium recommendation is ${money(amount)}.`;
}

export function AgiPremiumCallout({ agi, className = "" }: { agi: number; className?: string }) {
  const sentence = agiTargetSentence(agi);
  if (!sentence) return null;
  return <p className={`text-sm font-semibold text-link ${className}`.trim()}>{sentence}</p>;
}
