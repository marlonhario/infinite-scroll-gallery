import { NextRequest, NextResponse } from "next/server";

// Server-side proxy for downloading images — bypasses CORS restrictions
// on Pixabay CDN and any other external image host.
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const filename = request.nextUrl.searchParams.get("filename") || "lumina-photo.jpg";

  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow known safe image CDNs
  const allowed = [
    "cdn.pixabay.com",
    "pixabay.com",
    "picsum.photos",
    "fastly.picsum.photos",
    "images.unsplash.com",
  ];

  let hostname: string;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  if (!allowed.some(h => hostname === h || hostname.endsWith(`.${h}`))) {
    return NextResponse.json({ error: "Domain not allowed" }, { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        // Identify ourselves politely
        "User-Agent": "Lumina-Gallery/1.0",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${res.status}` },
        { status: res.status }
      );
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        // Cache for 1 hour
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Download proxy error:", err);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
