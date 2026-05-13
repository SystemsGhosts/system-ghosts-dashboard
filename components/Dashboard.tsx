"use client";
import { useEffect, useState } from "react";
import type { IgPost, SheetData } from "@/lib/sheets";
import {
  C,
  serif,
  sans,
  pct,
  fmt,
  fmtShortDate,
  comparisonWindows,
  sum,
  lastSevenPostsBars,
  topAndBottomPosts,
  salesMetrics,
  topLeadSources,
} from "@/lib/derive";

const Pill = ({ children, inv = false, down = false }: { children: React.ReactNode; inv?: boolean; down?: boolean }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: inv ? "rgba(255,255,255,0.2)" : down ? C.redSoft : C.accentSoft, color: inv ? C.white : down ? C.red : C.accent, fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999 }}>
    {down ? "▼" : "▲"} {children}
  </span>
);

const Bar = ({ pct: p, color = C.ink, delay = 0, striped }: { pct: number; color?: string; delay?: number; striped?: boolean }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(p), 100 + delay);
    return () => clearTimeout(t);
  }, [p, delay]);
  const bg = striped ? `repeating-linear-gradient(135deg,${C.accent},${C.accent} 4px,${C.accentSoft} 4px,${C.accentSoft} 8px)` : color;
  return (
    <div style={{ flex: 1, height: 32, background: C.surface2, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: bg, borderRadius: 8, transition: "width 700ms cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
};

const KpiCard = ({ num, label, idx, pill, footnote, filled, pillDown }: { num: string | number; label: string; idx: string; pill: string; footnote: string; filled?: boolean; pillDown?: boolean }) => {
  const bg = filled ? C.accent : C.surface;
  const fg = filled ? C.white : C.ink;
  const dim = filled ? "rgba(255,255,255,0.65)" : C.inkDim;
  return (
    <div style={{ flex: 1, minWidth: 170, background: bg, border: filled ? "none" : `1px solid ${C.hairline}`, borderRadius: 22, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: dim, lineHeight: 1.3, whiteSpace: "pre-line" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: dim }}>{idx}</span>
      </div>
      <div style={{ fontFamily: serif, fontSize: 56, letterSpacing: "-0.045em", color: fg, lineHeight: 1, marginTop: 4 }}>{num}</div>
      <div style={{ marginTop: 4 }}><Pill inv={filled} down={pillDown}>{pill}</Pill></div>
      <div style={{ fontSize: 12, color: dim, marginTop: 2 }}>{footnote}</div>
    </div>
  );
};

const Panel = ({ title, sub, children, style = {} }: { title: string; sub?: string | null; children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 28, padding: "32px 36px", ...style }}>
    <div style={{ fontFamily: serif, fontSize: 28, color: C.ink }}>{title}</div>
    {sub && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkDim, marginTop: 4 }}>{sub}</div>}
    <div style={{ marginTop: 24 }}>{children}</div>
  </div>
);

const Header = ({ w1, w2, right }: { w1: string; w2: string; right: React.ReactNode }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: `2px solid ${C.ink}`, paddingBottom: 16, marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <span style={{ fontFamily: serif, fontSize: 72, letterSpacing: "-0.04em", lineHeight: 1 }}>{w1} </span>
      <span style={{ fontFamily: serif, fontSize: 72, letterSpacing: "-0.04em", lineHeight: 1, color: C.accent }}>{w2}</span>
      <div style={{ width: 20, height: 20, borderRadius: 999, background: C.accentSoft, marginLeft: 4 }} />
    </div>
    {right}
  </div>
);

const PostRow = ({ post, rank, showBorder }: { post: IgPost; rank: number; showBorder: boolean }) => {
  const cap = post.shortCaption.length > 42 ? post.shortCaption.slice(0, 42) + "..." : post.shortCaption;
  const eng = post.views > 0 ? ((post.interactions / post.views) * 100).toFixed(1) : "—";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 72px 72px 64px 64px", gap: 8, alignItems: "center", padding: "12px 0", borderBottom: showBorder ? `1px solid ${C.hairline}` : "none" }}>
      <span style={{ fontFamily: serif, fontSize: 18, color: C.inkDim }}>{String(rank).padStart(2, "0")}</span>
      <div style={{ overflow: "hidden" }}>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.accent }}>{post.type === "REELS" ? "REEL" : "CAROUSEL"}</div>
        <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cap}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: serif, fontSize: 14 }}>{fmtShortDate(post.date)}</div>
        <div style={{ fontSize: 9, color: C.inkDim }}>DATE</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: serif, fontSize: 17 }}>{fmt(post.views)}</div>
        <div style={{ fontSize: 9, color: C.inkDim }}>VIEWS</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: serif, fontSize: 17 }}>{post.interactions}</div>
        <div style={{ fontSize: 9, color: C.inkDim }}>INT.</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: serif, fontSize: 17 }}>{eng}%</div>
        <div style={{ fontSize: 9, color: C.inkDim }}>ENG.</div>
      </div>
    </div>
  );
};

export default function Dashboard({ data }: { data: SheetData }) {
  const { igPosts, crmLeads, manychatLeads, fetchedAt } = data;

  const win = comparisonWindows(igPosts);
  const curViews = sum(win.cur, "views");
  const prevViews = sum(win.prev, "views");
  const curInt = sum(win.cur, "interactions");
  const prevInt = sum(win.prev, "interactions");
  const curEng = curViews > 0 ? (curInt / curViews) * 100 : 0;
  const prevEng = prevViews > 0 ? (prevInt / prevViews) * 100 : 0;

  const isVDown = curViews < prevViews;
  const isIDown = curInt < prevInt;
  const isEDown = curEng < prevEng;

  const { top, bottom, totalRanked } = topAndBottomPosts(igPosts);
  const { bars, total: weekTotal, max: weekMax } = lastSevenPostsBars(igPosts);

  const sales = salesMetrics(crmLeads, manychatLeads);
  const leadSources = topLeadSources(manychatLeads, igPosts, 5);
  const isFirstMonth = win.prev.length === 0 && crmLeads.length <= 1 && manychatLeads.length <= 1;
  const monthProgress = (win.dayOfMonth / win.daysInMonth) * 100;
  const totalPaid = 0;
  const totalOutstanding = 0;
  const stripeInvoices: any[] = [];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: sans, color: C.ink, padding: "40px 48px", maxWidth: 1640, margin: "0 auto" }}>

      <Header w1="SOCIAL" w2="PULSE" right={
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ padding: "6px 16px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", background: C.ink, color: C.white, borderRadius: 999 }}>
            {win.monthName} 1–{win.dayOfMonth} vs PREV
          </span>
          <span style={{ fontSize: 12, color: C.inkDim }}>Instagram · all surfaces</span>
        </div>
      } />

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KpiCard num={fmt(curViews)} label={"TOTAL\nVIEWS"} idx="01" pill={`${pct(curViews, prevViews)} vs prev month`} footnote={`Prev: ${fmt(prevViews)} · ${win.cur.length} posts this month`} pillDown={isVDown} />
        <KpiCard num={curInt} label={"TOTAL\nINTERACTIONS"} idx="02" pill={`${pct(curInt, prevInt)} vs prev month`} footnote={`Prev: ${prevInt} · Likes + comments + saves + shares`} pillDown={isIDown} />
        <KpiCard num={`${curEng.toFixed(1)}%`} label={"ENGAGEMENT\nRATE"} idx="03" pill={`${pct(curEng, prevEng)} vs prev month`} footnote={`Prev: ${prevEng.toFixed(1)}% · Interactions / views`} pillDown={isEDown} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <Panel title="TOP 4 POSTS" sub="RANKED BY TOTAL INTERACTIONS">
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 72px 72px 64px 64px", gap: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.inkDim, paddingBottom: 8, borderBottom: `1px solid ${C.hairline}` }}>
            <span>#</span><span>POST</span><span style={{ textAlign: "right" }}>DATE</span><span style={{ textAlign: "right" }}>VIEWS</span><span style={{ textAlign: "right" }}>INT.</span><span style={{ textAlign: "right" }}>ENG.</span>
          </div>
          {top.map((p, i) => <PostRow key={i} post={p} rank={i + 1} showBorder={i < top.length - 1} />)}
        </Panel>
        <Panel title="BOTTOM 4 POSTS" sub="LOWEST BY TOTAL INTERACTIONS">
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 72px 72px 64px 64px", gap: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.inkDim, paddingBottom: 8, borderBottom: `1px solid ${C.hairline}` }}>
            <span>#</span><span>POST</span><span style={{ textAlign: "right" }}>DATE</span><span style={{ textAlign: "right" }}>VIEWS</span><span style={{ textAlign: "right" }}>INT.</span><span style={{ textAlign: "right" }}>ENG.</span>
          </div>
          {bottom.map((p, i) => <PostRow key={i} post={p} rank={totalRanked - bottom.length + i + 1} showBorder={i < bottom.length - 1} />)}
        </Panel>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.hairline}`, borderRadius: 28, padding: "32px 36px", marginBottom: 64 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: serif, fontSize: 28 }}>RECENT ACTIVITY</div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: C.inkDim, marginTop: 4 }}>LAST 7 POSTS BY INTERACTIONS</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: serif, fontSize: 42 }}>{weekTotal}</span>
            <span style={{ fontSize: 13, color: C.inkDim }}>interactions</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, marginTop: 20, marginBottom: 8 }}>
          {bars.map((bar, i) => {
            const h = weekMax > 0 ? (bar.value / weekMax) * 100 : 0;
            const isMax = bar.value === weekMax && bar.value > 0;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{bar.value}</div>
                <div style={{ width: "100%", height: h, minHeight: 4, background: isMax ? C.accent : C.ink, borderRadius: 6, transition: "height 700ms cubic-bezier(.4,0,.2,1)" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {bars.map((bar, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.inkDim }}>{bar.label}</div>)}
        </div>
      </div>

      <Header w1="SALES" w2="PULSE" right={
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: serif, fontSize: 22 }}>{win.monthName} {win.year}</div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: C.inkDim }}>DAY {win.dayOfMonth} OF {win.daysInMonth}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", color: C.inkDim }}>MONTH PROGRESS</span>
            <div style={{ width: 120, height: 6, background: C.surface2, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${monthProgress}%`, height: "100%", background: C.ink, borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{monthProgress.toFixed(0)}%</span>
          </div>
        </div>
      } />

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KpiCard num={sales.totalLeads} label={"NEW\nLEADS"} idx="01" pill={isFirstMonth ? "First month" : "vs prev month"} footnote={isFirstMonth ? "No prior data yet" : "All channels"} />
        <KpiCard num={sales.bookedCalls} label={"CALLS\nBOOKED"} idx="02" pill={isFirstMonth ? "First month" : "vs prev month"} footnote={isFirstMonth ? "No prior data — CRM started" : "Discovery/strategy"} />
        <KpiCard num={sales.signedClients} label={"NEW\nCLIENTS"} idx="03" pill={isFirstMonth ? "First month" : "vs prev month"} footnote={isFirstMonth ? "First sales month" : "Signed & onboarded"} />
        <KpiCard num={totalPaid > 0 ? `£${totalPaid.toLocaleString()}` : "£0"} label={"SALES"} idx="04" pill={isFirstMonth ? "First month" : "vs prev month"} footnote={"Stripe not yet connected"} filled />
        <KpiCard num={totalPaid > 0 ? `£${totalPaid.toLocaleString()}` : "£0"} label={"CASH\nCOLLECTED"} idx="05" pill={isFirstMonth ? "First month" : "vs prev month"} footnote={totalOutstanding > 0 ? `£${totalOutstanding.toLocaleString()} outstanding` : "Stripe pending"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        <Panel title="PIPELINE FUNNEL" sub={null}>
          {[
            { label: "Leads", sub: "MANYCHAT CAPTURES", val: sales.totalLeads, pct: sales.totalLeads > 0 ? 100 : 0, color: C.accentSoft },
            { label: "Discovery", sub: "INQUIRY / QUALIFIED", val: sales.bookedCalls, pct: sales.totalLeads > 0 ? (sales.bookedCalls / Math.max(sales.totalLeads, sales.bookedCalls)) * 100 : 0, color: C.ink },
            { label: "No Shows", sub: "DIDN'T ATTEND", val: sales.noShows, pct: sales.totalLeads > 0 ? (sales.noShows / Math.max(sales.totalLeads, sales.bookedCalls)) * 100 : 0, color: C.ink },
            { label: "Completed", sub: "CALL DELIVERED", val: sales.completedCalls, pct: sales.totalLeads > 0 ? (sales.completedCalls / Math.max(sales.totalLeads, sales.bookedCalls)) * 100 : 0, color: C.ink },
            { label: "Signed", sub: "NEW CLIENTS", val: sales.signedClients, pct: sales.totalLeads > 0 ? (sales.signedClients / Math.max(sales.totalLeads, sales.bookedCalls)) * 100 : 0, striped: true, color: C.accentSoft },
          ].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: i < 4 ? 20 : 0 }}>
              <div style={{ width: 120 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{f.label}</div>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: C.inkDim }}>{f.sub}</div>
              </div>
              <Bar pct={f.pct} color={f.color || C.ink} delay={i * 80} striped={f.striped} />
              <span style={{ fontFamily: serif, fontSize: 32, minWidth: 50, textAlign: "right" }}>{f.val}</span>
            </div>
          ))}

        </Panel>

        <Panel title="LEAD SOURCES" sub="WHICH POSTS DRIVE DMS">
          {leadSources.length === 0 ? (
            <div style={{ padding: "24px", background: C.surface2, borderRadius: 16, textAlign: "center" }}>
              <div style={{ fontFamily: serif, fontSize: 20, color: C.inkDim }}>No leads yet</div>
              <div style={{ fontSize: 12, color: C.inkDim, marginTop: 8 }}>ManyChat captures will appear here, grouped by post.</div>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 56px 56px", gap: 8, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: C.inkDim, paddingBottom: 8, borderBottom: `1px solid ${C.hairline}` }}>
                <span>#</span><span>SOURCE</span><span style={{ textAlign: "right" }}>LEADS</span><span style={{ textAlign: "right" }}>CLICKS</span>
              </div>
              {leadSources.map((src, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr 56px 56px", gap: 8, alignItems: "center", padding: "12px 0", borderBottom: i < leadSources.length - 1 ? `1px solid ${C.hairline}` : "none" }}>
                  <span style={{ fontFamily: serif, fontSize: 18, color: C.inkDim }}>{String(i + 1).padStart(2, "0")}</span>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: C.accent }}>
                      {src.matchedPost ? `${src.matchedPost.type === "REELS" ? "REEL" : "CAROUSEL"} · ${fmtShortDate(src.matchedPost.date)}` : "MANYCHAT"}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{src.source}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: serif, fontSize: 22 }}>{src.count}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: serif, fontSize: 22, color: src.clicks > 0 ? C.accent : C.inkDim }}>{src.clicks}</div>
                  </div>
                </div>
              ))}
            </>
          )}
        </Panel>
      </div>

      <div style={{ textAlign: "center", marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.hairline}`, fontSize: 11, color: C.inkDim, letterSpacing: "0.1em" }}>
        SYSTEM GHOSTS · SALES & SOCIAL PULSE · LAST REFRESHED {new Date(fetchedAt).toLocaleString("en-GB")}
      </div>
    </div>
  );
}
