import { NextRequest, NextResponse } from "next/server";
import { PicsumPhoto, PixabayResponse, GalleryPhoto } from "@/types/unsplash";

// ── helpers ─────────────────────────────────────────────────────────────────

function idToColor(id: string): string {
  const hues = [220, 250, 160, 190, 340, 30, 270, 200];
  const num = parseInt(id, 10) || 0;
  return `hsl(${hues[num % hues.length]}, 30%, 25%)`;
}

function idToLikes(id: string): number {
  const n = parseInt(id, 10) || 1;
  return ((n * 137 + 42) % 9800) + 200;
}

// ── Picsum browse (no key required) ─────────────────────────────────────────

async function fetchPicsum(page: number, perPage: number): Promise<{
  photos: GalleryPhoto[];
  hasMore: boolean;
  total: null;
}> {
  const url = `https://picsum.photos/v2/list?page=${page}&limit=${perPage}`;
  const res = await fetch(url, {
    next: { revalidate: 300 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Picsum API error: ${res.status}`);

  const raw: PicsumPhoto[] = await res.json();

  const photos: GalleryPhoto[] = raw.map((p) => ({
    id:          p.id,
    author:      p.author,
    width:       p.width,
    height:      p.height,
    srcUrl:      `https://picsum.photos/id/${p.id}/800/600`,
    thumbUrl:    `https://picsum.photos/id/${p.id}/400/300`,
    downloadUrl: `https://picsum.photos/id/${p.id}/1920/1280`,
    sourceUrl:   `https://picsum.photos/id/${p.id}/info`,
    color:       idToColor(p.id),
    likes:       idToLikes(p.id),
    source:      "picsum" as const,
  }));

  return { photos, hasMore: raw.length === perPage, total: null };
}

// ── Pixabay search (requires free API key) ───────────────────────────────────

async function fetchPixabay(
  query: string,
  page: number,
  perPage: number,
  apiKey: string
): Promise<{ photos: GalleryPhoto[]; hasMore: boolean; total: number }> {
  const params = new URLSearchParams({
    key:          apiKey,
    q:            query,
    image_type:   "photo",
    orientation:  "all",
    safesearch:   "true",
    per_page:     String(Math.min(perPage, 200)),
    page:         String(page),
    lang:         "en",
  });

  const url = `https://pixabay.com/api/?${params}`;
  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) throw new Error(`Pixabay API error: ${res.status}`);

  const data: PixabayResponse = await res.json();

  const photos: GalleryPhoto[] = data.hits.map((h) => ({
    id:          String(h.id),
    author:      h.user,
    width:       h.imageWidth,
    height:      h.imageHeight,
    srcUrl:      h.webformatURL,
    thumbUrl:    h.previewURL,
    downloadUrl: h.largeImageURL,
    sourceUrl:   h.pageURL,
    color:       "#1e293b",
    likes:       h.likes,
    tags:        h.tags,
    source:      "pixabay" as const,
  }));

  const totalPages = Math.ceil(data.totalHits / perPage);
  return { photos, hasMore: page < totalPages, total: data.totalHits };
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const sp      = request.nextUrl.searchParams;
  const query   = (sp.get("query") || "").trim();
  const page    = Math.max(1, parseInt(sp.get("page")     || "1",  10));
  const perPage = Math.min(40, parseInt(sp.get("per_page") || "20", 10));

  const PIXABAY_KEY = process.env.PIXABAY_API_KEY || "";

  try {
    if (query) {
      // ── Search mode ──────────────────────────────────────────────────────
      if (!PIXABAY_KEY) {
        return NextResponse.json(
          {
            error: "Search requires a Pixabay API key.",
            hint:  "Add PIXABAY_API_KEY to your .env.local — get a free key at https://pixabay.com/api/docs/",
            photos: [],
            hasMore: false,
            total: 0,
          },
          { status: 200 } // 200 so the UI can show the helpful message
        );
      }
      const result = await fetchPixabay(query, page, perPage, PIXABAY_KEY);
      return NextResponse.json({ ...result, page, query });
    } else {
      // ── Browse mode (Picsum, no key needed) ──────────────────────────────
      const result = await fetchPicsum(page, perPage);
      return NextResponse.json({ ...result, page, query: "" });
    }
  } catch (err) {
    console.error("Photo fetch error:", err);
    const message = err instanceof Error ? err.message : "Failed to fetch photos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
