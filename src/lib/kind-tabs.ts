import type { PolicyKind } from "@/lib/calc";

export const KIND_TAB: Record<PolicyKind, { idle: string; active: string; accent: string }> = {
  traditional: {
    idle: "border border-transparent bg-[#d6eaf8] text-[#1b3a4b]",
    active: "border border-b-0 border-[#0072B2] bg-[#0072B2] text-white",
    accent: "#0072B2",
  },
  assetBased: {
    idle: "border border-transparent bg-[#fdebd0] text-[#8b3a00]",
    active: "border border-b-0 border-[#c47a00] bg-[#E69F00] text-[#1b3a4b]",
    accent: "#c47a00",
  },
  ltcAnnuity: {
    idle: "border border-transparent bg-[#d5f5e3] text-[#005a3c]",
    active: "border border-b-0 border-[#007a58] bg-[#009E73] text-white",
    accent: "#007a58",
  },
  hybridLife: {
    idle: "border border-transparent bg-[#f5d0e8] text-[#6b2d5b]",
    active: "border border-b-0 border-[#a34e82] bg-[#CC79A7] text-[#1b3a4b]",
    accent: "#a34e82",
  },
};
