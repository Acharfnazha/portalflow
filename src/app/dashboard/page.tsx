import Link from "next/link";

export default function DashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontFamily: "var(--font-inter-tight)", fontSize: 20, fontWeight: 600 }}>Dashboard</h1>
      <p style={{ marginTop: 6, color: "var(--pf-text-2)" }}>Coming soon — landing page is at <Link href="/" style={{ color: "#4f46e5" }}>/</Link></p>
    </div>
  );
}
