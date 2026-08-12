import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "../../admin-auth";
import PasswordForm from "./PasswordForm";

export const metadata={title:"Смена пароля — Династия",robots:{index:false,follow:false}};

export default async function PasswordPage(){if(!(await getAdminUser()))redirect("/admin/login");return <main className="admin-login"><section><Link href="/admin">← В админ-панель</Link><small>Безопасность</small><h1>Смена пароля</h1><p>Используйте уникальный пароль длиной не менее 12 символов.</p><PasswordForm/></section></main>}
