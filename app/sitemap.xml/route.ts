import { listProperties } from "../../lib/data";
import { demo } from "../property-data";

const escape=(value:string)=>value.replace(/[<>&'\"]/g,char=>({"<":"&lt;",">":"&gt;","&":"&amp;","'":"&apos;",'\"':"&quot;"}[char]??char));

export async function GET(request:Request){
  const origin=new URL(request.url).origin,urls=[{loc:`${origin}/`,lastmod:new Date().toISOString()}];
  try{
    const stored=await listProperties(false);
    if(stored.length)stored.forEach(item=>urls.push({loc:`${origin}/object/${10000+item.id}`,lastmod:new Date(item.updatedAt).toISOString()}));else demo.forEach(item=>urls.push({loc:`${origin}/object/${item.id}`,lastmod:new Date().toISOString()}));
  }catch{demo.forEach(item=>urls.push({loc:`${origin}/object/${item.id}`,lastmod:new Date().toISOString()}))}
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(item=>`\n  <url><loc>${escape(item.loc)}</loc><lastmod>${item.lastmod}</lastmod></url>`).join("")}\n</urlset>`;
  return new Response(xml,{headers:{"content-type":"application/xml; charset=utf-8","cache-control":"public, max-age=3600"}});
}
