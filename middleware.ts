import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const auth = req.cookies.get("auth")?.value;
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected || auth !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
