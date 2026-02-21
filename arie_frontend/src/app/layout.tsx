import type { Metadata } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import arieLogo from "./arie.png";
import AuthMenu from "@/components/AuthMenu";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});


export const metadata: Metadata = {
  title: "ARIE",
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
              href="/"
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
                  fontFamily: "var(--font-nunito), sans-serif",
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
      </body>
    </html>
  );
}
