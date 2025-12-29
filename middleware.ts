import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/account");

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token) {
    return NextResponse.next();
  }

  const returnTo = `${pathname}${search}`;
  const url = req.nextUrl.clone();
  url.pathname = "/auth/sign-in";
  url.search = `?returnTo=${encodeURIComponent(returnTo)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*"],
};
