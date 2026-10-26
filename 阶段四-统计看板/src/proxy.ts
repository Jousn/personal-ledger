import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 粗粒度路由保护：受保护路径下没有会话 Cookie 一律拦截。
// 真正的鉴权（校验 JWT、按用户过滤数据）在服务端数据层完成。
// （Next.js 16 起 middleware.ts 约定更名为 proxy.ts）
const PROTECTED_PREFIXES = ["/transactions", "/stats", "/api/transactions"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!needsAuth) return NextResponse.next();

  const hasSession = request.cookies.has("authjs.session-token");
  if (hasSession) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/transactions/:path*", "/stats/:path*", "/api/transactions/:path*"],
};
