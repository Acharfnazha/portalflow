import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();
  const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", process.env.NEXT_PUBLIC_SITE_URL!)
    );
  }

  return NextResponse.redirect(data.url);
}
