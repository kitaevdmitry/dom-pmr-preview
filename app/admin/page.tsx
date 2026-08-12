import { getAdminUser } from "../admin-auth";
import AdminPanel from "./AdminPanel";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return <AdminPanel userName={user.displayName} />;
}
