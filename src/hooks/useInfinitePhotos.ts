"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GalleryPhoto } from "@/types/unsplash";

interface Options {
  query?: string;
  perPage?: number;
  scrollThreshold?: number;
}

interface Return {
  photos: GalleryPhoto[];
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  apiHint: string | null;   // e.g. "add Pixabay key to enable search"
  hasMore: boolean;
  total: number | null;
  sentinelRef: React.RefCallback<HTMLDivElement>;
  refetch: () => void;
}

export function useInfinitePhotos({
  query = "",
  perPage = 20,
  scrollThreshold = 200,
}: Options = {}): Return {
  const [photos, setPhotos]           = useState<GalleryPhoto[]>([]);
  const [page, setPage]               = useState(1);
  const [isLoading, setIsLoading]     = useState(true);
  const [isFetchingMore, setFetching] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [apiHint, setApiHint]         = useState<string | null>(null);
  const [hasMore, setHasMore]         = useState(true);
  const [total, setTotal]             = useState<number | null>(null);

  const fetchedPages = useRef<Set<number>>(new Set());
  const currentQuery = useRef(query);
  const observerRef  = useRef<IntersectionObserver | null>(null);
  const sentinelEl   = useRef<HTMLDivElement | null>(null);

  const fetchPage = useCallback(async (pageNum: number, reset = false) => {
    if (!reset && fetchedPages.current.has(pageNum)) return;
    fetchedPages.current.add(pageNum);

    pageNum === 1 ? setIsLoading(true) : setFetching(true);
    setError(null);
    setApiHint(null);

    try {
      const params = new URLSearchParams({
        page:     String(pageNum),
        per_page: String(perPage),
      });
      if (currentQuery.current) params.set("query", currentQuery.current);

      const res = await fetch(`/api/photos?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);

      // API returned 200 but with an error + hint (e.g. missing Pixabay key)
      if (json.error) {
        setError(json.error);
        if (json.hint) setApiHint(json.hint);
        setPhotos([]);
        setHasMore(false);
        return;
      }

      const incoming: GalleryPhoto[] = json.photos ?? [];
      setPhotos(prev => (reset || pageNum === 1) ? incoming : [...prev, ...incoming]);
      setHasMore(!!json.hasMore);
      setTotal(json.total ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      fetchedPages.current.delete(pageNum);
    } finally {
      setIsLoading(false);
      setFetching(false);
    }
  }, [perPage]);

  // Reset whenever query changes
  useEffect(() => {
    if (currentQuery.current === query && fetchedPages.current.size > 0) return;
    currentQuery.current = query;
    fetchedPages.current.clear();
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setApiHint(null);
    setTotal(null);
    fetchPage(1, true);
  }, [query, fetchPage]);

  // Fetch subsequent pages
  useEffect(() => {
    if (page > 1) fetchPage(page);
  }, [page, fetchPage]);

  // Attach IntersectionObserver
  const attachObserver = useCallback(() => {
    observerRef.current?.disconnect();
    if (!sentinelEl.current || !hasMore || isFetchingMore || isLoading) return;
    observerRef.current = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setPage(p => p + 1); },
      { rootMargin: `0px 0px ${scrollThreshold}px 0px`, threshold: 0 }
    );
    observerRef.current.observe(sentinelEl.current);
  }, [hasMore, isFetchingMore, isLoading, scrollThreshold]);

  useEffect(() => { attachObserver(); }, [attachObserver]);

  const sentinelRef: React.RefCallback<HTMLDivElement> = useCallback((node) => {
    sentinelEl.current = node;
    attachObserver();
  }, [attachObserver]);

  const refetch = useCallback(() => {
    fetchedPages.current.clear();
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setApiHint(null);
    fetchPage(1, true);
  }, [fetchPage]);

  return { photos, isLoading, isFetchingMore, error, apiHint, hasMore, total, sentinelRef, refetch };
}
