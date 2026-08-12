import { NextResponse } from "next/server";
import { TEST_COOKIE } from "../../admin-auth";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request:Request){
  try{const supabase=await createClient();await supabase.auth.signOut()}catch{}
  const response=NextResponse.redirect(new URL("/",request.url));
  response.cookies.set(TEST_COOKIE,"",{httpOnly:true,sameSite:"lax",secure:true,path:"/",maxAge:0});
  return response;
}
