"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Download, Expand } from "lucide-react";
import { GalleryPhoto } from "@/types/unsplash";

interface PhotoCardProps {
  photo: GalleryPhoto;
  priority?: boolean;
  onPreview: (photo: GalleryPhoto) => void;
}

export function PhotoCard({ photo, priority = false, onPreview }: PhotoCardProps) {
  const [loaded,  setLoaded]  = useState(false);
  const [hovered, setHovered] = useState(false);
  const [liked,   setLiked]   = useState(false);

  const aspectRatio = photo.height / photo.width;
  const clamped = Math.min(Math.max(aspectRatio, 0.55), 1.6);
  const paddingTop = `${(clamped * 100).toFixed(2)}%`;

  return (
    <div
      onClick={() => onPreview(photo)}
      style={{
        position: "relative", width: "100%", paddingTop,
        borderRadius: "1rem", overflow: "hidden",
        backgroundColor: "#1e293b",
        border: `1px solid ${hovered ? "rgba(71,85,105,0.8)" : "rgba(51,65,85,0.5)"}`,
        cursor: "pointer",
        boxShadow: hovered ? "0 20px 40px rgba(30,27,75,0.5)" : "0 4px 16px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color placeholder */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: photo.color,
        opacity: loaded ? 0 : 1,
        transition: "opacity 0.5s ease",
        zIndex: 1,
      }} />

      {/* Image */}
      <Image
        src={photo.srcUrl}
        alt={`Photo by ${photo.author}`}
        fill unoptimized priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        style={{
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transform: hovered ? "scale(1.05)" : "scale(1)",
          transition: "opacity 0.5s ease, transform 0.5s ease",
          zIndex: 2,
        }}
        onLoad={() => setLoaded(true)}
      />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.15) 55%, transparent 100%)",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s ease",
        zIndex: 3,
      }} />

      {/* Top-right buttons: like + expand */}
      <div style={{
        position: "absolute", top: "0.625rem", right: "0.625rem",
        display: "flex", gap: "0.375rem",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(-4px)",
        transition: "opacity 0.25s ease, transform 0.25s ease",
        zIndex: 5,
      }}>
        <IconBtn
          onClick={e => { e.stopPropagation(); setLiked(l => !l); }}
          label="Like"
          bg={liked ? "#f43f5e" : "rgba(2,6,23,0.8)"}
        >
          <Heart size={13} fill={liked ? "white" : "none"} color="white" />
        </IconBtn>
        <IconBtn
          onClick={e => { e.stopPropagation(); onPreview(photo); }}
          label="Preview"
          bg="rgba(79,70,229,0.85)"
        >
          <Expand size={13} color="white" />
        </IconBtn>
      </div>

      {/* Bottom info overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0.875rem",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        zIndex: 4,
      }}>
        <p style={{
          color: "white", fontSize: "0.8rem", fontWeight: 600,
          marginBottom: "0.5rem",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {photo.author}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Likes */}
          <span style={{
            display: "flex", alignItems: "center", gap: "0.25rem",
            color: "#a5b4fc", fontSize: "0.7rem",
          }}>
            <Heart size={10} fill="#a5b4fc" />
            {photo.likes.toLocaleString()}
          </span>

          {/* Download shortcut */}
          <button
            onClick={async e => {
              e.stopPropagation();
              try {
                const res = await fetch(photo.downloadUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `lumina-${photo.id}.jpg`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch {
                window.open(photo.downloadUrl, "_blank");
              }
            }}
            style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              padding: "0.3rem 0.625rem",
              borderRadius: "0.5rem", border: "none",
              background: "rgba(5,150,105,0.85)",
              backdropFilter: "blur(8px)",
              color: "white", fontSize: "0.7rem", fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(4,120,87,1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(5,150,105,0.85)")}
          >
            <Download size={11} />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ onClick, label, bg, children }: {
  onClick: (e: React.MouseEvent) => void;
  label: string; bg: string; children: React.ReactNode;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} aria-label={label}
      style={{
        width: "1.875rem", height: "1.875rem", borderRadius: "0.5rem",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: bg, backdropFilter: "blur(8px)",
        transform: hov ? "scale(1.1)" : "scale(1)",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
    </button>
  );
}
