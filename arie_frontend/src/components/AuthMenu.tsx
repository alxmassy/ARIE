"use client";

import { useEffect, useState, useRef } from "react";

export default function AuthMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check local storage or system preference on mount
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  useEffect(() => {
    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "var(--color-text)",
          }}
        >
          Sarah Jenkins
        </span>
        <div
          onClick={() => setIsOpen(!isOpen)}
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
            transition: "transform 0.2s ease",
            transform: isOpen ? "scale(0.95)" : "scale(1)",
            userSelect: "none"
          }}
        >
          SJ
        </div>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: 200,
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            padding: "8px",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 4
          }}
        >
          <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--color-border)", marginBottom: 4 }}>
            <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-text)" }}>Sarah Jenkins</div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>sarah.j@arie-ngo.org</div>
          </div>
          
          <button
            onClick={toggleTheme}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-text)",
              textAlign: "left",
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            <span>{isDark ? "☀️" : "🌙"}</span>
          </button>
          
          <button
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "10px 12px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-danger)",
              textAlign: "left",
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
