import type { CrmLead, IgPost, ManychatLead, FollowerSnapshot, DailyFollows } from "./sheets";

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

export type StreakInfo = {
  current: number;
  best: number;
  lastDays: { label: string; active: boolean }[];
};

const ONE_DAY = 86400000;

function ymd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function isWeekday(d: Date): boolean {
  const dow = d.getDay();
  return dow >= 1 && dow <= 5;
}

function previousDay(d: Date, weekdaysOnly: boolean): Date {
  const next = new Date(d.getTime() - ONE_DAY);
  if (!weekdaysOnly) return next;
  while (!isWeekday(next)) next.setTime(next.getTime() - ONE_DAY);
  return next;
}

function startOfToday(today: Date): Date {
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

function computeStreak(activeDates: Set<string>, today: Date, weekdaysOnly: boolean, windowSize = 14): StreakInfo {
  const start = startOfToday(today);
  // find anchor day: today if it has activity, else most recent prior day
  let anchor = new Date(start);
  if (weekdaysOnly && !isWeekday(anchor)) anchor = previousDay(anchor, true);
  if (!activeDates.has(ymd(anchor))) {
    // give today/anchor a grace by walking back one to start counting
    anchor = previousDay(anchor, weekdaysOnly);
  }

  let current = 0;
  let cursor = new Date(anchor);
  while (activeDates.has(ymd(cursor))) {
    current += 1;
    cursor = previousDay(cursor, weekdaysOnly);
  }

  // best streak across all known dates
  const sorted = [...activeDates].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const dateStr of sorted) {
    const d = new Date(dateStr + "T12:00:00");
    if (weekdaysOnly && !isWeekday(d)) continue;
    if (prev) {
      const expected = previousDay(d, weekdaysOnly);
      if (ymd(expected) !== ymd(prev)) {
        run = 0;
      }
    }
    run += 1;
    if (run > best) best = run;
    prev = d;
  }
  best = Math.max(best, current);

  // last N days for the dot strip
  const lastDays: { label: string; active: boolean }[] = [];
  let walker = new Date(start);
  if (weekdaysOnly && !isWeekday(walker)) walker = previousDay(walker, true);
  for (let i = 0; i < windowSize; i++) {
    const dow = walker.getDay();
    const label = ["S", "M", "T", "W", "T", "F", "S"][dow];
    lastDays.unshift({ label, active: activeDates.has(ymd(walker)) });
    walker = previousDay(walker, weekdaysOnly);
  }

  return { current, best, lastDays };
}

export function weekdayPostingStreak(posts: IgPost[], today: Date = new Date()): StreakInfo {
  const dates = new Set(posts.map((p) => p.date).filter(Boolean));
  return computeStreak(dates, today, true);
}

export function pipelineTouchStreak(crm: CrmLead[], today: Date = new Date()): StreakInfo {
  const dates = new Set<string>();
  for (const l of crm) {
    if (l.callDate) dates.add(l.callDate);
  }
  return computeStreak(dates, today, false);
}

export type FollowerMetric = {
  source: "snapshots" | "gross" | "none";
  curValue: number;
  prevValue: number;
  curLabel: string;
  prevLabel: string;
  footnote: string;
};

function sumFollowsBetween(daily: DailyFollows[], start: string, end: string): number {
  return daily.filter((d) => d.date >= start && d.date <= end).reduce((s, d) => s + d.follows, 0);
}

function snapshotAtOrBefore(snapshots: FollowerSnapshot[], date: string): FollowerSnapshot | undefined {
  // snapshots are sorted asc by date
  let result: FollowerSnapshot | undefined;
  for (const s of snapshots) {
    if (s.date <= date) result = s;
    else break;
  }
  return result;
}
function snapshotAtOrAfter(snapshots: FollowerSnapshot[], date: string): FollowerSnapshot | undefined {
  for (const s of snapshots) {
    if (s.date >= date) return s;
  }
  return undefined;
}

export function followerMetric(
  snapshots: FollowerSnapshot[],
  daily: DailyFollows[],
  currentFollowers: number | null,
  now: Date = new Date(),
): FollowerMetric {
  const win = comparisonWindows([] as IgPost[], now);
  const totalLabel = currentFollowers ? `Total: ${currentFollowers.toLocaleString()} followers` : "Total follower count not available";

  // Net change via snapshots — need a snapshot on/before curRange.start AND on/before curRange.end
  if (snapshots.length >= 2) {
    const curStartSnap = snapshotAtOrBefore(snapshots, win.curRange.start) ?? snapshotAtOrAfter(snapshots, win.curRange.start);
    const curEndSnap = snapshotAtOrBefore(snapshots, win.curRange.end);
    if (curStartSnap && curEndSnap && curEndSnap.date !== curStartSnap.date) {
      const cur = curEndSnap.followers - curStartSnap.followers;
      const prevStartSnap = snapshotAtOrBefore(snapshots, win.prevRange.start);
      const prevEndSnap = snapshotAtOrBefore(snapshots, win.prevRange.end);
      const prev = prevStartSnap && prevEndSnap ? prevEndSnap.followers - prevStartSnap.followers : 0;
      return {
        source: "snapshots",
        curValue: cur,
        prevValue: prev,
        curLabel: `${cur >= 0 ? "+" : ""}${cur}`,
        prevLabel: prevStartSnap && prevEndSnap ? `${prev >= 0 ? "+" : ""}${prev}` : "—",
        footnote: totalLabel,
      };
    }
  }

  // Fallback: gross daily follows from Page Engagement tab
  if (daily.length > 0) {
    const cur = sumFollowsBetween(daily, win.curRange.start, win.curRange.end);
    const prev = sumFollowsBetween(daily, win.prevRange.start, win.prevRange.end);
    return {
      source: "gross",
      curValue: cur,
      prevValue: prev,
      curLabel: `+${cur}`,
      prevLabel: `+${prev}`,
      footnote: `Gross follows (no unfollows tracked). ${totalLabel}`,
    };
  }

  return {
    source: "none",
    curValue: 0,
    prevValue: 0,
    curLabel: "—",
    prevLabel: "—",
    footnote: totalLabel,
  };
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
