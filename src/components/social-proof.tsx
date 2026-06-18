"use client";

const brands = ["Northwind", "Lattice&Co", "Quanta", "Meridian", "Foundry", "Halcyon", "Atlas&Bloom"];

export function SocialProof() {
  return (
    <section style={{ padding: "38px 24px 8px" }}>
      <p
        style={{
          textAlign: "center",
          fontSize: "12.5px",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "var(--pf-text-3)",
          fontWeight: 600,
          margin: "0 0 22px",
          fontFamily: "var(--font-jetbrains-mono)",
        }}
      >
        Trusted by 12,000+ studios, agencies &amp; firms
      </p>
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          overflow: "hidden",
          maskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
        }}
      >
        <div
          className="animate-marquee"
          style={{
            display: "flex",
            gap: 64,
            width: "max-content",
            fontFamily: "var(--font-inter-tight)",
            fontWeight: 600,
            fontSize: 19,
            color: "var(--pf-text-3)",
            letterSpacing: "-.01em",
            opacity: 0.7,
          }}
        >
          {[...brands, ...brands].map((b, i) => (
            <span key={i}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
