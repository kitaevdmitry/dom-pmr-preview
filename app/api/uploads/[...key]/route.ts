import { readFile, stat } from "node:fs/promises";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".avif": "image/avif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  if (key.length !== 1) return new Response("Not found", { status: 404 });
  const fileName = key[0];
  if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) return new Response("Not found", { status: 404 });
  const directory = process.env.UPLOAD_DIR || "/data/uploads";
  const target = `${directory}/${fileName}`;
  try {
    const [bytes, info] = await Promise.all([readFile(target), stat(target)]);
    return new Response(bytes, {
      headers: {
        "content-type": contentTypes[fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ""] || "application/octet-stream",
        "content-length": String(info.size),
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
