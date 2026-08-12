import { headers } from "next/headers";

const fallback="https://dom-pmr-site.vercel.app";

export async function requestOrigin(){
  try{
    const values=await headers(),host=(values.get("x-forwarded-host")??values.get("host")??"").split(",")[0].trim();
    if(!/^[a-z0-9.-]+(?::\d+)?$/i.test(host))return fallback;
    const forwarded=(values.get("x-forwarded-proto")??"").split(",")[0].trim();
    const protocol=forwarded==="http"||forwarded==="https"?forwarded:host.startsWith("localhost")||host.startsWith("terminal.local")?"http":"https";
    return `${protocol}://${host}`;
  }catch{return fallback}
}
