import Link from "next/link";
import type { Metadata } from "next";
import { getProperty } from "../../../lib/data";
import { demo, imageUrl, money, parseList, verifiedLabel, type Property } from "../../property-data";
import PropertyGallery from "./PropertyGallery";
import CatalogBackLink from "./CatalogBackLink";
import SafeImage from "./SafeImage";
import { getAdminUser } from "../../admin-auth";
import PropertyActions from "./PropertyActions";
import { agentWhatsapp, getAgent } from "../../team-data";
import { requestOrigin } from "../../site-url";

export const dynamic="force-dynamic";

async function findProperty(numericId:number,includeAdmin=false):Promise<Property|undefined>{
  const demoItem=demo.find(property=>property.id===numericId);
  if(demoItem)return demoItem;
  if(numericId<10000)return undefined;
  try{
    const stored=await getProperty(numericId-10000);
    const visible=stored?.active&&(["Опубликован","Задаток"].includes(stored.publicationStatus)||(includeAdmin&&Boolean(await getAdminUser())));
    if(!stored||!visible)return undefined;
    return {id:numericId,title:stored.title,location:stored.location,district:stored.district,address:stored.address,deal:stored.deal as Property["deal"],type:stored.type,price:stored.price,area:stored.area,rooms:stored.rooms,floor:stored.floor,badge:stored.badge,lat:stored.y,lng:stored.x,image:stored.image||demo[0].image,gallery:parseList(stored.gallery),description:stored.description,features:parseList(stored.features),publicationStatus:stored.publicationStatus,condition:stored.condition,houseMaterial:stored.houseMaterial,heating:stored.heating,balcony:stored.balcony,bathroom:stored.bathroom,furniture:stored.furniture,documents:stored.documents,lotArea:stored.lotArea,negotiable:stored.negotiable,agentId:stored.agentId,verifiedAt:stored.verifiedAt,updated:verifiedLabel(stored.verifiedAt)};
  }catch{return undefined}
}

export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
  const {id}=await params,item=await findProperty(Number(id));
  if(!item)return {title:"Объект не найден — Династия",robots:{index:false,follow:false}};
  const title=`${item.title} — ${money(item.price,item.deal)}`;
  const description=`${item.type}, ${item.area} м², ${item.location}, ${item.district}. ${item.rooms?`${item.rooms} комн. · `:""}${item.deal.toLowerCase()} через агентство «Династия».`;
  const origin=await requestOrigin(),url=`${origin}/object/${item.id}`,image=new URL(imageUrl(item.image,1200),origin).toString();
  return {title,description,alternates:{canonical:url},openGraph:{title,description,url,siteName:"Династия — недвижимость в ПМР",locale:"ru_RU",type:"website",images:[{url:image,alt:item.title}]},twitter:{card:"summary_large_image",title,description,images:[image]}};
}

export default async function ObjectPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params,numericId=Number(id);
  const item=await findProperty(numericId,true);
  if(!item)return <main className="object-missing"><h1>Объект не найден</h1><p>Возможно, он уже снят с публикации.</p><Link href="/#catalog">Вернуться в каталог</Link></main>;
  const agent=getAgent(item.agentId),whatsapp=agentWhatsapp(agent,`Здравствуйте! Интересует объект №${item.id}: ${item.title}, ${item.location}`),origin=await requestOrigin();
  const gallery=item.gallery?.length?item.gallery:[item.image];
  const similar=demo.filter(candidate=>candidate.id!==item.id&&(candidate.location===item.location||candidate.type===item.type)).slice(0,3);
  const mapLink=`https://www.openstreetmap.org/?mlat=${item.lat}&mlon=${item.lng}#map=16/${item.lat}/${item.lng}`;
  const floorValue=item.floor.replace(/\s*этаж$/i,"");
  const specs=[["Тип",item.type],["Сделка",item.deal],["Площадь",`${item.area} м²`],["Комнат",item.rooms||"—"],["Этаж",floorValue],["Район",item.district],["Состояние",item.condition],["Материал дома",item.houseMaterial],["Отопление",item.heating],["Балкон / лоджия",item.balcony],["Санузел",item.bathroom],["Мебель",item.furniture],["Документы",item.documents],["Участок",item.lotArea?`${item.lotArea} сот.`:undefined],["Торг",item.negotiable?"Возможен":undefined]].filter(([,value])=>value&&value!=="Уточняется") as [string,string|number][];
  const structured={"@context":"https://schema.org","@type":"Offer",url:`${origin}/object/${item.id}`,price:item.price,priceCurrency:"USD",availability:item.publicationStatus==="Задаток"?"https://schema.org/LimitedAvailability":"https://schema.org/InStock",itemOffered:{"@type":"Accommodation",name:item.title,description:item.description,image:gallery.map(photo=>new URL(imageUrl(photo,1200),origin).toString()),floorSize:{"@type":"QuantitativeValue",value:item.area,unitCode:"MTK"},numberOfRooms:item.rooms,address:{"@type":"PostalAddress",streetAddress:item.address,addressLocality:item.location,addressRegion:item.district}}};
  return <main className="object-page"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/>
    <header className="object-header"><CatalogBackLink/><span>Объект №{item.id}</span><a className="object-header-agent" href={`tel:${agent.tel}`}><small>По объекту отвечает {agent.name}</small><strong>{agent.phone}</strong></a></header>
    <div className="object-layout">
      <div className="object-gallery object-gallery-interactive"><PropertyGallery images={gallery} title={item.title}/><span>{item.badge??item.deal}</span></div>
      <section className="object-summary"><small>{item.deal} · {item.location} · {item.district}</small><h1>{item.title}</h1><p className="object-address">⌖ {item.address}</p><div className={`availability ${item.publicationStatus==="Задаток"?"hold":""}`}><span>● {item.publicationStatus==="Задаток"?"Под задатком":"Актуально"}</span><small>{item.updated}</small></div><PropertyActions id={item.id} title={item.title}/><strong>{money(item.price,item.deal)}</strong><div className="object-facts"><span><b>{item.rooms||"—"}</b> комнат</span><span><b>{item.area}</b> м²</span><span><b>{floorValue}</b> этаж</span></div><p>{item.description??"Уточните у агента состояние, комплектацию, документы и удобное время просмотра."}</p><div className="object-actions"><a href={whatsapp} target="_blank" rel="noreferrer">Спросить в WhatsApp</a><a href={`tel:${agent.tel}`}>Позвонить</a></div></section>
    </div>
    <section className="object-details"><div><p className="section-kicker">Главное об объекте</p><h2>Характеристики</h2><dl className="property-specs">{specs.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><ul>{(item.features?.length?item.features:[item.address]).map(feature=><li key={feature}>✓ {feature}</li>)}</ul></div><aside><p className="section-kicker">Расположение</p><h3>{item.location}, {item.district}</h3><p>{item.address}. Точную точку и удобный маршрут подтвердит агент перед просмотром.</p><a href={mapLink} target="_blank" rel="noreferrer">Открыть на карте ↗</a></aside></section>
    <section className="agent-card"><div className="agent-initials" aria-hidden="true">{agent.initials}</div><div><small>Ответственный специалист</small><h2>{agent.name}</h2><p>{agent.role} · {agent.areas}. Расскажет об объекте, проверит актуальность и согласует просмотр.</p><strong>{agent.phone}</strong></div><a href={whatsapp} target="_blank" rel="noreferrer">Задать вопрос →</a></section>
    {similar.length>0&&<section className="similar-objects"><p className="section-kicker">Возможно, подойдёт</p><h2>Похожие объекты</h2><div>{similar.map(candidate=><Link href={`/object/${candidate.id}`} key={candidate.id}><SafeImage src={candidate.image} alt={candidate.title}/><small>{candidate.location} · {candidate.district}</small><h3>{candidate.title}</h3><b>{money(candidate.price,candidate.deal)}</b></Link>)}</div></section>}
    <section className="object-help"><p>Династия · Недвижимость в ПМР</p><h2>Хотите посмотреть этот объект?</h2><p>Свяжитесь с нами — подтвердим актуальность и согласуем удобное время.</p><a href={whatsapp} target="_blank" rel="noreferrer">Записаться на просмотр →</a></section>
    <div className="object-mobile-actions"><a href={`tel:${agent.tel}`}>Позвонить</a><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a></div>
  </main>;
}
