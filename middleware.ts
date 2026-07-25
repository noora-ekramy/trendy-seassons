import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_COOKIE, verifyAdminSessionValue } from "./lib/admin-auth";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminRoute = pathname.match(/^\/(ar|en)\/admin(\/.*)?$/);

  if (adminRoute) {
    const subpath = adminRoute[2] ?? "";
    const isLoginPage = subpath === "/login";
    const session = request.cookies.get(ADMIN_COOKIE)?.value;

    if (!isLoginPage && !verifyAdminSessionValue(session)) {
      const locale = adminRoute[1];
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }

    if (isLoginPage && verifyAdminSessionValue(session)) {
      const locale = adminRoute[1];
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
