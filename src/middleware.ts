import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_ONLY_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Portal routes: validate token presence (full validation in route handler) ─
  if (pathname.startsWith("/portal/")) {
    const token = pathname.split("/")[2];
    if (!token || token === "expired") {
      return NextResponse.redirect(new URL("/portal/expired", request.url));
    }
    return NextResponse.next();
  }

  // ── Build a mutable response so Supabase can refresh session cookies ─────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Forward cookies onto the request clone so the new response can read them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT add any logic between createServerClient and getUser.
  // getUser() is what triggers the session refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Dashboard: require auth ───────────────────────────────────────────────────
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // ── Auth-only pages: redirect authed users to dashboard ──────────────────────
  if (user && AUTH_ONLY_ROUTES.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/auth|auth/callback).*)",
  ],
};
