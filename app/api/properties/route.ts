import { getAdminUser } from "../../admin-auth";
import { getDb, propertyFromRow } from "../../../db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const jsonList = (value: unknown) => JSON.stringify(
  Array.isArray(value)
    ? value.map(String).filter(Boolean)
    : String(value ?? "").split("\n").map(item => item.trim()).filter(Boolean),
);

const fields = `title=$1, location=$2, district=$3, address=$4, deal=$5,
  type=$6, price=$7, area=$8, rooms=$9, floor=$10, image=$11, gallery=$12,
  description=$13, features=$14, badge=$15, publication_status=$16,
  condition=$17, house_material=$18, heating=$19, balcony=$20, bathroom=$21,
  furniture=$22, documents=$23, lot_area=$24, negotiable=$25, x=$26, y=$27`;
const columns = `title, location, district, address, deal, type, price, area,
  rooms, floor, image, gallery, description, features, badge, publication_status,
  condition, house_material, heating, balcony, bathroom, furniture, documents,
  lot_area, negotiable, x, y`;

function values(p: Record<string, unknown>) {
  const gallery = jsonList(p.gallery);
  const galleryItems = JSON.parse(gallery) as string[];
  return [
    String(p.title ?? "").trim(), String(p.location ?? "Тирасполь"),
    String(p.district ?? "Центр"), String(p.address ?? ""),
    String(p.deal ?? "Продажа"), String(p.type ?? "Квартира"),
    Number(p.price), Number(p.area), Number(p.rooms ?? 0), String(p.floor ?? "—"),
    galleryItems[0] ?? String(p.image ?? ""), gallery,
    String(p.description ?? "").slice(0, 5000), jsonList(p.features),
    String(p.badge ?? "Новинка"), String(p.publicationStatus ?? "Опубликован"),
    String(p.condition ?? "Уточняется"), String(p.houseMaterial ?? "Уточняется"),
    String(p.heating ?? "Уточняется"), String(p.balcony ?? "Уточняется"),
    String(p.bathroom ?? "Уточняется"), String(p.furniture ?? "Уточняется"),
    String(p.documents ?? "Уточняется"), Number(p.lotArea ?? 0),
    p.negotiable === true || p.negotiable === "true", Number(p.x), Number(p.y),
  ];
}

function validProperty(data: unknown[]) {
  return Boolean(data[0]) && Number.isFinite(data[6]) && Number.isFinite(data[7])
    && Number.isFinite(data[25]) && Number.isFinite(data[26]);
}

export async function GET(request: Request) {
  try {
    const includeAll = new URL(request.url).searchParams.get("all") === "1";
    if (includeAll && !(await getAdminUser())) return Response.json({ error: "Нет доступа" }, { status: 403 });
    const db = await getDb();
    const result = await db.query(includeAll
      ? "SELECT * FROM properties ORDER BY id DESC LIMIT 200"
      : "SELECT * FROM properties WHERE active=TRUE AND publication_status IN ('Опубликован','Задаток') ORDER BY id DESC LIMIT 200");
    return Response.json({ properties: result.rows.map(propertyFromRow) });
  } catch (error) {
    console.error("properties GET", error);
    return Response.json({ error: "Каталог временно недоступен", properties: [] }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const data = values(await request.json() as Record<string, unknown>);
    if (!validProperty(data)) return Response.json({ error: "Проверьте название, цену, площадь и точку на карте" }, { status: 400 });
    const db = await getDb();
    const placeholders = data.map((_, index) => `$${index + 1}`).join(",");
    const result = await db.query(`INSERT INTO properties (${columns}) VALUES (${placeholders}) RETURNING *`, data);
    return Response.json({ property: propertyFromRow(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("properties POST", error);
    return Response.json({ error: "Не удалось сохранить объект" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const payload = await request.json() as Record<string, unknown>;
    const id = Number(payload.id);
    if (!id) return Response.json({ error: "Некорректный объект" }, { status: 400 });
    const db = await getDb();
    if (payload.action === "verify") {
      const result = await db.query("UPDATE properties SET verified_at=NOW(), updated_at=NOW() WHERE id=$1 RETURNING *", [id]);
      return Response.json({ property: result.rows[0] ? propertyFromRow(result.rows[0]) : null });
    }
    const data = values(payload);
    if (!validProperty(data)) return Response.json({ error: "Проверьте обязательные поля" }, { status: 400 });
    const result = await db.query(`UPDATE properties SET ${fields}, active=TRUE, updated_at=NOW() WHERE id=$28 RETURNING *`, [...data, id]);
    return Response.json({ property: result.rows[0] ? propertyFromRow(result.rows[0]) : null });
  } catch (error) {
    console.error("properties PATCH", error);
    return Response.json({ error: "Не удалось обновить объект" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const id = Number(new URL(request.url).searchParams.get("id"));
    if (!id) return Response.json({ error: "Некорректный объект" }, { status: 400 });
    const db = await getDb();
    await db.query("UPDATE properties SET active=FALSE, updated_at=NOW() WHERE id=$1", [id]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("properties DELETE", error);
    return Response.json({ error: "Не удалось снять объект" }, { status: 500 });
  }
}
