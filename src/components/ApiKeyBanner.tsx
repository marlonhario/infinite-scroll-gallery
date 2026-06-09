"use client";

import { Key, ExternalLink, X } from "lucide-react";
import { useState } from "react";

interface ApiKeyBannerProps {
  hint: string;
}

export function ApiKeyBanner({ hint }: ApiKeyBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      margin: "0 0 1.5rem",
      padding: "1rem 1.25rem",
      borderRadius: "0.875rem",
      border: "1px solid rgba(99,102,241,0.3)",
      background: "rgba(49,46,129,0.15)",
      display: "flex", alignItems: "flex-start", gap: "0.875rem",
      position: "relative",
    }}>
      <div style={{
        width: "2rem", height: "2rem", borderRadius: "0.5rem",
        background: "rgba(99,102,241,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: "0.1rem",
      }}>
        <Key size={15} color="#818cf8" />
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ color: "#c7d2fe", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
          Search requires a free Pixabay API key
        </p>
        <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.6 }}>
          {hint} Add it to your{" "}
          <code style={{
            background: "rgba(30,41,59,0.8)", padding: "0.1rem 0.4rem",
            borderRadius: "0.3rem", fontSize: "0.75rem", color: "#e2e8f0",
          }}>
            .env.local
          </code>{" "}
          as{" "}
          <code style={{
            background: "rgba(30,41,59,0.8)", padding: "0.1rem 0.4rem",
            borderRadius: "0.3rem", fontSize: "0.75rem", color: "#a5b4fc",
          }}>
            PIXABAY_API_KEY=your_key
          </code>
        </p>
        <a
          href="https://pixabay.com/api/docs/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            marginTop: "0.5rem", fontSize: "0.75rem", color: "#818cf8",
            textDecoration: "none", fontWeight: 500,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#a5b4fc")}
          onMouseLeave={e => (e.currentTarget.style.color = "#818cf8")}
        >
          Get your free key at pixabay.com
          <ExternalLink size={11} />
        </a>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#475569", padding: "0.25rem",
          display: "flex", alignItems: "center",
          flexShrink: 0,
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
        onMouseLeave={e => (e.currentTarget.style.color = "#475569")}
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}
