"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X, Download, ExternalLink, Heart, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Maximize2, RotateCw, CheckCircle,
} from "lucide-react";
import { GalleryPhoto } from "@/types/unsplash";

interface PhotoModalProps {
  photo: GalleryPhoto | null;
  photos: GalleryPhoto[];
  onClose: () => void;
  onNavigate: (photo: GalleryPhoto) => void;
}

// Build the best available preview URL for each source
function getPreviewUrl(photo: GalleryPhoto): string {
  if (photo.source === "picsum") {
    return `https://picsum.photos/id/${photo.id}/1200/900`;
  }
  // Pixabay — use largeImageURL if available, else webformatURL (srcUrl)
  return photo.downloadUrl || photo.srcUrl;
}

export function PhotoModal({ photo, photos, onClose, onNavigate }: PhotoModalProps) {
  const [loaded,      setLoaded]      = useState(false);
  const [imgError,    setImgError]    = useState(false);
  const [liked,       setLiked]       = useState(false);
  const [zoom,        setZoom]        = useState(1);
  const [offset,      setOffset]      = useState({ x: 0, y: 0 });
  const [dragging,    setDragging]    = useState(false);
  const [dragStart,   setDragStart]   = useState<{ x: number; y: number } | null>(null);
  const [dlState,     setDlState]     = useState<"idle" | "loading" | "done" | "error">("idle");

  const currentIndex = photo ? photos.findIndex(p => p.id === photo.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  // Reset per photo
  useEffect(() => {
    setLoaded(false);
    setImgError(false);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDlState("idle");
  }, [photo?.id]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = photo ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [photo]);

  // Keyboard controls
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!photo) return;
    switch (e.key) {
      case "Escape":      onClose(); break;
      case "ArrowRight":  if (hasNext) onNavigate(photos[currentIndex + 1]); break;
      case "ArrowLeft":   if (hasPrev) onNavigate(photos[currentIndex - 1]); break;
      case "+": case "=": setZoom(z => Math.min(z + 0.25, 4)); break;
      case "-":           setZoom(z => Math.max(z - 0.25, 0.5)); break;
      case "0":           setZoom(1); setOffset({ x: 0, y: 0 }); break;
    }
  }, [photo, hasNext, hasPrev, currentIndex, photos, onClose, onNavigate]);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // Drag-to-pan
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    setDragging(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart) return;
    setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const onMouseUp = () => { setDragging(false); setDragStart(null); };

  // Download via server proxy (avoids CORS on Pixabay CDN)
  const handleDownload = async () => {
    if (!photo || dlState === "loading") return;
    setDlState("loading");

    const filename = `lumina-${photo.source}-${photo.id}.jpg`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(photo.downloadUrl)}&filename=${encodeURIComponent(filename)}`;

    try {
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      setDlState("done");
      setTimeout(() => setDlState("idle"), 2500);
    } catch {
      // Fallback: open in new tab
      window.open(photo.downloadUrl, "_blank");
      setDlState("error");
      setTimeout(() => setDlState("idle"), 2000);
    }
  };

  if (!photo) return null;

  const previewUrl = getPreviewUrl(photo);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(2,6,23,0.97)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          animation: "fadeInBg 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 1001,
          display: "flex", flexDirection: "column",
          animation: "slideUpModal 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        {/* ── Top toolbar ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.875rem 1.25rem", flexShrink: 0, zIndex: 10,
          background: "linear-gradient(to bottom, rgba(2,6,23,0.95) 0%, transparent 100%)",
        }}>
          {/* Author + counter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{
              width: "2.25rem", height: "2.25rem", borderRadius: "9999px",
              background: "linear-gradient(135deg, #4f46e5, #4338ca)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.9rem", fontWeight: 700, color: "white", flexShrink: 0,
              textTransform: "uppercase",
            }}>
              {photo.author[0]}
            </div>
            <div>
              <p style={{ color: "white", fontWeight: 600, fontSize: "0.9rem", lineHeight: 1.2 }}>
                {photo.author}
              </p>
              <p style={{ color: "#475569", fontSize: "0.7rem", marginTop: "0.1rem" }}>
                {photo.source === "pixabay" ? "via Pixabay" : "via Picsum"} ·{" "}
                {currentIndex + 1} / {photos.length}
              </p>
            </div>
          </div>

          {/* Tags (Pixabay only) */}
          {photo.tags && (
            <div style={{
              display: "flex", gap: "0.375rem", flexWrap: "wrap",
              maxWidth: "40%", justifyContent: "center",
            }}>
              {photo.tags.split(",").slice(0, 3).map(tag => (
                <span key={tag} style={{
                  padding: "0.2rem 0.6rem", borderRadius: "9999px",
                  background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)",
                  color: "#a5b4fc", fontSize: "0.7rem",
                }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Toolbar actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
            {/* Zoom out */}
            <ToolBtn onClick={() => { setZoom(z => Math.max(z - 0.25, 0.5)); setOffset({ x: 0, y: 0 }); }} label="Zoom out (-)">
              <ZoomOut size={15} />
            </ToolBtn>
            {/* Zoom level */}
            <span style={{
              color: "#64748b", fontSize: "0.7rem", fontWeight: 600,
              minWidth: "2.75rem", textAlign: "center",
              background: "rgba(15,23,42,0.8)", padding: "0.25rem 0.4rem",
              borderRadius: "0.375rem", border: "1px solid rgba(51,65,85,0.5)",
            }}>
              {Math.round(zoom * 100)}%
            </span>
            {/* Zoom in */}
            <ToolBtn onClick={() => setZoom(z => Math.min(z + 0.25, 4))} label="Zoom in (+)">
              <ZoomIn size={15} />
            </ToolBtn>
            {/* Reset */}
            <ToolBtn onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} label="Reset (0)">
              <Maximize2 size={15} />
            </ToolBtn>

            <div style={{ width: "1px", height: "1.25rem", background: "#1e293b", margin: "0 0.25rem" }} />

            {/* Like */}
            <ToolBtn onClick={() => setLiked(l => !l)} label="Like" active={liked}>
              <Heart size={15} fill={liked ? "#f43f5e" : "none"} color={liked ? "#f43f5e" : "#64748b"} />
            </ToolBtn>
            {/* View source */}
            <ToolBtn onClick={() => window.open(photo.sourceUrl, "_blank")} label="View source">
              <ExternalLink size={15} />
            </ToolBtn>
            {/* Close */}
            <ToolBtn onClick={onClose} label="Close (Esc)" danger>
              <X size={17} />
            </ToolBtn>
          </div>
        </div>

        {/* ── Image area ── */}
        <div
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden",
            cursor: zoom > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in",
            userSelect: "none",
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClick={() => { if (!dragging && zoom === 1) setZoom(2); }}
        >
          {/* Loading spinner */}
          {!loaded && !imgError && (
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: "1rem",
            }}>
              {/* Colour placeholder */}
              <div style={{
                width: "min(80vw, 640px)", height: "min(60vh, 480px)",
                borderRadius: "1rem", backgroundColor: photo.color,
                animation: "pulse 1.8s ease-in-out infinite",
              }} />
              <div style={{
                position: "absolute",
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
              }}>
                <div style={{
                  width: "2.5rem", height: "2.5rem", borderRadius: "9999px",
                  border: "3px solid rgba(99,102,241,0.3)",
                  borderTopColor: "#6366f1",
                  animation: "spin 0.8s linear infinite",
                }} />
                <span style={{ color: "#475569", fontSize: "0.8rem" }}>Loading photo…</span>
              </div>
            </div>
          )}

          {/* Error state */}
          {imgError && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: "0.75rem", color: "#64748b", textAlign: "center",
            }}>
              <div style={{ fontSize: "3rem" }}>🖼️</div>
              <p style={{ fontSize: "0.875rem" }}>Image could not be loaded</p>
              <button
                onClick={e => { e.stopPropagation(); setImgError(false); setLoaded(false); }}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "0.5rem",
                  border: "1px solid #334155", background: "rgba(30,41,59,0.6)",
                  color: "#94a3b8", cursor: "pointer", fontSize: "0.8rem",
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── The actual image ── */}
          {!imgError && (
            <div style={{
              transform: `scale(${zoom}) translate(${offset.x / zoom}px, ${offset.y / zoom}px)`,
              transition: dragging ? "none" : "transform 0.2s ease",
              opacity: loaded ? 1 : 0,
              // Keep opacity transition separate from transform
              willChange: "transform, opacity",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={previewUrl}           // force remount on photo change
                src={previewUrl}
                alt={`Photo by ${photo.author}`}
                style={{
                  display: "block",
                  maxWidth: "90vw",
                  maxHeight: "calc(100vh - 11rem)",
                  objectFit: "contain",
                  borderRadius: "0.75rem",
                  boxShadow: "0 32px 80px rgba(0,0,0,0.85)",
                  transition: "opacity 0.35s ease",
                }}
                onLoad={() => setLoaded(true)}
                onError={() => { setImgError(true); setLoaded(false); }}
                draggable={false}
              />
            </div>
          )}

          {/* Prev button */}
          {hasPrev && (
            <NavBtn direction="left" onClick={e => {
              e.stopPropagation();
              onNavigate(photos[currentIndex - 1]);
            }} />
          )}
          {/* Next button */}
          {hasNext && (
            <NavBtn direction="right" onClick={e => {
              e.stopPropagation();
              onNavigate(photos[currentIndex + 1]);
            }} />
          )}
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          flexShrink: 0,
          background: "linear-gradient(to top, rgba(2,6,23,0.97) 0%, transparent 100%)",
          padding: "1rem 1.5rem 1.25rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "0.875rem", zIndex: 10,
        }}>
          {/* Meta chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexWrap: "wrap" }}>
            <MetaChip icon="📐" label={`${photo.width.toLocaleString()} × ${photo.height.toLocaleString()}`} />
            <MetaChip icon="❤️" label={`${photo.likes.toLocaleString()}`} />
            <MetaChip
              icon={photo.source === "pixabay" ? "🅿️" : "🎨"}
              label={photo.source === "pixabay" ? "Pixabay" : "Picsum"}
            />
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={dlState === "loading"}
            style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.625rem 1.5rem",
              borderRadius: "0.75rem", border: "none",
              cursor: dlState === "loading" ? "wait" : "pointer",
              background: dlState === "done"
                ? "linear-gradient(135deg, #059669, #047857)"
                : dlState === "error"
                  ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                  : "linear-gradient(135deg, #4f46e5, #4338ca)",
              color: "white", fontWeight: 700, fontSize: "0.875rem",
              boxShadow: dlState === "done"
                ? "0 0 24px rgba(5,150,105,0.5)"
                : "0 0 24px rgba(79,70,229,0.4)",
              transition: "all 0.3s ease",
              opacity: dlState === "loading" ? 0.75 : 1,
              transform: dlState === "loading" ? "scale(0.97)" : "scale(1)",
              whiteSpace: "nowrap",
              minWidth: "10rem", justifyContent: "center",
            }}
          >
            {dlState === "loading" ? (
              <>
                <RotateCw size={15} style={{ animation: "spin 0.8s linear infinite" }} />
                Downloading…
              </>
            ) : dlState === "done" ? (
              <>
                <CheckCircle size={15} />
                Downloaded!
              </>
            ) : dlState === "error" ? (
              <>
                <ExternalLink size={15} />
                Opened in tab
              </>
            ) : (
              <>
                <Download size={15} />
                Download Photo
              </>
            )}
          </button>
        </div>

        {/* Keyboard hints */}
        <div style={{
          position: "absolute", bottom: "0.375rem", left: "50%",
          transform: "translateX(-50%)",
          display: "flex", gap: "1.25rem",
          fontSize: "0.6rem", color: "#1e293b",
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          {["← →  Navigate", "Esc  Close", "+/−  Zoom", "Click  Zoom in", "0  Reset"].map(h => (
            <span key={h}>{h}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInBg {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function ToolBtn({
  onClick, label, children, active, danger,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} aria-label={label} title={label}
      style={{
        width: "2.125rem", height: "2.125rem",
        borderRadius: "0.5rem", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hov
          ? danger  ? "rgba(220,38,38,0.2)"
          : active  ? "rgba(244,63,94,0.15)"
          : "rgba(51,65,85,0.8)"
          : "rgba(15,23,42,0.6)",
        color: active ? "#f43f5e" : hov && danger ? "#f87171" : "#64748b",
        transition: "all 0.15s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}

function NavBtn({ direction, onClick }: {
  direction: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      aria-label={direction === "left" ? "Previous" : "Next"}
      style={{
        position: "absolute",
        [direction]: "1rem",
        top: "50%",
        width: "3rem", height: "3rem",
        borderRadius: "9999px", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hov ? "rgba(79,70,229,0.9)" : "rgba(2,6,23,0.7)",
        backdropFilter: "blur(12px)",
        color: "white",
        boxShadow: hov ? "0 0 28px rgba(79,70,229,0.6)" : "0 4px 16px rgba(0,0,0,0.5)",
        transition: "all 0.2s ease",
        transform: hov ? "translateY(-50%) scale(1.1)" : "translateY(-50%) scale(1)",
        zIndex: 5,
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {direction === "left" ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
    </button>
  );
}

function MetaChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.375rem",
      padding: "0.3rem 0.75rem", borderRadius: "9999px",
      background: "rgba(15,23,42,0.8)", border: "1px solid rgba(51,65,85,0.5)",
      color: "#64748b", fontSize: "0.75rem",
      backdropFilter: "blur(8px)",
    }}>
      <span style={{ fontSize: "0.8rem" }}>{icon}</span>
      <span>{label}</span>
    </span>
  );
}
