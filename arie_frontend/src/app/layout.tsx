import type { Metadata } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ARIE — Transition Support",
  description:
    "Empowering caregivers with readiness intelligence for vocational transition tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${jetbrainsMono.variable}`}>
        {/* Navigation */}
        <nav
          style={{
            backgroundColor: "var(--color-surface)",
            boxShadow: "0 1px 8px rgba(31, 41, 55, 0.04)",
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
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  letterSpacing: "-0.01em",
                }}
              >
                ARIE
              </span>
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                }}
              >
                Transition Support
              </span>
            </Link>
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href="/"
                className="btn-secondary"
                style={{ padding: "7px 16px", fontSize: "0.8125rem" }}
              >
                Overview
              </Link>
              <Link
                href="/observe"
                className="btn-primary"
                style={{ padding: "7px 16px", fontSize: "0.8125rem" }}
              >
                Record Observation
              </Link>
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
      </body>
    </html>
  );
}
