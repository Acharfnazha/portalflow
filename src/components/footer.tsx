"use client";

import { LogoWordmark } from "./logo";

const product = ["Features", "Showcase", "Pricing", "Integrations"];
const company = ["About", "Customers", "Careers", "Blog"];
const legal = ["Privacy", "Terms", "Security", "FAQ"];

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--pf-line)",
        padding: "56px 24px 40px",
        background: "var(--pf-surface)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
          gap: 40,
        }}
      >
        {/* Brand */}
        <div>
          <LogoWordmark />
          <p
            style={{
              fontSize: 14,
              color: "var(--pf-text-2)",
              lineHeight: 1.55,
              margin: "16px 0 18px",
              maxWidth: 280,
            }}
          >
            The premium client portal platform for agencies, freelancers and firms.
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 11,
              color: "var(--pf-text-3)",
            }}
          >
            {["SOC 2", "GDPR", "256-bit SSL"].map((badge) => (
              <span
                key={badge}
                style={{
                  border: "1px solid var(--pf-line)",
                  borderRadius: 7,
                  padding: "5px 9px",
                }}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Product</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              fontSize: 14,
              color: "var(--pf-text-2)",
            }}
          >
            {product.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Company */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Company</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              fontSize: 14,
              color: "var(--pf-text-2)",
            }}
          >
            {company.map((item) => (
              <a key={item} href="#" style={{ color: "inherit", textDecoration: "none" }}>
                {item}
              </a>
            ))}
          </div>
        </div>

        {/* Legal */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Legal</div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              fontSize: 14,
              color: "var(--pf-text-2)",
            }}
          >
            {legal.map((item) => (
              <a
                key={item}
                href={item === "FAQ" ? "#faq" : "#"}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "40px auto 0",
          paddingTop: 24,
          borderTop: "1px solid var(--pf-line)",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 13,
          color: "var(--pf-text-3)",
        }}
      >
        <span>© 2026 PortalFlow, Inc. All rights reserved.</span>
        <span style={{ fontFamily: "var(--font-jetbrains-mono)" }}>
          Made for the people who serve clients.
        </span>
      </div>
    </footer>
  );
}
