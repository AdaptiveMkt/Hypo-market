const ONES: Record<string, number> = {
  zero: 0,
  oh: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/** Parse digits or spoken amounts such as "fifty thousand" or "1.2 million". */
export function parseSpokenNumber(raw: string): number | null {
  const s = raw
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\$/g, "")
    .replace(/\b(dollars?|a day|per day|percent|%|years?|year)\b/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return null;

  const compact = s.match(/^(\d+(?:\.\d+)?)\s*(k|m|thousand|million|hundred)?$/);
  if (compact) {
    const n = Number(compact[1]);
    const u = compact[2];
    if (u === "k" || u === "thousand") return n * 1000;
    if (u === "m" || u === "million") return n * 1_000_000;
    if (u === "hundred") return n * 100;
    return n;
  }

  const digits = s.match(/\d+(?:\.\d+)?/);
  if (digits && !/[a-z]/.test(s.replace(digits[0], "").replace(/\s/g, ""))) {
    return Number(digits[0]);
  }

  let total = 0;
  let current = 0;
  let used = false;
  for (const w of s.split(" ")) {
    if (w === "and" || w === "a") continue;
    if (ONES[w] != null) {
      current += ONES[w];
      used = true;
      continue;
    }
    if (TENS[w] != null) {
      current += TENS[w];
      used = true;
      continue;
    }
    if (w === "hundred") {
      current = (current || 1) * 100;
      used = true;
      continue;
    }
    if (w === "thousand") {
      total += (current || 1) * 1000;
      current = 0;
      used = true;
      continue;
    }
    if (w === "million") {
      total += (current || 1) * 1_000_000;
      current = 0;
      used = true;
      continue;
    }
  }
  if (!used) return null;
  return total + current;
}

type FieldRule = { phrases: string[]; id: string };

const FIELD_RULES: FieldRule[] = [
  { phrases: ["mutual funds", "mutual fund"], id: "funds" },
  { phrases: ["money market", "savings", "cds", "c d"], id: "savings" },
  { phrases: ["checking", "cash"], id: "cash" },
  { phrases: ["stocks", "etfs", "e t f"], id: "stocks" },
  { phrases: ["bonds", "bond"], id: "bonds" },
  { phrases: ["primary residence", "home equity", "homestead"], id: "home" },
  { phrases: ["real estate investment", "investment real estate", "rental property", "investment property"], id: "invre" },
  { phrases: ["precious metals", "metals"], id: "metals" },
  { phrases: ["annuities", "annuity"], id: "annuity" },
  { phrases: ["life insurance", "life cash"], id: "life" },
  { phrases: ["roth ira", "roth"], id: "roth" },
  { phrases: ["four oh one k", "401k", "401 k", "ira"], id: "ira" },
  { phrases: ["other investable", "other assets"], id: "other" },
  { phrases: ["excludable", "spouse excluded"], id: "excludable" },
  { phrases: ["daily benefit", "daily"], id: "daily" },
  { phrases: ["monthly benefit", "monthly"], id: "monthly" },
  { phrases: ["annual premium", "premium"], id: "premium" },
  { phrases: ["tax rate"], id: "tax-rate" },
  { phrases: ["return on investment", "r o i", "roi"], id: "roi" },
  { phrases: ["c p i", "cpi", "care inflation"], id: "cpi" },
  { phrases: ["home"], id: "home" },
  { phrases: ["funds"], id: "funds" },
  { phrases: ["other"], id: "other" },
];

function setNativeValue(el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, value: string) {
  const proto =
    el instanceof HTMLSelectElement
      ? HTMLSelectElement.prototype
      : el instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

function clickNamed(label: string) {
  const buttons = Array.from(document.querySelectorAll("button"));
  const t = label.toLowerCase();
  const hit = buttons.find((b) => (b.textContent || "").trim().toLowerCase().includes(t));
  hit?.click();
  return Boolean(hit);
}

export type VoiceApplyResult = { ok: boolean; message: string };

export function applyVoiceTranscript(transcript: string): VoiceApplyResult {
  const text = transcript.trim().replace(/\.$/, "");
  const lower = text.toLowerCase();

  if (!lower) return { ok: false, message: "Nothing heard." };

  if (/^(stop|cancel|never mind)$/.test(lower)) {
    return { ok: true, message: "Stopped." };
  }
  if (/\b(run( the)? (hypo|hypothetical)|run it|calculate)\b/.test(lower) || lower === "run") {
    return clickNamed("run hypothetical")
      ? { ok: true, message: "Running the hypothetical." }
      : { ok: false, message: "Could not find Run hypothetical." };
  }
  if (/^reset\b/.test(lower)) {
    return clickNamed("reset")
      ? { ok: true, message: "Reset to defaults." }
      : { ok: false, message: "Could not find Reset." };
  }
  if (/\b(include|add|turn on).*(policy|insurance)\b/.test(lower) || lower === "include a policy") {
    const box = document.getElementById("ltc-on") as HTMLInputElement | null;
    if (box && !box.checked) {
      box.click();
      return { ok: true, message: "Policy included in this run." };
    }
    return { ok: false, message: "Policy checkbox not found or already on." };
  }

  const stateEl = document.getElementById("state") as HTMLSelectElement | null;
  if (stateEl) {
    const after = (lower.match(/\bstate(?: is| to)? (.+)$/)?.[1] || "").trim();
    const options = Array.from(stateEl.options);
    const exact = options.find(
      (o) => o.value.toLowerCase() === lower || (after && o.value.toLowerCase() === after),
    );
    const fuzzy =
      after.length >= 4
        ? options.find(
            (o) =>
              o.value.toLowerCase().includes(after) || after.includes(o.value.toLowerCase()),
          )
        : undefined;
    const opt = exact || fuzzy;
    if (opt && (exact || after)) {
      setNativeValue(stateEl, opt.value);
      return { ok: true, message: `State set to ${opt.value}.` };
    }
  }

  const settingEl = document.getElementById("setting") as HTMLSelectElement | null;
  if (settingEl) {
    if (/\bmemory care\b/.test(lower) || /\bdementia care\b/.test(lower)) {
      setNativeValue(settingEl, "memory");
      return { ok: true, message: "Care setting: memory care." };
    }
    if (/\bhome care\b/.test(lower) || /\b24[- ]hour\b/.test(lower) || /\bhome health\b/.test(lower)) {
      setNativeValue(settingEl, "home24");
      return { ok: true, message: "Care setting: 24-hour home care." };
    }
    if (/\bsemi[- ]private\b/.test(lower)) {
      setNativeValue(settingEl, "nhs");
      return { ok: true, message: "Care setting: nursing facility (semi-private room)." };
    }
    if (/\bnursing\b/.test(lower)) {
      setNativeValue(settingEl, "nh");
      return { ok: true, message: "Care setting: nursing facility (private)." };
    }
    if (/\bassisted living\b/.test(lower)) {
      setNativeValue(settingEl, "al");
      return { ok: true, message: "Care setting: assisted living." };
    }
  }

  const delayEl = document.getElementById("delay") as HTMLSelectElement | null;
  const delayM = lower.match(/\b(?:start|starts|begin|care)(?:s)?(?: in| to start)? (now|one|two|three|five|seven|ten|\d+)(?: years?)?/);
  if (delayEl && delayM) {
    const map: Record<string, string> = {
      now: "0",
      one: "1",
      three: "3",
      five: "5",
      seven: "7",
      ten: "10",
    };
    const y = map[delayM[1]] || delayM[1];
    if (Array.from(delayEl.options).some((o) => o.value === y)) {
      setNativeValue(delayEl, y);
      return { ok: true, message: y === "0" ? "Care starts now." : `Care projected to start in ${y} years.` };
    }
  }

  const active = document.activeElement;
  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement
  ) {
    if (active instanceof HTMLSelectElement) {
      const opt = Array.from(active.options).find((o) => o.text.toLowerCase().includes(lower) || o.value.toLowerCase() === lower);
      if (opt) {
        setNativeValue(active, opt.value);
        return { ok: true, message: `Set to ${opt.text}.` };
      }
    } else if (active instanceof HTMLInputElement && active.type === "checkbox") {
      const on = /\b(yes|on|true|include|check)\b/.test(lower);
      const off = /\b(no|off|false|uncheck)\b/.test(lower);
      if (on !== off) {
        if (active.checked !== on) active.click();
        return { ok: true, message: on ? "Checked." : "Unchecked." };
      }
    } else {
      const n = parseSpokenNumber(text);
      const next = n != null && (active.type === "number" || active.inputMode === "decimal") ? String(n) : text;
      setNativeValue(active, next);
      return { ok: true, message: `Entered ${next} in the focused field.` };
    }
  }

  for (const rule of FIELD_RULES) {
    for (const phrase of rule.phrases) {
      if (!lower.includes(phrase)) continue;
      const rest = lower.split(phrase).slice(1).join(phrase);
      const n = parseSpokenNumber(rest || text);
      const el = document.getElementById(rule.id);
      if (n == null || !(el instanceof HTMLInputElement || el instanceof HTMLSelectElement)) continue;
      setNativeValue(el, String(n));
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      return { ok: true, message: `Set ${phrase} to ${n.toLocaleString("en-US")}.` };
    }
  }

  return {
    ok: false,
    message: "Not matched. Focus a field and speak, or say “cash 50,000”, “state Florida”, “nursing facility”, or “run hypothetical.”",
  };
}

