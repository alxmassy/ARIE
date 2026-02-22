import Link from "next/link";
import Image from "next/image";
import arieLogo from "../arie.png";
import AuthMenu from "@/components/AuthMenu";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Navigation */}
      <nav
        style={{
          backgroundColor: "var(--color-glass-nav)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: "0 1px 8px rgba(0, 0, 0, 0.05)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--color-glass-border)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 60,
          }}
        >
          <Link
            href="/dashboard"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Image src={arieLogo} alt="ARIE Logo" height={32} />
            <span
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--color-accent)",
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              ARIE
            </span>
          </Link>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/dashboard"
                className="btn-secondary"
                style={{ padding: "7px 16px", fontSize: "0.8125rem" }}
              >
                Overview
              </Link>
              <Link
                href="/dashboard/observe"
                className="btn-primary"
                style={{ padding: "7px 16px", fontSize: "0.8125rem" }}
              >
                Record Observation
              </Link>
            </div>

            {/* Vertical Divider */}
            <div style={{ width: 1, height: 24, backgroundColor: "var(--color-border)" }} />

            {/* Auth / Profile Menu */}
            <AuthMenu />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "36px 28px",
        }}
      >
        {children}
      </main>
    </>
  );
}
