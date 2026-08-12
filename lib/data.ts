import { createAdminClient } from "./supabase/admin";

export type StoredPropertyRecord={
  id:number;title:string;location:string;district:string;address:string;deal:string;type:string;price:number;area:number;rooms:number;floor:string;image:string;gallery:string;description:string;features:string;badge:string;publicationStatus:string;condition:string;houseMaterial:string;heating:string;balcony:string;bathroom:string;furniture:string;documents:string;lotArea:number;negotiable:boolean;agentId:string;active:boolean;x:number;y:number;createdAt:string;updatedAt:string;verifiedAt:string;
};

export function mapProperty(row:Record<string,unknown>):StoredPropertyRecord{
  return {id:Number(row.id),title:String(row.title),location:String(row.location),district:String(row.district),address:String(row.address),deal:String(row.deal),type:String(row.type),price:Number(row.price),area:Number(row.area),rooms:Number(row.rooms),floor:String(row.floor),image:String(row.image??""),gallery:JSON.stringify(row.gallery??[]),description:String(row.description??""),features:JSON.stringify(row.features??[]),badge:String(row.badge??""),publicationStatus:String(row.publication_status),condition:String(row.condition),houseMaterial:String(row.house_material),heating:String(row.heating),balcony:String(row.balcony),bathroom:String(row.bathroom),furniture:String(row.furniture),documents:String(row.documents),lotArea:Number(row.lot_area??0),negotiable:Boolean(row.negotiable),agentId:String(row.agent_id??"diana"),active:Boolean(row.active),x:Number(row.x),y:Number(row.y),createdAt:String(row.created_at),updatedAt:String(row.updated_at),verifiedAt:String(row.verified_at)};
}

export async function listProperties(includeAll=false){
  const client=createAdminClient();let query=client.from("properties").select("*").order("id",{ascending:false}).limit(200);
  if(!includeAll)query=query.eq("active",true).in("publication_status",["Опубликован","Задаток"]);
  const {data,error}=await query;if(error)throw error;return (data??[]).map(row=>mapProperty(row));
}

export async function getProperty(id:number){
  const {data,error}=await createAdminClient().from("properties").select("*").eq("id",id).maybeSingle();
  if(error)throw error;return data?mapProperty(data):null;
}

export function propertyRow(p:Record<string,unknown>,gallery:string[],features:string[]){
  return {title:String(p.title??"").trim(),location:String(p.location??"Тирасполь"),district:String(p.district??"Центр"),address:String(p.address??""),deal:String(p.deal??"Продажа"),type:String(p.type??"Квартира"),price:Number(p.price),area:Number(p.area),rooms:Number(p.rooms??0),floor:String(p.floor??"—"),image:gallery[0]??String(p.image??""),gallery,description:String(p.description??"").slice(0,5000),features,badge:String(p.badge??"Новинка"),publication_status:String(p.publicationStatus??"Черновик"),condition:String(p.condition??"Уточняется"),house_material:String(p.houseMaterial??"Уточняется"),heating:String(p.heating??"Уточняется"),balcony:String(p.balcony??"Уточняется"),bathroom:String(p.bathroom??"Уточняется"),furniture:String(p.furniture??"Уточняется"),documents:String(p.documents??"Уточняется"),lot_area:Number(p.lotArea??0),negotiable:p.negotiable===true||p.negotiable==="true",agent_id:String(p.agentId||"diana"),x:Number(p.x),y:Number(p.y),updated_at:new Date().toISOString()};
}
