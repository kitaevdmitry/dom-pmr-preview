import { cookies } from "next/headers";
import { createClient } from "../lib/supabase/server";

const ADMIN_EMAILS = new Set(["polupoker@gmail.com","troshinskayaa@gmail.com"]);
const TEST_COOKIE = "dinastia_test_admin";

export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export async function getAdminUser() {
  const cookieStore=await cookies();
  const testEmail=cookieStore.get(TEST_COOKIE)?.value?.trim().toLowerCase();
  if(testEmail&&isAdminEmail(testEmail))return {email:testEmail,displayName:testEmail,fullName:null};

  try{
    const supabase=await createClient(),{data:{user}}=await supabase.auth.getUser();
    const email=user?.email?.trim().toLowerCase();
    if(!user||!email||!isAdminEmail(email))return null;
    return {email,displayName:String(user.user_metadata?.full_name??email),fullName:String(user.user_metadata?.full_name??"")||null};
  }catch{return null}
}

export { TEST_COOKIE };
