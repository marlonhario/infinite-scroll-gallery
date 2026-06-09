"use client";

import { Images, Loader2 } from "lucide-react";

interface StatsBarProps {
  photoCount: number;
  isFetchingMore: boolean;
}

export function StatsBar({ photoCount, isFetchingMore }: StatsBarProps) {
  return (
    <div className="flex items-center gap-3 py-3 px-1 text-sm text-slate-400">
      <Images className="w-4 h-4 shrink-0" />
      <span>
        <span className="text-slate-200 font-medium">{photoCount.toLocaleString()}</span>
        {" "}photos loaded
      </span>
      {isFetchingMore && (
        <span className="flex items-center gap-1.5 text-indigo-400 text-xs ml-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          Fetching more…
        </span>
      )}
    </div>
  );
}
