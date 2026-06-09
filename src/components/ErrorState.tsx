"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "6rem 1rem", textAlign: "center",
    }}>
      <div style={{
        width: "4rem", height: "4rem", borderRadius: "1rem",
        background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "1rem",
      }}>
        <AlertCircle size={28} color="#fb7185" />
      </div>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
        Something went wrong
      </h3>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", maxWidth: "24rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
        {message}
      </p>
      <button
        onClick={onRetry}
        style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          padding: "0.625rem 1.25rem", borderRadius: "0.5rem",
          border: "1px solid #475569", background: "rgba(30,41,59,0.5)",
          color: "#e2e8f0", fontSize: "0.875rem", fontWeight: 500,
          cursor: "pointer", transition: "background 0.2s ease",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(51,65,85,0.6)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(30,41,59,0.5)")}
      >
        <RefreshCcw size={15} />
        Try again
      </button>
    </div>
  );
}
