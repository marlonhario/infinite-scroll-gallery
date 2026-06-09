"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Sparkles, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Mountains", "Ocean", "Forest", "City", "Architecture",
  "Portrait", "Animals", "Food", "Abstract", "Sunset",
  "Flowers", "Travel", "Technology", "Space", "Minimal",
];

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
  total?: number | null | undefined;
  query?: string;
}

export function SearchBar({ onSearch, isSearching, total, query: externalQuery = "" }: SearchBarProps) {
  const [value, setValue]         = useState(externalQuery);
  const [focused, setFocused]     = useState(false);
  const [submitted, setSubmitted] = useState(externalQuery);
  const inputRef                  = useRef<HTMLInputElement>(null);
  const debounceRef               = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external query changes (e.g. clear from parent)
  useEffect(() => {
    setValue(externalQuery);
    setSubmitted(externalQuery);
  }, [externalQuery]);

  const doSearch = (q: string) => {
    setSubmitted(q);
    onSearch(q);
  };

  const handleChange = (v: string) => {
    setValue(v);
    // Debounce auto-search by 500ms
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v.trim()), 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      doSearch(value.trim());
    }
    if (e.key === "Escape") {
      inputRef.current?.blur();
      setFocused(false);
    }
  };

  const handleClear = () => {
    setValue("");
    setSubmitted("");
    doSearch("");
    inputRef.current?.focus();
  };

  const handleSuggestion = (s: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setValue(s);
    doSearch(s);
    inputRef.current?.blur();
    setFocused(false);
  };

  const isActive = submitted.length > 0;

  return (
    <div style={{ width: "100%", maxWidth: "44rem", margin: "0 auto" }}>

      {/* ── Input row ── */}
      <div style={{ position: "relative", display: "flex", gap: "0.625rem" }}>

        {/* Search icon / spinner */}
        <div style={{
          position: "absolute", left: "1rem", top: "50%",
          transform: "translateY(-50%)", pointerEvents: "none", zIndex: 2,
          color: focused ? "#818cf8" : "#64748b",
          transition: "color 0.2s ease",
        }}>
          {isSearching
            ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
            : <Search size={18} />
          }
        </div>

        <input
          ref={inputRef}
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search millions of photos…"
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            height: "3rem",
            paddingLeft: "3rem",
            paddingRight: value ? "3rem" : "1rem",
            borderRadius: "0.875rem",
            border: `1.5px solid ${focused ? "#6366f1" : "rgba(51,65,85,0.8)"}`,
            background: focused ? "rgba(30,41,59,0.95)" : "rgba(15,23,42,0.8)",
            color: "#f1f5f9",
            fontSize: "0.9375rem",
            outline: "none",
            transition: "border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
            boxShadow: focused
              ? "0 0 0 3px rgba(99,102,241,0.15), 0 4px 20px rgba(0,0,0,0.3)"
              : "0 2px 8px rgba(0,0,0,0.2)",
          }}
        />

        {/* Clear button */}
        {value && (
          <button
            onClick={handleClear}
            style={{
              position: "absolute", right: "4.75rem", top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              color: "#64748b", padding: "0.25rem",
              display: "flex", alignItems: "center",
              zIndex: 2,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#94a3b8")}
            onMouseLeave={e => (e.currentTarget.style.color = "#64748b")}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}

        {/* Search button */}
        <button
          onClick={() => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            doSearch(value.trim());
          }}
          style={{
            height: "3rem",
            padding: "0 1.375rem",
            borderRadius: "0.875rem",
            border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #4f46e5, #4338ca)",
            color: "white",
            fontWeight: 600, fontSize: "0.875rem",
            display: "flex", alignItems: "center", gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(79,70,229,0.35)",
            transition: "opacity 0.2s ease, transform 0.15s ease",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1";   e.currentTarget.style.transform = "translateY(0)"; }}
          aria-label="Search"
        >
          <Search size={15} />
          Search
        </button>
      </div>

      {/* ── Results count ── */}
      {isActive && total !== null && !isSearching && (
        <p style={{
          textAlign: "center", marginTop: "0.625rem",
          fontSize: "0.8rem", color: "#64748b",
        }}>
          Found{" "}
          <span style={{ color: "#a5b4fc", fontWeight: 600 }}>
            {(total ?? 0).toLocaleString()}
          </span>{" "}
          results for{" "}
          <span style={{ color: "#e2e8f0", fontWeight: 500 }}>
            &ldquo;{submitted}&rdquo;
          </span>
        </p>
      )}

      {/* ── Suggestion chips ── */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "0.5rem",
        marginTop: "0.875rem", justifyContent: "center",
        alignItems: "center",
      }}>
        <span style={{
          display: "flex", alignItems: "center", gap: "0.25rem",
          fontSize: "0.7rem", color: "#475569", marginRight: "0.25rem",
        }}>
          <Sparkles size={11} />
          Try:
        </span>
        {SUGGESTIONS.map(s => {
          const active = submitted.toLowerCase() === s.toLowerCase();
          return (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
                border: `1px solid ${active ? "#6366f1" : "rgba(51,65,85,0.7)"}`,
                background: active ? "rgba(99,102,241,0.15)" : "transparent",
                color: active ? "#a5b4fc" : "#64748b",
                fontSize: "0.75rem", fontWeight: active ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(71,85,105,1)";
                  e.currentTarget.style.color = "#94a3b8";
                  e.currentTarget.style.background = "rgba(30,41,59,0.5)";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.borderColor = "rgba(51,65,85,0.7)";
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
