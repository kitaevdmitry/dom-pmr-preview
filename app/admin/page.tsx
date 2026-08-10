import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "../admin-auth";
import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  if (!process.env.DATABASE_URL) {
    return <main className="admin-denied"><h1>База данных не подключена</h1><p>Добавьте переменную DATABASE_URL в настройках приложения.</p><Link href="/">Вернуться на сайт</Link></main>;
  }
  return <AdminPanel userName={user.displayName} />;
}
