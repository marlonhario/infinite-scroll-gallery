// ── Picsum (browse / no-key fallback) ──────────────────────────────────────
export interface PicsumPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  url: string;
  download_url: string;
}

// ── Pixabay (keyword search) ────────────────────────────────────────────────
export interface PixabayHit {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;      // ~640px wide
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;     // ~1280px wide
  fullHDURL?: string;
  imageURL?: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  id_hash: string;
  user_id: number;
  user: string;
  userImageURL: string;
}

export interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayHit[];
}

// ── Unified gallery type ────────────────────────────────────────────────────
export interface GalleryPhoto {
  id: string;
  author: string;
  width: number;
  height: number;
  srcUrl: string;       // display (~800px)
  thumbUrl: string;     // thumbnail (~400px)
  downloadUrl: string;  // full-res download
  sourceUrl: string;    // external link
  color: string;        // dominant colour placeholder
  likes: number;
  tags?: string;        // only from Pixabay
  source: "picsum" | "pixabay";
}

export interface FetchPhotosParams {
  query?: string;
  page: number;
  perPage?: number;
}
