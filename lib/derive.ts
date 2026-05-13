import type { CrmLead, IgPost, ManychatLead } from "./sheets";

export const C = {
  bg: "oklch(0.965 0.012 85)",
  surface: "oklch(0.985 0.008 85)",
  surface2: "oklch(0.93 0.014 85)",
  ink: "oklch(0.18 0.01 70)",
  inkDim: "oklch(0.50 0.012 70)",
  hairline: "oklch(0.88 0.012 85)",
  accent: "oklch(0.46 0.16 258)",
  accentSoft: "oklch(0.88 0.09 244)",
  white: "#fff",
  red: "oklch(0.55 0.18 25)",
  redSoft: "oklch(0.90 0.06 25)",
};
export const serif = "'DM Serif Display','DM Serif Text',Georgia,serif";
export const sans = "Inter,system-ui,-apple-system,sans-serif";

export const pct = (c: number, p: number) => {
  if (p === 0) return c > 0 ? "+100%" : "—";
  const v = ((c - p) / p) * 100;
  return (v >= 0 ? "+" : "") + v.toFixed(0) + "%";
};
export const fmt = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : n.toString();

export function dateWindow(posts: IgPost[], from: string, to: string) {
  return posts.filter((p) => p.date >= from && p.date <= to);
}

export function sum<T>(arr: T[], key: keyof T): number {
  return arr.reduce((s, p) => s + (Number(p[key]) || 0), 0);
}

export function comparisonWindows(posts: IgPost[], now: Date = new Date()) {
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = now.getDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  const ymd = (yy: number, mm: number, dd: number) => `${yy}-${pad(mm + 1)}-${pad(dd)}`;
  const curStart = ymd(y, m, 1);
  const curEnd = ymd(y, m, day);
  const prevMonth = m === 0 ? 11 : m - 1;
  const prevYear = m === 0 ? y - 1 : y;
  const prevStart = ymd(prevYear, prevMonth, 1);
  const prevEnd = ymd(prevYear, prevMonth, day);
  return {
    cur: dateWindow(posts, curStart, curEnd),
    prev: dateWindow(posts, prevStart, prevEnd),
    curRange: { start: curStart, end: curEnd },
    prevRange: { start: prevStart, end: prevEnd },
    dayOfMonth: day,
    daysInMonth: new Date(y, m + 1, 0).getDate(),
    monthName: now.toLocaleString("en-GB", { month: "long" }).toUpperCase(),
    year: y,
  };
}

export type WeekdayBar = { label: string; value: number };
export function lastSevenPostsBars(posts: IgPost[]): { bars: WeekdayBar[]; total: number; max: number } {
  const sorted = [...posts].sort((a, b) => (a.date > b.date ? -1 : 1));
  const last7 = sorted.slice(0, 7).reverse();
  const bars = last7.map((p) => {
    const d = new Date(p.date);
    const label = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
    return { label, value: p.interactions };
  });
  const total = bars.reduce((s, b) => s + b.value, 0);
  const max = Math.max(1, ...bars.map((b) => b.value));
  return { bars, total, max };
}

export function topAndBottomPosts(posts: IgPost[]) {
  const sorted = [...posts].sort((a, b) => b.interactions - a.interactions);
  const top = sorted.slice(0, 4);
  const bottom = sorted.slice(-4).reverse();
  return { top, bottom, totalRanked: sorted.length };
}

export type SalesMetrics = {
  totalLeads: number;
  bookedCalls: number;
  noShows: number;
  completedCalls: number;
  signedClients: number;
};

export function fmtShortDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const day = d.getDate();
  const mon = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][d.getMonth()];
  return `${day} ${mon}`;
}

export type LeadSource = {
  source: string;
  count: number;
  clicks: number;
  matchedPost?: IgPost;
};

function extractDayNum(s: string): number | null {
  const m = s.match(/day\s*(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

export function topLeadSources(manychat: ManychatLead[], posts: IgPost[], limit = 5): LeadSource[] {
  const grouped = new Map<string, { count: number; clicks: number }>();
  for (const l of manychat) {
    const key = l.source || "(unknown)";
    const cur = grouped.get(key) ?? { count: 0, clicks: 0 };
    cur.count += 1;
    if (l.clickedLink) cur.clicks += 1;
    grouped.set(key, cur);
  }
  const sources: LeadSource[] = [];
  for (const [source, { count, clicks }] of grouped.entries()) {
    const dayNum = extractDayNum(source);
    const matchedPost = dayNum != null ? posts.find((p) => extractDayNum(p.caption) === dayNum) : undefined;
    sources.push({ source, count, clicks, matchedPost });
  }
  return sources.sort((a, b) => b.count - a.count).slice(0, limit);
}

export function salesMetrics(crm: CrmLead[], manychat: ManychatLead[]): SalesMetrics {
  return {
    totalLeads: manychat.length,
    bookedCalls: crm.filter((l) => l.bookedDiscovery || l.bookedStrategy || l.discoveryShow || l.strategyShow || l.agreementSigned || /booked/i.test(l.status)).length,
    noShows: crm.filter((l) => l.discoveryNoShow || l.strategyNoShow).length,
    completedCalls: crm.filter((l) => l.discoveryShow || l.strategyShow).length,
    signedClients: crm.filter((l) => l.agreementSigned).length,
  };
}
