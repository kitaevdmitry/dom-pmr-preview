"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import AdminMapPicker from "./AdminMapPicker";
import { agentOptions } from "../team-data";

type AdminProperty = {
  id:number; title:string; location:string; district:string; address:string; deal:string;
  type:string; price:number; area:number; rooms:number; floor:string; image:string; gallery:string; description:string; features:string; badge:string; publicationStatus:string;
  condition:string; houseMaterial:string; heating:string; balcony:string; bathroom:string; furniture:string; documents:string; lotArea:number; negotiable:boolean; verifiedAt:string;
  active:boolean; x:number; y:number; agentId:string;
};
type SellerLead={id:number;name:string;phone:string;city:string;propertyType:string;note:string;status:string;createdAt:string};
type AnalyticsSummary={byEvent:{event:string;total:number}[];byDay:{day:string;total:number}[];popularObjects:{propertyId:number;total:number}[]};

const empty = { title:"", location:"Тирасполь", district:"Центр", address:"", deal:"Продажа", type:"Квартира", price:"", area:"", rooms:"1", floor:"", image:"", gallery:"", description:"", features:"", badge:"Новинка", publicationStatus:"Черновик", condition:"Уточняется", houseMaterial:"Уточняется", heating:"Уточняется", balcony:"Уточняется", bathroom:"Уточняется", furniture:"Уточняется", documents:"Уточняется", lotArea:"0", negotiable:"false", agentId:"diana", x:"29.64", y:"46.84" };
const listText=(value:string)=>{try{const parsed=JSON.parse(value||"[]");return Array.isArray(parsed)?parsed.join("\n"):""}catch{return value??""}};

export default function AdminPanel({ userName }: { userName:string }) {
  const [items,setItems]=useState<AdminProperty[]>([]),[leads,setLeads]=useState<SellerLead[]>([]),[analytics,setAnalytics]=useState<AnalyticsSummary|null>(null),[editing,setEditing]=useState<number|null>(null),[status,setStatus]=useState(""),[uploading,setUploading]=useState(false),[saving,setSaving]=useState(false),[catalogView,setCatalogView]=useState<"active"|"archive"|"all">("active"),[dirty,setDirty]=useState(false),[form,setForm]=useState<Record<string,string>>(empty);
  const load=async()=>{const response=await fetch("/api/properties?all=1");const data=await response.json();if(!response.ok)throw new Error(data.error??"Не удалось загрузить каталог");setItems(data.properties??[])};
  useEffect(()=>{let active=true;void Promise.all([fetch("/api/properties?all=1"),fetch("/api/leads"),fetch("/api/analytics")]).then(async responses=>{const data=await Promise.all(responses.map(response=>response.json().then(body=>({ok:response.ok,body}))));if(!active)return;if(!data[0].ok||!data[1].ok)throw new Error("Не удалось загрузить данные админки");setItems(data[0].body.properties??[]);setLeads(data[1].body.leads??[]);if(data[2].ok)setAnalytics(data[2].body)}).catch(error=>{if(active)setStatus(error instanceof Error?error.message:"Не удалось загрузить данные")});return()=>{active=false}},[]);
  useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty){event.preventDefault();event.returnValue=""}};addEventListener("beforeunload",warn);return()=>removeEventListener("beforeunload",warn)},[dirty]);
  const update=(name:string,value:string)=>{setDirty(true);setForm(current=>({...current,[name]:value}))};
  const edit=(p:AdminProperty)=>{setEditing(p.id);setDirty(false);setForm({title:p.title,location:p.location,district:p.district,address:p.address,deal:p.deal,type:p.type,price:String(p.price),area:String(p.area),rooms:String(p.rooms),floor:p.floor,image:p.image,gallery:listText(p.gallery)||p.image,description:p.description??"",features:listText(p.features),badge:p.badge,publicationStatus:p.publicationStatus??"Опубликован",condition:p.condition??"Уточняется",houseMaterial:p.houseMaterial??"Уточняется",heating:p.heating??"Уточняется",balcony:p.balcony??"Уточняется",bathroom:p.bathroom??"Уточняется",furniture:p.furniture??"Уточняется",documents:p.documents??"Уточняется",lotArea:String(p.lotArea??0),negotiable:String(p.negotiable??false),agentId:p.agentId??"diana",x:String(p.x),y:String(p.y)});scrollTo({top:0,behavior:"smooth"})};
  const reset=()=>{setEditing(null);setDirty(false);setForm(empty)};
  function validate(){if(form.title.trim().length<4)return "Название слишком короткое";if(!form.address.trim())return "Укажите адрес";if(Number(form.price)<=0)return "Укажите цену больше нуля";if(Number(form.area)<=0)return "Укажите площадь больше нуля";if(Number(form.rooms)<0||!Number.isInteger(Number(form.rooms)))return "Проверьте количество комнат";if((form.publicationStatus==="Опубликован"||form.publicationStatus==="Задаток")&&!form.gallery.trim()&&!form.image.trim())return "Для публикации нужна хотя бы одна фотография";return ""}
  async function submit(event:FormEvent){event.preventDefault();const error=validate();if(error){setStatus(error);return}setSaving(true);setStatus("Сохраняем…");try{const response=await fetch("/api/properties",{method:editing?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...form,id:editing,price:Number(form.price),area:Number(form.area),rooms:Number(form.rooms),lotArea:Number(form.lotArea),negotiable:form.negotiable==="true",x:Number(form.x),y:Number(form.y),gallery:form.gallery.split("\n").map(value=>value.trim()).filter(Boolean),features:form.features.split("\n").map(value=>value.trim()).filter(Boolean)})});const data=await response.json();if(!response.ok){setStatus(data.error??"Ошибка");return}setStatus(editing?"Изменения сохранены":"Объект добавлен");reset();await load()}catch{setStatus("Нет связи с сервером. Повторите попытку") }finally{setSaving(false)}}
  async function uploadPhotos(files:FileList|null){if(!files?.length)return;setUploading(true);setStatus("Загружаем фотографии…");const payload=new FormData();Array.from(files).forEach(file=>payload.append("photos",file));const response=await fetch("/api/uploads",{method:"POST",body:payload});const data=await response.json();if(response.ok){update("gallery",[form.gallery,...(data.urls??[])].filter(Boolean).join("\n"));setStatus(`Загружено фотографий: ${(data.urls??[]).length}`)}else setStatus(data.error??"Не удалось загрузить фотографии");setUploading(false)}
  async function archive(id:number){if(!confirm("Снять объект с публикации? Он останется в архиве."))return;setStatus("Снимаем объект…");const response=await fetch(`/api/properties?id=${id}`,{method:"DELETE"});const data=await response.json();if(!response.ok){setStatus(data.error??"Не удалось снять объект");return}setStatus("Объект перемещён в архив");await load()}
  async function restore(id:number){setStatus("Возвращаем объект…");const response=await fetch("/api/properties",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,action:"restore"})});const data=await response.json();if(!response.ok){setStatus(data.error??"Не удалось восстановить объект");return}setStatus("Объект восстановлен");await load()}
  async function verify(id:number){setStatus("Подтверждаем актуальность…");const response=await fetch("/api/properties",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,action:"verify"})});setStatus(response.ok?"Актуальность подтверждена":"Не удалось подтвердить актуальность");if(response.ok)await load()}
  async function setLeadStatus(id:number,next:string){const response=await fetch("/api/leads",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,status:next})});if(!response.ok){setStatus("Не удалось изменить статус заявки");return}setLeads(current=>current.map(lead=>lead.id===id?{...lead,status:next}:lead))}
  const visibleItems=items.filter(item=>catalogView==="all"||(catalogView==="active"?item.active:!item.active));
  return <main className="admin-shell">
<header className="admin-header">
<div>
<Link href="/">← На сайт</Link>
<h1>Объекты недвижимости</h1>
<p>Администратор: {userName}</p>
</div>
<div className="admin-header-actions"><Link href="/admin/password">Сменить пароль</Link><a href="/auth/signout">Выйти</a></div>
</header>
<section className="admin-grid">
<form className="admin-form" onSubmit={submit}>
<div className="admin-form-head">
<div>
<small>{editing?"Редактирование":"Новая публикация"}</small>
<h2>{editing?"Изменить объект":"Добавить объект"}</h2>
</div>{editing&&<button type="button" onClick={reset}>Отмена</button>}</div>
<label>Название<input required minLength={4} maxLength={160} value={form.title} onChange={e=>update("title",e.target.value)} placeholder="Например, 2-комнатная на Балке"/>
</label>
<label>Ответственный агент<select value={form.agentId} onChange={e=>update("agentId",e.target.value)}>{agentOptions.map(agent=><option value={agent.id} key={agent.id}>{agent.name} · {agent.role}</option>)}</select></label>
<div className="admin-row">
<label>Сделка<select value={form.deal} onChange={e=>update("deal",e.target.value)}>
<option>Продажа</option>
<option>Аренда</option>
</select>
</label>
<label>Тип<select value={form.type} onChange={e=>update("type",e.target.value)}>
<option>Квартира</option>
<option>Дом</option>
<option>Участок</option>
<option>Коммерция</option>
</select>
</label>
</div>
<div className="admin-row">
<label>Город<input required value={form.location} onChange={e=>update("location",e.target.value)}/>
</label>
<label>Район<input required value={form.district} onChange={e=>update("district",e.target.value)}/>
</label>
</div>
<label>Адрес<input required value={form.address} onChange={e=>update("address",e.target.value)}/>
</label>
<div className="admin-row three">
<label>Цена, $<input required type="number" min="1" value={form.price} onChange={e=>update("price",e.target.value)}/>
</label>
<label>Площадь, м²<input required type="number" min="0.1" step="0.1" value={form.area} onChange={e=>update("area",e.target.value)}/>
</label>
<label>Комнат<input required type="number" min="0" step="1" value={form.rooms} onChange={e=>update("rooms",e.target.value)}/>
</label>
</div>
<div className="admin-row">
<label>Этаж<input value={form.floor} onChange={e=>update("floor",e.target.value)} placeholder="3 / 5"/>
</label>
<label>Метка<input value={form.badge} onChange={e=>update("badge",e.target.value)} placeholder="Новинка"/>
</label>
</div>
<label>Описание<textarea value={form.description} onChange={e=>update("description",e.target.value)} placeholder="Состояние, планировка, что остаётся, преимущества…"/>
</label>
<label>Характеристики — по одной в строке<textarea value={form.features} onChange={e=>update("features",e.target.value)} placeholder={'Автономное отопление\nМебель остаётся\nРаздельные комнаты'}/>
</label>
<div className="admin-row">
<label>Состояние<input value={form.condition} onChange={e=>update("condition",e.target.value)} placeholder="Жилое / под ремонт"/></label>
<label>Материал дома<input value={form.houseMaterial} onChange={e=>update("houseMaterial",e.target.value)} placeholder="Кирпичный / котельцовый"/></label>
</div>
<div className="admin-row">
<label>Отопление<input value={form.heating} onChange={e=>update("heating",e.target.value)} placeholder="Автономное / центральное"/></label>
<label>Балкон или лоджия<input value={form.balcony} onChange={e=>update("balcony",e.target.value)}/></label>
</div>
<div className="admin-row">
<label>Санузел<input value={form.bathroom} onChange={e=>update("bathroom",e.target.value)}/></label>
<label>Мебель<input value={form.furniture} onChange={e=>update("furniture",e.target.value)}/></label>
</div>
<div className="admin-row">
<label>Документы<input value={form.documents} onChange={e=>update("documents",e.target.value)} placeholder="Готовы к сделке"/></label>
<label>Участок, соток<input type="number" min="0" step="0.1" value={form.lotArea} onChange={e=>update("lotArea",e.target.value)}/></label>
</div>
<label>Торг<select value={form.negotiable} onChange={e=>update("negotiable",e.target.value)}><option value="false">Не указан</option><option value="true">Возможен</option></select></label>
<label>Фотографии<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading} onChange={e=>void uploadPhotos(e.target.files)}/><small>{uploading?"Загружаем…":"До 12 фотографий, каждая до 6 МБ"}</small>
</label>
<label>Ссылки на фотографии — по одной в строке<textarea value={form.gallery} onChange={e=>update("gallery",e.target.value)} placeholder="https://…"/>
</label>
<label>Статус публикации<select value={form.publicationStatus} onChange={e=>update("publicationStatus",e.target.value)}><option>Черновик</option><option>Опубликован</option><option>Задаток</option><option>Продано</option></select></label>
<AdminMapPicker lat={Number(form.y)} lng={Number(form.x)} onChange={(lat,lng)=>{setDirty(true);setForm(current=>({...current,y:String(lat),x:String(lng)}))}}/>
<div className="admin-row admin-coordinates">
<label>Широта<input required type="number" step="any" value={form.y} onChange={e=>update("y",e.target.value)}/>
</label>
<label>Долгота<input required type="number" step="any" value={form.x} onChange={e=>update("x",e.target.value)}/>
</label>
</div>
<button className="admin-submit" type="submit" disabled={saving||uploading}>{saving?"Сохраняем…":editing?"Сохранить изменения":"Сохранить объект"}</button>{status&&<p className="admin-status" role="status">{status}</p>}</form>
<section className="admin-list">
<div>
<small>Каталог</small>
<h2>{visibleItems.length} объектов</h2>
<nav className="admin-tabs" aria-label="Состояние объектов"><button className={catalogView==="active"?"active":""} onClick={()=>setCatalogView("active")}>Активные · {items.filter(item=>item.active).length}</button><button className={catalogView==="archive"?"active":""} onClick={()=>setCatalogView("archive")}>Архив · {items.filter(item=>!item.active).length}</button><button className={catalogView==="all"?"active":""} onClick={()=>setCatalogView("all")}>Все</button></nav>
</div>{visibleItems.length===0&&<p className="admin-empty">В этом разделе объектов пока нет.</p>}{visibleItems.map(p=>
<article key={p.id} className={!p.active?"archived":""}>{p.image?<img src={p.image} alt=""/>:<div className="admin-image-empty">Нет фото</div>}<div>
<small>{p.deal} · {p.location} · {p.district}</small>
<h3>{p.title}</h3>
<b>{p.price.toLocaleString("ru-RU")} $</b><em>{p.publicationStatus}</em><small>Агент: {agentOptions.find(agent=>agent.id===p.agentId)?.name??"Меньшая Диана"}</small><small>Проверено {new Date(p.verifiedAt).toLocaleDateString("ru-RU")}</small>
<div>
<button onClick={()=>edit(p)}>Редактировать</button>{p.active&&<button onClick={()=>verify(p.id)}>Подтвердить актуальность</button>}{p.active&&<Link href={`/object/${10000+p.id}`} target="_blank">Предпросмотр</Link>}{p.active?<button onClick={()=>archive(p.id)}>Снять</button>:<button onClick={()=>restore(p.id)}>Восстановить</button>}</div>
</div>
</article>)}</section>
</section>
<section className="admin-analytics"><div><small>Анонимная статистика · последние 30 дней</small><h2>Как пользуются сайтом</h2></div>{!analytics?<p className="admin-empty">Статистика появится после первых посещений.</p>:<div className="analytics-grid">{[{key:"page_view",label:"Просмотры страниц"},{key:"object_view",label:"Просмотры объектов"},{key:"catalog_filter",label:"Использование фильтров"},{key:"contact_call",label:"Нажатия «Позвонить»"},{key:"contact_whatsapp",label:"Переходы в WhatsApp"}].map(metric=><article key={metric.key}><b>{analytics.byEvent.find(item=>item.event===metric.key)?.total??0}</b><span>{metric.label}</span></article>)}</div>}</section>
<section className="admin-leads"><div><small>Заявки собственников</small><h2>{leads.length} обращений</h2></div>{leads.length===0?<p className="admin-empty">Новых заявок пока нет.</p>:<div className="lead-list">{leads.map(lead=><article key={lead.id}><span>{lead.status}</span><div><h3>{lead.name} · <a href={`tel:${lead.phone}`}>{lead.phone}</a></h3><p>{lead.city} · {lead.propertyType}</p>{lead.note&&<small>{lead.note}</small>}<div className="lead-actions"><button onClick={()=>setLeadStatus(lead.id,"Новая")}>Новая</button><button onClick={()=>setLeadStatus(lead.id,"В работе")}>В работе</button><button onClick={()=>setLeadStatus(lead.id,"Завершена")}>Завершена</button></div></div><time>{new Date(lead.createdAt).toLocaleDateString("ru-RU")}</time></article>)}</div>}</section>
</main>
}
