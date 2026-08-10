import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "../../admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await getAdminUser()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="admin-login-shell">
    <form action="/api/admin/login" method="post" className="admin-login-card">
      <Link href="/" className="admin-login-back">← Вернуться на сайт</Link>
      <span className="brand-seal">Д</span>
      <small>ДИНАСТИЯ · УПРАВЛЕНИЕ</small>
      <h1>Вход администратора</h1>
      <p>Доступ только для владельца и сотрудников агентства.</p>
      <label>Пароль<input name="password" type="password" autoComplete="current-password" required autoFocus /></label>
      <button type="submit">Войти</button>
      {error && <strong role="alert">Неверный пароль. Попробуйте ещё раз.</strong>}
    </form>
  </main>;
}
