import { mkdir, writeFile } from "node:fs/promises";
import { getAdminUser } from "../../admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const safeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-80) || "photo.jpg";
const uploadDir = () => process.env.UPLOAD_DIR || "/data/uploads";

export async function POST(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const data = await request.formData();
    const files = data.getAll("photos").filter((entry): entry is File => entry instanceof File);
    if (!files.length) return Response.json({ error: "Выберите фотографии" }, { status: 400 });
    if (files.length > 12) return Response.json({ error: "Можно загрузить не более 12 фотографий за раз" }, { status: 400 });
    await mkdir(uploadDir(), { recursive: true });
    const urls: string[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) return Response.json({ error: "Допустимы только изображения" }, { status: 400 });
      if (file.size > 8 * 1024 * 1024) return Response.json({ error: "Размер одной фотографии — не более 8 МБ" }, { status: 400 });
      const fileName = `${crypto.randomUUID()}-${safeName(file.name)}`;
      await writeFile(`${uploadDir()}/${fileName}`, Buffer.from(await file.arrayBuffer()), { flag: "wx" });
      urls.push(`/api/uploads/${encodeURIComponent(fileName)}`);
    }
    return Response.json({ urls }, { status: 201 });
  } catch (error) {
    console.error("uploads POST", error);
    return Response.json({ error: "Не удалось загрузить фотографии" }, { status: 500 });
  }
}
