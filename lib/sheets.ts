import { google } from "googleapis";

const SOCIAL_SHEET_ID = process.env.SOCIAL_SHEET_ID!;
const MANYCHAT_SHEET_ID = process.env.MANYCHAT_SHEET_ID!;

function getAuth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Missing Google credentials env vars");
  return new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

function sheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

export type IgPost = {
  caption: string;
  shortCaption: string;
  date: string;
  type: "REELS" | "CAROUSEL" | string;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  views: number;
  reach: number;
  interactions: number;
  permalink: string;
};

export type CrmLead = {
  name: string;
  status: string;
  callDate: string;
  discoveryShow: boolean;
  discoveryNoShow: boolean;
  strategyShow: boolean;
  strategyNoShow: boolean;
  bookedDiscovery: boolean;
  bookedStrategy: boolean;
  agreementSigned: boolean;
  paymentCompleted: boolean;
  saleAgreed: boolean;
};

export type ManychatLead = {
  name: string;
  username: string;
  email: string;
  source: string;
  clickedLink: boolean;
};

const n = (v: any) => {
  const x = parseFloat(String(v ?? "").replace(/,/g, ""));
  return isNaN(x) ? 0 : x;
};
const b = (v: any) => String(v ?? "").toUpperCase() === "TRUE";
const s = (v: any) => String(v ?? "").trim();

function shortCaption(c: string): string {
  const firstLine = c.split("\n")[0].trim();
  if (firstLine.length <= 60) return firstLine;
  return firstLine.slice(0, 60) + "...";
}

function dayKey(creationDate: string): string {
  if (!creationDate) return "";
  return creationDate.slice(0, 10);
}

async function getTabNames(sheetId: string): Promise<string[]> {
  const meta = await sheetsClient().spreadsheets.get({ spreadsheetId: sheetId });
  return (meta.data.sheets ?? []).map((sh) => sh.properties?.title ?? "").filter(Boolean);
}

async function getRows(sheetId: string, tab: string): Promise<string[][]> {
  const res = await sheetsClient().spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `'${tab}'`,
  });
  return (res.data.values ?? []) as string[][];
}

function indexHeaders(headers: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  headers.forEach((h, i) => {
    map[s(h).toLowerCase()] = i;
  });
  return map;
}

function findHeaderRow(rows: string[][], required: string[]): number {
  const reqLower = required.map((r) => r.toLowerCase());
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const cells = rows[i].map((c) => s(c).toLowerCase());
    if (reqLower.every((r) => cells.includes(r))) return i;
  }
  return 0;
}

export async function fetchInstagramPosts(): Promise<IgPost[]> {
  const tabs = await getTabNames(SOCIAL_SHEET_ID);
  const igTab = tabs.find((t) => /instagram/i.test(t)) || "Instagram - Metrics";
  const rows = await getRows(SOCIAL_SHEET_ID, igTab);
  if (rows.length < 2) return [];
  const headerRow = findHeaderRow(rows, ["Caption", "Total Interactions"]);
  const idx = indexHeaders(rows[headerRow]);
  const col = (r: string[], name: string) => r[idx[name.toLowerCase()]] ?? "";
  return rows.slice(headerRow + 1)
    .filter((r) => s(col(r, "Caption")))
    .map((r) => {
      const caption = s(col(r, "Caption"));
      const mediaType = s(col(r, "Media Type"));
      const productType = s(col(r, "Media Product Type"));
      const type = productType === "REELS" ? "REELS" : productType === "FEED" && mediaType.startsWith("CAROUSEL") ? "CAROUSEL" : mediaType;
      return {
        caption,
        shortCaption: shortCaption(caption),
        date: dayKey(s(col(r, "Creation Date"))),
        type,
        likes: n(col(r, "Likes")),
        comments: n(col(r, "Comments")),
        saves: n(col(r, "Saved")),
        shares: n(col(r, "Shares")),
        views: n(col(r, "Views")),
        reach: n(col(r, "Reach")),
        interactions: n(col(r, "Total Interactions")),
        permalink: s(col(r, "Permalink")),
      };
    });
}

export async function fetchCrmLeads(): Promise<CrmLead[]> {
  const tabs = await getTabNames(SOCIAL_SHEET_ID);
  const crmTab = tabs.find((t) => /crm/i.test(t)) || tabs.find((t) => /notion/i.test(t));
  if (!crmTab) return [];
  const rows = await getRows(SOCIAL_SHEET_ID, crmTab);
  if (rows.length < 2) return [];
  const headerRow = findHeaderRow(rows, ["Client Name", "Pipeline Status"]);
  const idx = indexHeaders(rows[headerRow]);
  const col = (r: string[], name: string) => r[idx[name.toLowerCase()]] ?? "";
  return rows.slice(headerRow + 1)
    .filter((r) => s(col(r, "Client Name")))
    .map((r) => ({
      name: s(col(r, "Client Name")),
      status: s(col(r, "Pipeline Status")),
      callDate: s(col(r, "Call Date")).slice(0, 10),
      discoveryShow: b(col(r, "Discovery Call — Show")),
      discoveryNoShow: b(col(r, "Discovery Call — No Show")),
      strategyShow: b(col(r, "Strategy Call — Show")),
      strategyNoShow: b(col(r, "Strategy Call — No Show")),
      bookedDiscovery: b(col(r, "Booked Discovery Call")),
      bookedStrategy: b(col(r, "Booked Strategy Call")),
      agreementSigned: b(col(r, "Agreement Signed")),
      paymentCompleted: b(col(r, "Payment Completed")),
      saleAgreed: b(col(r, "Sale Agreed")),
    }));
}

export async function fetchManychatLeads(): Promise<ManychatLead[]> {
  const tabs = await getTabNames(MANYCHAT_SHEET_ID);
  const all: ManychatLead[] = [];
  for (const tab of tabs) {
    const rows = await getRows(MANYCHAT_SHEET_ID, tab);
    if (rows.length < 2) continue;
    const headerRow = findHeaderRow(rows, ["First Name", "Username"]);
    const idx = indexHeaders(rows[headerRow]);
    const col = (r: string[], name: string) => r[idx[name.toLowerCase()]] ?? "";
    for (const r of rows.slice(headerRow + 1)) {
      const name = s(col(r, "First Name"));
      const username = s(col(r, "Username"));
      if (!name && !username) continue;
      all.push({
        name: name || username,
        username,
        email: s(col(r, "Email")),
        source: tab,
        clickedLink: b(col(r, "Clicked On Link")),
      });
    }
  }
  return all;
}

export type SheetData = {
  igPosts: IgPost[];
  crmLeads: CrmLead[];
  manychatLeads: ManychatLead[];
  fetchedAt: string;
};

export async function fetchAll(): Promise<SheetData> {
  const [igPosts, crmLeads, manychatLeads] = await Promise.all([
    fetchInstagramPosts(),
    fetchCrmLeads(),
    fetchManychatLeads(),
  ]);
  return { igPosts, crmLeads, manychatLeads, fetchedAt: new Date().toISOString() };
}
