"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Camera, ImageIcon, Images, Loader2 } from "lucide-react";
import { useInfinitePhotos } from "@/hooks/useInfinitePhotos";
import { PhotoGrid } from "@/components/PhotoGrid";
import { PhotoModal } from "@/components/PhotoModal";
import { SearchBar } from "@/components/SearchBar";
import { ApiKeyBanner } from "@/components/ApiKeyBanner";
import { ErrorState } from "@/components/ErrorState";
import { GalleryPhoto } from "@/types/unsplash";

const C = {
  bg950: "#020617",
  bg700: "#334155",
  text100: "#f1f5f9",
  text200: "#e2e8f0",
  text400: "#94a3b8",
  text500: "#64748b",
  indigo400: "#818cf8",
  indigo500: "#6366f1",
};

export default function GalleryPage() {
  const [query, setQuery] = useState("");
  const [activePhoto, setActive] = useState<GalleryPhoto | null>(null);

  const {
    photos,
    isLoading,
    isFetchingMore,
    error,
    apiHint,
    hasMore,
    total,
    sentinelRef,
    refetch,
  } = useInfinitePhotos({ query, perPage: 20, scrollThreshold: 200 });

  const handleSearch = useCallback((q: string) => setQuery(q), []);
  const handlePreview = useCallback((p: GalleryPhoto) => setActive(p), []);
  const handleClose = useCallback(() => setActive(null), []);
  const handleNavigate = useCallback((p: GalleryPhoto) => setActive(p), []);
  const [secretMessage, setSecretMessage] = useState<any>("");

  async function printSecretMessage(url) {
    const res = await fetch(url);
    const html = await res.text();

    // Parse HTML safely
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const rows = [...doc.querySelectorAll("tr")];

    const points = [];

    // 1. Extract structured data
    for (const row of rows) {
      const cells = row.querySelectorAll("td");

      if (cells.length < 3) continue;

      const x = Number(cells[0]?.textContent.trim());
      const char = cells[1]?.textContent.trim();
      const y = Number(cells[2]?.textContent.trim());

      if (!Number.isNaN(x) && !Number.isNaN(y) && char) {
        points.push({ x, y, char });
      }
    }

    // 2. Find boundaries (IMPORTANT for cropping)
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;

    for (const p of points) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    // 3. Build grid only for needed area
    const grid = new Map();

    for (const { x, y, char } of points) {
      if (!grid.has(y)) grid.set(y, new Map());
      grid.get(y).set(x, char);
    }

    // 4. Render CROPPED output
    let output = "";

    for (let y = minY; y <= maxY; y++) {
      let row = "";

      for (let x = minX; x <= maxX; x++) {
        row += grid.get(y)?.get(x) ?? " ";
      }

      output += row.trimEnd() + "\n";
    }

    return output.trimEnd();
  }
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const value = printSecretMessage(
      "https://docs.google.com/document/d/e/2PACX-1vSvM5gDlNvt7npYHhp_XfsJvuntUhq184By5xO_pA4b_gCWeXb6dM6ZxwN8rE6S4ghUsCj2VKR21oEP/pub",
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecretMessage(value);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: C.bg950,
        color: C.text100,
        position: "relative",
      }}
    >
      <pre id="output">{secretMessage}</pre>

      {/* Ambient glows */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-10rem",
            left: "-10rem",
            width: "600px",
            height: "600px",
            borderRadius: "9999px",
            background: "rgba(49,46,129,0.2)",
            filter: "blur(120px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-10rem",
            width: "500px",
            height: "500px",
            borderRadius: "9999px",
            background: "rgba(0,78,59,0.12)",
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* ── Header ── */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(51,65,85,0.6)",
          background: "rgba(2,6,23,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            width: "100%",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #6366f1, #4338ca)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 20px rgba(79,70,229,0.4)",
              }}
            >
              <Camera size={16} color="white" />
            </div>
            <span
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "white",
                letterSpacing: "-0.025em",
              }}
            >
              Lumina
            </span>
            <span style={{ fontSize: "0.75rem", color: C.text500 }}>
              Gallery
            </span>
          </div>

          {/* Compact query pill in header */}
          {query && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.3rem 0.875rem",
                borderRadius: "9999px",
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                fontSize: "0.75rem",
                color: C.indigo400,
              }}
            >
              Searching:{" "}
              <span style={{ color: "white", fontWeight: 600 }}>{query}</span>
            </div>
          )}

          {/* Source */}
          <a
            href={query ? "https://pixabay.com" : "https://picsum.photos"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              fontSize: "0.75rem",
              color: C.text500,
              textDecoration: "none",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.text200)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.text500)}
          >
            <ImageIcon size={14} />
            {query ? "Pixabay" : "Picsum"}
          </a>
        </div>
      </header>

      {/* ── Hero + Search ── */}
      <section
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "3rem 1.5rem 2rem",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          width: "100%",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.875rem",
            borderRadius: "9999px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: C.indigo400,
            fontSize: "0.75rem",
            fontWeight: 500,
            marginBottom: "1.25rem",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "9999px",
              background: C.indigo400,
              display: "inline-block",
              animation: "pulse 1.8s ease-in-out infinite",
            }}
          />
          {query
            ? `Showing results from Pixabay · 4M+ photos`
            : `Browsing Picsum · Infinite scroll · 200px trigger`}
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.75rem)",
            fontWeight: 900,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            marginBottom: "0.75rem",
          }}
        >
          {query ? (
            <>
              Results for{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #818cf8, #a5b4fc, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                &ldquo;{query}&rdquo;
              </span>
            </>
          ) : (
            <>
              Explore{" "}
              <span
                style={{
                  background:
                    "linear-gradient(90deg, #818cf8, #a5b4fc, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Beautiful
              </span>{" "}
              Photos
            </>
          )}
        </h1>

        <p
          style={{
            color: C.text400,
            fontSize: "1rem",
            maxWidth: "36rem",
            margin: "0 auto 2rem",
          }}
        >
          {query
            ? "Click any photo to preview in full resolution and download."
            : "Search millions of photos by keyword, or browse the curated collection below."}
        </p>

        {/* Search bar */}
        <SearchBar
          onSearch={handleSearch}
          isSearching={isLoading && !!query}
          total={total}
          query={query}
        />
      </section>

      {/* ── Gallery ── */}
      <main
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "0 1.5rem 6rem",
          position: "relative",
          zIndex: 1,
          width: "100%",
        }}
      >
        {/* API key banner */}
        {apiHint && <ApiKeyBanner hint={apiHint} />}

        {/* Stats */}
        {!isLoading && !error && !apiHint && photos.length > 0 && (
          <div
            style={{
              borderTop: "1px solid rgba(51,65,85,0.6)",
              padding: "0.75rem 0",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontSize: "0.875rem",
              color: C.text400,
              flexWrap: "wrap",
            }}
          >
            <Images size={16} style={{ flexShrink: 0 }} />
            <span>
              <span style={{ color: C.text200, fontWeight: 500 }}>
                {photos.length.toLocaleString()}
              </span>
              {total ? (
                <>
                  {" "}
                  of{" "}
                  <span style={{ color: C.text200, fontWeight: 500 }}>
                    {total.toLocaleString()}
                  </span>
                </>
              ) : null}{" "}
              photos
              {query && (
                <>
                  {" "}
                  for{" "}
                  <span style={{ color: "#a5b4fc", fontWeight: 500 }}>
                    &ldquo;{query}&rdquo;
                  </span>
                </>
              )}
            </span>
            {isFetchingMore && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  color: C.indigo400,
                  fontSize: "0.75rem",
                }}
              >
                <Loader2 size={12} className="animate-spin" />
                Fetching more…
              </span>
            )}
          </div>
        )}

        {error && !apiHint ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <PhotoGrid
            photos={photos}
            isLoading={isLoading}
            isFetchingMore={isFetchingMore}
            sentinelRef={sentinelRef}
            hasMore={hasMore}
            onPreview={handlePreview}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(51,65,85,0.5)",
          padding: "1.5rem",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: C.text500,
          }}
        >
          <span>
            Browse via{" "}
            <a
              href="https://picsum.photos"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.text400, textDecoration: "none" }}
            >
              Picsum
            </a>{" "}
            · Search via{" "}
            <a
              href="https://pixabay.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.text400, textDecoration: "none" }}
            >
              Pixabay
            </a>
          </span>
          <span>Next.js 16 · React 19 · Tailwind v4 · shadcn/ui</span>
        </div>
      </footer>

      {/* ── Modal ── */}
      <PhotoModal
        photo={activePhoto}
        photos={photos}
        onClose={handleClose}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
