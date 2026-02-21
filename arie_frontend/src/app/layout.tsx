import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ARIE",
  description:
    "AI-assisted decision intelligence for NGO employability readiness tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
        {/* Navigation */}
        <nav
          style={{
            borderBottom: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface)",
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 56,
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  letterSpacing: "-0.02em",
                }}
              >
                ARIE
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                }}
              >
                Readiness Intelligence
              </span>
            </Link>
            <div style={{ display: "flex", gap: 6 }}>
              <Link
                href="/"
                className="btn-secondary"
                style={{ padding: "6px 14px", fontSize: "0.8125rem" }}
              >
                Dashboard
              </Link>
              <Link
                href="/observe"
                className="btn-primary"
                style={{ padding: "6px 14px", fontSize: "0.8125rem" }}
              >
                + Observation
              </Link>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
