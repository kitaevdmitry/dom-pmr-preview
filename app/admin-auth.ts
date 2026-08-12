import { createClient } from "../lib/supabase/server";

const ADMIN_EMAILS = new Set(["polupoker@gmail.com","troshinskayaa@gmail.com"]);

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export async function getAdminUser() {
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)return null;
  const supabase=await createClient(),{data:{user}}=await supabase.auth.getUser();
  const email=user?.email?.trim().toLowerCase();
  if(!user||!email||!isAdminEmail(email))return null;
  return {email,displayName:String(user.user_metadata?.full_name??email),fullName:String(user.user_metadata?.full_name??"")||null};
}
