"use client";

import { GalleryPhoto } from "@/types/unsplash";
import { PhotoCard } from "./PhotoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface PhotoGridProps {
  photos: GalleryPhoto[];
  isLoading: boolean;
  isFetchingMore: boolean;
  sentinelRef: React.RefCallback<HTMLDivElement>;
  hasMore: boolean;
  onPreview: (photo: GalleryPhoto) => void;
}

const SKELETON_HEIGHTS = [
  260, 320, 240, 300, 280, 340, 260, 300,
  220, 320, 280, 260, 300, 240, 320, 260,
];

function SkeletonGrid({ count = 16 }: { count?: number }) {
  return (
    <div className="masonry-grid">
      {SKELETON_HEIGHTS.slice(0, count).map((h, i) => (
        <div key={i} className="masonry-item">
          <Skeleton className="w-full rounded-2xl" style={{ height: `${h}px` }} />
        </div>
      ))}
    </div>
  );
}

export function PhotoGrid({
  photos, isLoading, isFetchingMore, sentinelRef, hasMore, onPreview,
}: PhotoGridProps) {
  if (isLoading) return <SkeletonGrid />;

  if (!photos.length) return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "8rem 1rem", textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📷</div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "0.5rem" }}>
        No photos found
      </h3>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
        Try refreshing or check your connection.
      </p>
    </div>
  );

  return (
    <div style={{ width: "100%" }}>
      <div className="masonry-grid">
        {photos.map((photo, i) => (
          <div key={`${photo.id}-${i}`} className="masonry-item">
            <PhotoCard photo={photo} priority={i < 8} onPreview={onPreview} />
          </div>
        ))}
      </div>

      {isFetchingMore && (
        <div>
          <SkeletonGrid count={8} />
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "0.5rem", padding: "1.5rem",
            color: "#818cf8", fontSize: "0.875rem",
          }}>
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading more photos…
          </div>
        </div>
      )}

      <div ref={sentinelRef} style={{ height: "1px", width: "100%" }} aria-hidden="true" />

      {!hasMore && photos.length > 0 && (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem 1rem" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.625rem",
            padding: "0.75rem 1.5rem", borderRadius: "9999px",
            background: "rgba(30,41,59,0.6)", border: "1px solid rgba(51,65,85,0.5)",
            color: "#94a3b8", fontSize: "0.875rem",
          }}>
            <span style={{
              width: "6px", height: "6px", borderRadius: "9999px",
              background: "#10b981", display: "inline-block",
            }} />
            All {photos.length.toLocaleString()} photos loaded
          </div>
        </div>
      )}
    </div>
  );
}
