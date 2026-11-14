/** Age helpers. Dates are ISO "YYYY-MM-DD" strings (database `date`). */

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Approximate birth date from an estimated age (years + months) at `today`. */
export function birthDateFromAge(years: number, months: number, today = new Date()): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  d.setMonth(d.getMonth() - (Math.max(0, years) * 12 + Math.max(0, months)));
  return toIsoDate(d);
}

/** Whole months between a birth date and `today` (never negative). */
export function ageInMonths(birthDate: string, today = new Date()): number {
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return 0;
  let months = (today.getFullYear() - y) * 12 + (today.getMonth() + 1 - m);
  if (today.getDate() < d) months -= 1;
  return Math.max(0, months);
}

/** "2 ans et 3 mois", "5 mois", "moins d'un mois"; prefixed with "≈" when estimated. */
export function formatAge(birthDate: string | null | undefined, estimated = false, today = new Date()): string {
  if (!birthDate) return "Âge inconnu";
  const total = ageInMonths(birthDate, today);
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mois`);
  const text = parts.length ? parts.join(" et ") : "moins d'un mois";
  return estimated ? `≈ ${text}` : text;
}
