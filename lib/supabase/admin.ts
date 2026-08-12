import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./config";

export function createAdminClient(){
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY || supabasePublishableKey;
  return createClient(supabaseUrl,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
