import { getAdminUser } from "../../admin-auth";
import { createAdminClient } from "../../../lib/supabase/admin";
import { listProperties, mapProperty, propertyRow } from "../../../lib/data";

const list=(value:unknown)=>Array.isArray(value)?value.map(String).filter(Boolean):String(value??"").split("\n").map(item=>item.trim()).filter(Boolean);
const allowedDeals=new Set(["Продажа","Аренда"]),allowedTypes=new Set(["Квартира","Дом","Участок","Коммерция"]),allowedStatuses=new Set(["Черновик","Опубликован","Задаток","Продано"]);

function validateProperty(p:Record<string,unknown>){
  const title=String(p.title??"").trim(),price=Number(p.price),area=Number(p.area),rooms=Number(p.rooms??0),lotArea=Number(p.lotArea??0),x=Number(p.x),y=Number(p.y),gallery=list(p.gallery),status=String(p.publicationStatus??"Черновик");
  if(title.length<4||title.length>160)return "Название должно содержать от 4 до 160 символов";
  if(!String(p.location??"").trim()||!String(p.district??"").trim()||!String(p.address??"").trim())return "Укажите город, район и адрес";
  if(!allowedDeals.has(String(p.deal)))return "Некорректный тип сделки";
  if(!allowedTypes.has(String(p.type)))return "Некорректный тип недвижимости";
  if(!allowedStatuses.has(status))return "Некорректный статус публикации";
  if(!Number.isFinite(price)||price<=0)return "Цена должна быть больше нуля";
  if(!Number.isFinite(area)||area<=0)return "Площадь должна быть больше нуля";
  if(!Number.isInteger(rooms)||rooms<0)return "Количество комнат должно быть целым неотрицательным числом";
  if(!Number.isFinite(lotArea)||lotArea<0)return "Площадь участка не может быть отрицательной";
  if(!Number.isFinite(x)||x<-180||x>180||!Number.isFinite(y)||y<-90||y>90)return "Проверьте координаты объекта";
  if((status==="Опубликован"||status==="Задаток")&&gallery.length===0&&!String(p.image??"").trim())return "Для публикации добавьте хотя бы одну фотографию";
  return "";
}

export async function GET(request:Request){
  try{const includeAll=new URL(request.url).searchParams.get("all")==="1";if(includeAll&&!(await getAdminUser()))return Response.json({error:"Нет доступа"},{status:403});return Response.json({properties:await listProperties(includeAll)})}
  catch{return Response.json({error:"Каталог временно недоступен",properties:[]},{status:503})}
}

export async function POST(request:Request){
  if(!(await getAdminUser()))return Response.json({error:"Нет доступа"},{status:403});
  try{const p=await request.json() as Record<string,unknown>,validationError=validateProperty(p);if(validationError)return Response.json({error:validationError},{status:400});const gallery=list(p.gallery),features=list(p.features),client=createAdminClient(),{data,error}=await client.from("properties").insert(propertyRow(p,gallery,features)).select().single();if(error)throw error;return Response.json({property:mapProperty(data)},{status:201})}
  catch{return Response.json({error:"Не удалось сохранить объект"},{status:500})}
}

export async function PATCH(request:Request){
  if(!(await getAdminUser()))return Response.json({error:"Нет доступа"},{status:403});
  try{const p=await request.json() as Record<string,unknown>,id=Number(p.id);if(!id)return Response.json({error:"Некорректный объект"},{status:400});const client=createAdminClient(),now=new Date().toISOString();
    if(p.action==="verify"){const {data,error}=await client.from("properties").update({verified_at:now,updated_at:now}).eq("id",id).select().single();if(error)throw error;return Response.json({property:mapProperty(data)})}
    if(p.action==="restore"){const {data,error}=await client.from("properties").update({active:true,updated_at:now}).eq("id",id).select().single();if(error)throw error;return Response.json({property:mapProperty(data)})}
    const validationError=validateProperty(p);if(validationError)return Response.json({error:validationError},{status:400});const {data,error}=await client.from("properties").update(propertyRow(p,list(p.gallery),list(p.features))).eq("id",id).select().single();if(error)throw error;return Response.json({property:mapProperty(data)});
  }catch{return Response.json({error:"Не удалось обновить объект"},{status:500})}
}

export async function DELETE(request:Request){
  if(!(await getAdminUser()))return Response.json({error:"Нет доступа"},{status:403});
  try{const id=Number(new URL(request.url).searchParams.get("id"));if(!id)return Response.json({error:"Некорректный объект"},{status:400});const {error}=await createAdminClient().from("properties").update({active:false,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error;return Response.json({ok:true})}
  catch{return Response.json({error:"Не удалось снять объект"},{status:500})}
}
