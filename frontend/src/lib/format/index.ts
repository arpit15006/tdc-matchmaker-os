import { formatDistanceToNow, format } from 'date-fns';

export function relativeDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '—';
  }
}

export function absoluteDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'd MMM yyyy');
  } catch {
    return '—';
  }
}

export function dateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  try {
    return format(new Date(date), "d MMM yyyy 'at' h:mm a");
  } catch {
    return '—';
  }
}

/** Format INR income (stored in rupees) into a compact "₹X.X LPA". */
export function formatIncome(income: number | null | undefined): string {
  if (income == null) return '—';
  const lakhs = income / 100000;
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Cr`;
  return `₹${lakhs.toFixed(1)} LPA`;
}

export function formatHeight(cm: number | null | undefined): string {
  if (cm == null) return '—';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}" (${cm} cm)`;
}

/** Convert an enum-ish token (FOO_BAR) to Title Case ("Foo Bar"). */
export function humanize(token: string | null | undefined): string {
  if (!token) return '—';
  return token
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function fullName(p: { firstName: string; lastName: string }): string {
  return `${p.firstName} ${p.lastName}`;
}

export function initials(p: { firstName: string; lastName: string }): string {
  return `${p.firstName.charAt(0)}${p.lastName.charAt(0)}`.toUpperCase();
}
