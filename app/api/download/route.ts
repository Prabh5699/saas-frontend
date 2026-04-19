import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAllowed(url: URL): boolean {
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname;
  if (host === "localhost" || host === "127.0.0.1") return false;
  if (host.startsWith("169.254.") || host.startsWith("10.")) return false;
  if (host.startsWith("192.168.")) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const target = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") ?? "image.png";
  if (!target) {
    return new Response("Missing url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  if (!isAllowed(parsed)) {
    return new Response("Forbidden host", { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(parsed.toString(), { cache: "no-store" });
  } catch {
    return new Response("Upstream fetch failed", { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: upstream.status || 502 });
  }

  const safeName = filename.replace(/[\r\n"]/g, "").slice(0, 200);
  const headers = new Headers();
  headers.set(
    "Content-Type",
    upstream.headers.get("Content-Type") ?? "application/octet-stream"
  );
  const len = upstream.headers.get("Content-Length");
  if (len) headers.set("Content-Length", len);
  headers.set(
    "Content-Disposition",
    `attachment; filename="${safeName}"`
  );
  headers.set("Cache-Control", "no-store");

  return new Response(upstream.body, { status: 200, headers });
}
