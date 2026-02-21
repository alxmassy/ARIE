import type { Metadata } from "next";
import { Nunito, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";
import arieLogo from "./arie.png";

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
            backgroundColor: "rgba(255, 255, 255, 0.65)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow: "0 1px 8px rgba(31, 41, 55, 0.04)",
            position: "sticky",
            top: 0,
            zIndex: 50,
            borderBottom: "1px solid rgba(229, 231, 235, 0.4)",
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

               {/* Auth Placeholders */}
               <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    className="btn-secondary"
                    style={{ padding: "7px 16px", fontSize: "0.8125rem", backgroundColor: "transparent", border: "none" }}
                  >
                    Log in
                  </button>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      backgroundColor: "var(--color-accent)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      boxShadow: "0 2px 4px rgba(91, 138, 114, 0.2)",
                    }}
                  >
                    JS
                  </div>
               </div>
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
