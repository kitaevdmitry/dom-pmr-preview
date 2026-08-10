import { getAdminUser } from "../../admin-auth";
import { getDb, leadFromRow } from "../../../db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.json() as Record<string, unknown>;
    const name = String(data.name ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    if (name.length < 2 || phone.length < 6) return Response.json({ error: "Проверьте имя и телефон" }, { status: 400 });
    const db = await getDb();
    const result = await db.query(
      "INSERT INTO seller_leads (name,phone,city,property_type,note) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, phone, String(data.city ?? "Тирасполь"), String(data.propertyType ?? "Квартира"), String(data.note ?? "").slice(0, 1000)],
    );
    return Response.json({ lead: leadFromRow(result.rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("leads POST", error);
    return Response.json({ error: "Не удалось сохранить заявку" }, { status: 500 });
  }
}

export async function GET() {
  if (!(await getAdminUser())) return Response.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const db = await getDb();
    const result = await db.query("SELECT * FROM seller_leads ORDER BY id DESC LIMIT 100");
    return Response.json({ leads: result.rows.map(leadFromRow) });
  } catch (error) {
    console.error("leads GET", error);
    return Response.json({ error: "Заявки временно недоступны", leads: [] }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await getAdminUser())) return Response.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const data = await request.json() as Record<string, unknown>;
    const id = Number(data.id);
    const status = String(data.status ?? "");
    if (!id || !["Новая", "В работе", "Завершена"].includes(status)) return Response.json({ error: "Некорректный статус" }, { status: 400 });
    const db = await getDb();
    const result = await db.query("UPDATE seller_leads SET status=$1 WHERE id=$2 RETURNING *", [status, id]);
    return Response.json({ lead: result.rows[0] ? leadFromRow(result.rows[0]) : null });
  } catch (error) {
    console.error("leads PATCH", error);
    return Response.json({ error: "Не удалось обновить заявку" }, { status: 500 });
  }
}
