import { NextRequest, NextResponse } from "next/server";

// Very small HTML meta extractor to avoid extra deps
function extractMeta(content: string, ...names: string[]) {
  for (const name of names) {
    const regex = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`,
      "i"
    );
    const match = content.match(regex);
    if (match?.[1]) return match[1];
  }
  return null;
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ message: "url is required" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(urlParam);
  } catch {
    return NextResponse.json({ message: "Invalid URL" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    return NextResponse.json({ message: "Only http/https is allowed" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
    const res = await fetch(target.toString(), {
      method: "GET",
      headers: { "User-Agent": "openhr-link-preview-bot" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ message: "Failed to fetch url" }, { status: 400 });
    }

    const html = await res.text();

    const title =
      extractMeta(html, "og:title", "twitter:title") ||
      (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "").trim() ||
      undefined;
    const description =
      extractMeta(html, "og:description", "twitter:description")?.trim() || undefined;
    const image =
      extractMeta(html, "og:image", "twitter:image")?.trim() || undefined;
    const siteName =
      extractMeta(html, "og:site_name")?.trim() || target.hostname;

    return NextResponse.json({ title, description, image, siteName });
  } catch (error) {
    console.error("link-preview error:", error);
    return NextResponse.json({ message: "Failed to fetch metadata" }, { status: 500 });
  }
}
