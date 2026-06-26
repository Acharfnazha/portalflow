import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { acceptInvitation } from "@/lib/supabase/org-actions";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/auth/accept-invite?token=${token}`)}`);
  }

  const result = await acceptInvitation(token);

  if (!result?.error) {
    redirect("/dashboard?invited=1");
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--pf-surface)",
      padding: 24,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid var(--pf-line)",
        padding: "40px 36px",
        width: "100%",
        maxWidth: 420,
        textAlign: "center",
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14,
          background: "#fef2f2",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px",
        }}>
          <i className="ti ti-alert-triangle" style={{ fontSize: 26, color: "#dc2626" }} />
        </div>

        <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--pf-text)", margin: "0 0 8px", letterSpacing: "-.3px" }}>
          Invitation error
        </h1>
        <p style={{ fontSize: 14, color: "var(--pf-text-2)", margin: "0 0 24px", lineHeight: 1.55 }}>
          {result?.error ?? "This invitation link is invalid or has already been used."}
        </p>

        <a
          href="/dashboard"
          style={{
            display: "inline-block",
            padding: "9px 20px",
            borderRadius: 8,
            background: "#4f46e5",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Go to dashboard
        </a>
      </div>
    </div>
  );
}
