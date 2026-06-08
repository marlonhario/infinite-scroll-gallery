# Lumina Gallery — Infinite Scroll Photo Explorer

A production-grade Next.js 16 image gallery with infinite scroll powered by the Unsplash API.
Built with React 19, TypeScript, Tailwind CSS (Slate + Indigo + Emerald), and shadcn/ui primitives.

---

## Features

- **Infinite Scroll** — fetches new photos when you scroll within 200px of the bottom
- **IntersectionObserver** — native browser API with `rootMargin` for the 200px pre-trigger
- **Masonry Grid** — CSS `columns` layout, no layout shift
- **Search** — live search with quick-pick suggestion chips
- **Skeleton Loading** — pulse skeletons during initial load and page fetches
- **Color Placeholder** — each card shows the photo's dominant color while loading
- **Hover Actions** — Like, Download, View on Unsplash
- **Dedup Guard** — `Set<number>` prevents duplicate API calls
- **Error Handling** — API errors shown with a retry button
- **Dark Theme** — Slate-950 base, Indigo accents, Emerald highlights

---

## Project Structure

```
src/
├── app/
│   ├── api/photos/route.ts    # Next.js API route — proxies Unsplash
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main gallery page
├── components/
│   ├── ui/                    # shadcn/ui-style primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── skeleton.tsx
│   ├── ErrorState.tsx
│   ├── PhotoCard.tsx
│   ├── PhotoGrid.tsx
│   ├── SearchBar.tsx
│   └── StatsBar.tsx
├── hooks/
│   └── useInfinitePhotos.ts   # Core infinite scroll hook
└── types/
    └── unsplash.ts
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Get an Unsplash API key

1. Go to https://unsplash.com/developers
2. Click "New Application"
3. Accept the API guidelines and fill in app details
4. Copy the **Access Key** (not Secret Key)

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
UNSPLASH_ACCESS_KEY=your_real_access_key_here
```

> The Access Key is kept server-side only — all Unsplash requests go through `/api/photos`
> so your key is never exposed to the browser.

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

---

## How Infinite Scroll Works

```
User scrolls down
        |
        v
IntersectionObserver watches a 1px sentinel <div> at the bottom
rootMargin: "0px 0px 200px 0px"  <- fires 200px BEFORE sentinel enters viewport
        |
        v
setPage(prev => prev + 1)
        |
        v
useEffect [page] -> fetchPhotos(page)
        |
        v
GET /api/photos?page=N&per_page=20 -> Unsplash API
        |
        v
New photos appended to state -> PhotoGrid re-renders
```

Duplicate page guard: `const fetchedPages = useRef<Set<number>>(new Set())`
prevents re-fetching under React Strict Mode double-invocations.

---

## Libraries Used

| Library | Why |
|---|---|
| next 16 | App Router, Route Handlers, Image optimization |
| react 19 | Latest React with concurrent features |
| typescript | Full type safety |
| tailwindcss | Slate + Indigo + Emerald palette |
| lucide-react | Icon set |
| clsx + tailwind-merge | Conditional className merging (shadcn pattern) |
| Native IntersectionObserver | Zero-dep scroll detection with rootMargin |

---

## Design System

```
Background:  slate-950 (#020617)
Surface:     slate-800 (#1e293b)
Border:      slate-700 (#334155)
Text:        slate-100 / slate-200 / slate-400
Primary:     indigo-600 (#4f46e5)
Accent:      emerald-600 (#059669)
```

---

## Rate Limits

Unsplash free tier: 50 requests/hour in demo mode.
For production: apply for production access in your Unsplash app dashboard (5000 req/hour).

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```
