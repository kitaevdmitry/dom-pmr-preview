import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "../../admin-auth";
import LoginForm from "./LoginForm";

export const metadata={title:"Вход в админ-панель — Династия",robots:{index:false,follow:false}};

export default async function LoginPage(){
  if(await getAdminUser())redirect("/admin");
  return <main className="admin-login"><section><Link href="/">← На сайт</Link><small>Агентство недвижимости «Династия»</small><h1>Вход для сотрудников</h1><p>Используйте учётную запись, созданную администратором агентства.</p><LoginForm/></section></main>;
}
