/** Educational claim-age estimates. Not an underwriting or incidence table. */

/** AALTCI 2024 claims sample: mean age at time of claim = 81 (range 31–103). */
export const AALTCI_MEAN_CLAIM_AGE = 81;
/** Planning default for “age today.” */
export const DEFAULT_AGE_TODAY = 60;
/** Youngest age this hypothetical will run. */
export const MIN_AGE_TODAY = 40;

export function actuarialClaimAge(ageToday: number): number {
  const age = Math.round(Number(ageToday) || 0);
  if (age < 18) return AALTCI_MEAN_CLAIM_AGE;
  if (age >= AALTCI_MEAN_CLAIM_AGE) return age + 2;
  return AALTCI_MEAN_CLAIM_AGE;
}

export function yearsUntilClaim(ageToday: number, claimAge: number): number {
  const a = Math.round(Number(ageToday) || 0);
  const c = Math.round(Number(claimAge) || 0);
  if (a <= 0 || c <= 0) return 0;
  return Math.max(0, c - a);
}

export function ageAtClaim(ageToday: number, delayYears: number): number | null {
  const a = Math.round(Number(ageToday) || 0);
  if (a < 18) return null;
  return a + Math.max(0, Math.round(Number(delayYears) || 0));
}