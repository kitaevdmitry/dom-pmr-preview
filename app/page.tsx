"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import PropertyMap from "./PropertyMap";
import { demo, imageUrl, money, objectCount, parseList, verifiedLabel, type Deal, type Property, type StoredProperty } from "./property-data";
import TeamDirectory from "./TeamDirectory";
const places=["Все города","Тирасполь","Бендеры","Днестровск","Слободзея","Рыбница","Дубоссары"],types=["Любой тип","Квартира","Дом","Участок","Коммерция"];

function Brand(){return <span className="brand">
<span className="brand-seal">Д</span>
<span className="brand-copy">
<b>ДИНАСТИЯ</b>
<small>недвижимость для вас</small>
</span>
</span>}
function SmartImage({src,alt,eager=false}:{src:string;alt:string;eager?:boolean}){const [loaded,setLoaded]=useState(false),[fallback,setFallback]=useState(false),imageRef=useRef<HTMLImageElement>(null);const capture=(node:HTMLImageElement|null)=>{imageRef.current=node;if(node?.complete&&node.naturalWidth>0&&!loaded)requestAnimationFrame(()=>setLoaded(true))};return <span className={`image-shell ${loaded?"loaded":""}`}>
<span className="image-skeleton" aria-hidden="true"/>
<img ref={capture} src={fallback?"/tiraspol-dniester.jpg":imageUrl(src,640)} srcSet={fallback?undefined:`${imageUrl(src,360)} 360w, ${imageUrl(src,640)} 640w, ${imageUrl(src,900)} 900w`} sizes="(max-width:700px) 100vw, 45vw" alt={alt} loading={eager?"eager":"lazy"} decoding="async" fetchPriority={eager?"high":"auto"} draggable={false} onLoad={()=>setLoaded(true)} onError={()=>setFallback(true)}/>
</span>}
function CatalogGallery({property,eager,onOpen}:{property:Property;eager:boolean;onOpen:()=>void}){
  const images=Array.from(new Set([property.image,...(property.gallery??[])].filter(Boolean))).slice(0,10),track=useRef<HTMLDivElement>(null),[active,setActive]=useState(0),[engaged,setEngaged]=useState(false);
  const move=(direction:number)=>{const element=track.current;if(!element)return;const next=Math.max(0,Math.min(images.length-1,active+direction));element.scrollTo({left:next*element.clientWidth,behavior:"smooth"});setActive(next)};
  const sync=()=>{const element=track.current;if(element?.clientWidth)setActive(Math.max(0,Math.min(images.length-1,Math.round(element.scrollLeft/element.clientWidth))))};
  return <div className="catalog-gallery" aria-label={`Фотографии: ${property.title}`} tabIndex={0} onKeyDown={event=>{if(event.key==="ArrowLeft")move(-1);if(event.key==="ArrowRight")move(1)}}>
    <div className="catalog-gallery-track" ref={track} onPointerDown={()=>setEngaged(true)} onScroll={sync}>{images.map((src,index)=><Link href={`/object/${property.id}`} onClick={onOpen} aria-label={`Открыть объект, фотография ${index+1} из ${images.length}`} key={`${src}-${index}`}>{(index===0||engaged||Math.abs(index-active)<=1)&&<SmartImage src={src} alt={`${property.title}, фотография ${index+1}`} eager={eager&&index===0}/>}</Link>)}</div>
    {images.length>1&&<><button type="button" className="catalog-gallery-nav prev" onClick={event=>{event.stopPropagation();move(-1)}} disabled={active===0} aria-label="Предыдущая фотография">‹</button><button type="button" className="catalog-gallery-nav next" onClick={event=>{event.stopPropagation();move(1)}} disabled={active===images.length-1} aria-label="Следующая фотография">›</button><span className="catalog-gallery-count">{active+1} / {images.length}</span><span className="catalog-gallery-dots" aria-hidden="true">{images.map((_,index)=><i className={index===active?"active":""} key={index}/>)}</span></>}
  </div>
}
function matchesFloor(value:string,mode:string){const numbers=value.match(/\d+/g)?.map(Number)??[];const current=numbers[0]??0,total=numbers[1]??0;if(mode==="Не первый")return current>1;if(mode==="Не последний")return total>0&&current<total;if(mode==="Средний")return current>1&&total>0&&current<total;return true}

function SellerForm(){
  const [status,setStatus]=useState(""),[submitting,setSubmitting]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(submitting)return;setSubmitting(true);setStatus("Отправляем…");const form=event.currentTarget;try{const response=await fetch("/api/leads",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form)))}),data=await response.json() as {error?:string};if(response.ok){form.reset();setStatus("Спасибо! Мы свяжемся с вами для бесплатной консультации.")}else setStatus(data.error??"Не удалось отправить. Позвоните нам по номеру 0 (777) 88-308.")}catch{setStatus("Не удалось отправить. Проверьте интернет или позвоните нам.")}finally{setSubmitting(false)}}
  return <form className="seller-form" onSubmit={submit}><label className="form-honeypot" aria-hidden="true">Ваш сайт<input name="website" tabIndex={-1} autoComplete="off"/></label><div className="seller-fields"><label>Как к вам обращаться?<input name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Ваше имя"/></label><label>Телефон<input name="phone" required type="tel" inputMode="tel" autoComplete="tel" pattern="[0-9+()\-\s]{7,24}" placeholder="0 (___) __-___"/></label><label>Город<select name="city" aria-label="Город продаваемой недвижимости"><option>Тирасполь</option><option>Бендеры</option><option>Днестровск</option><option>Слободзея</option><option>Рыбница</option><option>Дубоссары</option><option>Другой</option></select></label><label>Что продаём?<select name="propertyType" aria-label="Тип продаваемой недвижимости"><option>Квартира</option><option>Дом</option><option>Участок</option><option>Коммерция</option></select></label></div><label className="seller-note">Коротко об объекте<textarea name="note" maxLength={1000} placeholder="Район, площадь, состояние — если удобно"/></label><label className="privacy-consent"><input type="checkbox" required aria-label="Согласие на обработку контактных данных"/> <span>Согласен(на) на обработку контактных данных согласно <Link href="/privacy">политике конфиденциальности</Link>.</span></label><button type="submit" disabled={submitting}>{submitting?"Отправляем…":"Получить консультацию по продаже →"}</button><small>Свяжемся только по вопросу вашего объекта. Без навязчивых рассылок.</small>{status&&<p role="status">{status}</p>}</form>
}

export default function Home(){
  const [items,setItems]=useState<Property[]>(demo),[place,setPlace]=useState("Все города"),[district,setDistrict]=useState("Любой район"),[deal,setDeal]=useState<"Любая сделка"|Deal>("Любая сделка"),[type,setType]=useState("Любой тип"),[minPrice,setMinPrice]=useState<number|null>(null),[maxPrice,setMaxPrice]=useState<number|null>(null),[minArea,setMinArea]=useState(0),[rooms,setRooms]=useState(0),[floorMode,setFloorMode]=useState("Любой этаж"),[condition,setCondition]=useState("Любое состояние"),[heating,setHeating]=useState("Любое отопление"),[photosOnly,setPhotosOnly]=useState(false),[sort,setSort]=useState("recommended");
  const [selected,setSelected]=useState<Property|null>(null),[saved,setSaved]=useState<number[]>([]),[favoritesReady,setFavoritesReady]=useState(false),[favoritesOnly,setFavoritesOnly]=useState(false),[filtersReady,setFiltersReady]=useState(false),[filtersOpen,setFiltersOpen]=useState(false),[mobileMode,setMobileMode]=useState<"map"|"list">("list"),[mapSeen,setMapSeen]=useState(false),[desktopMapOpen,setDesktopMapOpen]=useState(false),[isMobile,setIsMobile]=useState(true);
  const filterTriggerRef=useRef<HTMLButtonElement>(null),filterDialogRef=useRef<HTMLDivElement>(null),filterCloseRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const media=matchMedia("(max-width:1000px)"),sync=()=>setIsMobile(media.matches);sync();media.addEventListener("change",sync);return()=>media.removeEventListener("change",sync)},[]);
  useEffect(()=>{let stored=false;try{stored=localStorage.getItem("dinastiya-desktop-map") === "shown"}catch{}const timer=setTimeout(()=>setDesktopMapOpen(stored),0);return()=>clearTimeout(timer)},[]);
  useEffect(()=>{if(!filtersOpen)return;const previous=document.body.style.overflow,trigger=filterTriggerRef.current;document.body.style.overflow="hidden";requestAnimationFrame(()=>filterCloseRef.current?.focus());const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){setFiltersOpen(false);return}if(event.key!=="Tab")return;const focusable=filterDialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),select,input,summary');if(!focusable?.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}};addEventListener("keydown",onKey);return()=>{document.body.style.overflow=previous;removeEventListener("keydown",onKey);trigger?.focus()}},[filtersOpen]);
  useEffect(()=>{let restored:number[]=[];try{const stored=localStorage.getItem("dinastiya-favorites");if(stored)restored=JSON.parse(stored)}catch{}const timer=setTimeout(()=>{setSaved(restored);setFavoritesReady(true)},0);return()=>clearTimeout(timer)},[]);
  useEffect(()=>{if(favoritesReady)localStorage.setItem("dinastiya-favorites",JSON.stringify(saved))},[saved,favoritesReady]);
  useEffect(()=>{const query=new URLSearchParams(location.search);const timer=setTimeout(()=>{const queryDeal=query.get("deal");setPlace(query.get("place")||"Все города");setDistrict(query.get("district")||"Любой район");setDeal(queryDeal==="Продажа"||queryDeal==="Аренда"?queryDeal:"Любая сделка");setType(query.get("type")||"Любой тип");setMinPrice(query.get("priceFrom")?Number(query.get("priceFrom")):null);setMaxPrice(query.get("price")?Number(query.get("price")):null);setMinArea(query.get("area")?Number(query.get("area")):0);setRooms(query.get("rooms")?Number(query.get("rooms")):0);setFloorMode(query.get("floor")||"Любой этаж");setCondition(query.get("condition")||"Любое состояние");setHeating(query.get("heating")||"Любое отопление");setPhotosOnly(query.get("photos")==="1");setSort(query.get("sort")||"recommended");setFavoritesOnly(query.get("saved")==="1");if(query.get("view")==="map"){setMobileMode("map");setMapSeen(true)}setFiltersReady(true);const position=sessionStorage.getItem("dinastiya-catalog-scroll");if(position){const top=Number(position);const restore=()=>scrollTo({top,behavior:"auto"});requestAnimationFrame(restore);setTimeout(restore,140);setTimeout(()=>{restore();sessionStorage.removeItem("dinastiya-catalog-scroll")},520)}},0);return()=>clearTimeout(timer)},[]);
  useEffect(()=>{if(!filtersReady)return;const query=new URLSearchParams();if(place!=="Все города")query.set("place",place);if(district!=="Любой район")query.set("district",district);if(deal!=="Любая сделка")query.set("deal",deal);if(type!=="Любой тип")query.set("type",type);if(minPrice!==null)query.set("priceFrom",String(minPrice));if(maxPrice!==null)query.set("price",String(maxPrice));if(minArea>0)query.set("area",String(minArea));if(rooms>0)query.set("rooms",String(rooms));if(floorMode!=="Любой этаж")query.set("floor",floorMode);if(condition!=="Любое состояние")query.set("condition",condition);if(heating!=="Любое отопление")query.set("heating",heating);if(photosOnly)query.set("photos","1");if(sort!=="recommended")query.set("sort",sort);if(favoritesOnly)query.set("saved","1");if(mobileMode==="map")query.set("view","map");const search=query.toString();history.replaceState(null,"",search?`/?${search}`:"/")},[place,district,deal,type,minPrice,maxPrice,minArea,rooms,floorMode,condition,heating,photosOnly,sort,favoritesOnly,mobileMode,filtersReady]);
  useEffect(()=>{const controller=new AbortController();let retry:ReturnType<typeof setTimeout>|undefined;const load=async(secondAttempt=false)=>{try{const response=await fetch("/api/properties",{signal:controller.signal});if(!response.ok)throw new Error("catalog");const data=await response.json() as {properties?:StoredProperty[]};const added=(data.properties??[]).map(p=>({id:10000+p.id,title:p.title,location:p.location,district:p.district,address:p.address,deal:p.deal,type:p.type,price:p.price,area:p.area,rooms:p.rooms,floor:p.floor,badge:p.badge,lat:p.y,lng:p.x,image:p.image||demo[0].image,gallery:parseList(p.gallery),description:p.description,features:parseList(p.features),publicationStatus:p.publicationStatus,condition:p.condition,houseMaterial:p.houseMaterial,heating:p.heating,balcony:p.balcony,bathroom:p.bathroom,furniture:p.furniture,documents:p.documents,lotArea:p.lotArea,negotiable:p.negotiable,verifiedAt:p.verifiedAt,agentId:p.agentId,updated:verifiedLabel(p.verifiedAt)}));if(!controller.signal.aborted)setItems(added.length?added:demo)}catch(error){if((error as Error).name!=="AbortError"&&!secondAttempt)retry=setTimeout(()=>void load(true),6000)}};void load();return()=>{controller.abort();if(retry)clearTimeout(retry)}},[]);
  const districts=useMemo(()=>["Любой район",...Array.from(new Set(items.filter(p=>place==="Все города"||p.location===place).map(p=>p.district)))],[items,place]);
  const conditions=useMemo(()=>["Любое состояние",...Array.from(new Set(items.map(p=>p.condition).filter((value):value is string=>Boolean(value&&value!=="Уточняется"))))],[items]);
  const heatingOptions=useMemo(()=>["Любое отопление",...Array.from(new Set(items.map(p=>p.heating).filter((value):value is string=>Boolean(value&&value!=="Уточняется"))))],[items]);
  const filtered=useMemo(()=>{const list=items.filter(p=>(!favoritesOnly||saved.includes(p.id))&&(place==="Все города"||p.location===place)&&(district==="Любой район"||p.district===district)&&(deal==="Любая сделка"||p.deal===deal)&&(type==="Любой тип"||p.type===type)&&(minPrice===null||p.price>=minPrice)&&(maxPrice===null||p.price<=maxPrice)&&p.area>=minArea&&(rooms===0||(rooms===4?p.rooms>=4:p.rooms===rooms))&&matchesFloor(p.floor,floorMode)&&(condition==="Любое состояние"||p.condition===condition)&&(heating==="Любое отопление"||p.heating===heating)&&(!photosOnly||Boolean(p.image)));return sort==="cheap"?[...list].sort((a,b)=>a.price-b.price):sort==="large"?[...list].sort((a,b)=>b.area-a.area):list},[items,place,district,deal,type,minPrice,maxPrice,minArea,rooms,floorMode,condition,heating,photosOnly,sort,favoritesOnly,saved]);
  const activeFilters=[place!=="Все города",district!=="Любой район",deal!=="Любая сделка",type!=="Любой тип",minPrice!==null,maxPrice!==null,minArea>0,rooms>0,floorMode!=="Любой этаж",condition!=="Любое состояние",heating!=="Любое отопление",photosOnly].filter(Boolean).length;
  const advancedCount=[type!=="Любой тип",minArea>0,rooms>0,floorMode!=="Любой этаж",condition!=="Любое состояние",heating!=="Любое отопление",photosOnly].filter(Boolean).length;
  const changeDeal=(value:"Любая сделка"|Deal)=>{setDeal(value);setMinPrice(null);setMaxPrice(null)};
  const reset=()=>{setPlace("Все города");setDistrict("Любой район");setDeal("Любая сделка");setType("Любой тип");setMinPrice(null);setMaxPrice(null);setMinArea(0);setRooms(0);setFloorMode("Любой этаж");setCondition("Любое состояние");setHeating("Любое отопление");setPhotosOnly(false)};
  const pickProperty=(id:number)=>{const item=items.find(p=>p.id===id);if(item)setSelected(item)};
  const showMap=isMobile?mapSeen:desktopMapOpen;
  const openMap=()=>{setMapSeen(true);setMobileMode("map")};
  const toggleDesktopMap=()=>setDesktopMapOpen(current=>{const next=!current;try{localStorage.setItem("dinastiya-desktop-map",next?"shown":"hidden")}catch{}return next});
  const rememberPosition=()=>{try{sessionStorage.setItem("dinastiya-catalog-scroll",String(scrollY));sessionStorage.setItem("dinastiya-catalog-return",`${location.pathname}${location.search}#catalog`)}catch{}};
  const quickSearch=(propertyType:string)=>{setDeal("Продажа");setType(propertyType);setPlace("Все города");setDistrict("Любой район");setTimeout(()=>document.getElementById("catalog")?.scrollIntoView({behavior:"smooth"}),0)};

  return <main>
<header className="site-header">
<a href="#top" aria-label="Династия — на главную">
<Brand/>
</a>
<nav>
<a href="#catalog">Объекты</a>
<a href="#sell">Продать</a>
<a href="#services">Услуги</a>
<a href="#contacts">Контакты</a>
</nav>
<div className="header-actions">
<a className="instagram" href="https://www.instagram.com/dinastya_nedvijimost" target="_blank" rel="noreferrer">Instagram ↗</a>
<a className="header-phone" href="tel:+37377788308">0 (777) 88-308</a>
<a className="outline-button desktop-consult" href="#contacts">Консультация</a>
<a className="outline-button mobile-catalog-link" href="#catalog">Объекты</a>
</div>
</header>
    <section className="hero" id="top">
<div className="hero-content">
<div className="hero-label">
<span>●</span> Агентство недвижимости в ПМР</div>
<h1>Дом начинается<br/>
<em>с правильного выбора.</em>
</h1>
<p>Квартиры, дома и участки в Тирасполе, Бендерах и по всему Приднестровью — с человеческим сопровождением на каждом шаге.</p>
<div className="hero-actions">
<a className="primary-button" href="#catalog">Выбрать объект <span>→</span>
</a>
<a className="text-link" href="tel:+37377788308">Получить консультацию</a>
</div>
<div className="hero-quick-search"><span>Быстрый поиск</span><button onClick={()=>quickSearch("Квартира")}>Квартиры</button><button onClick={()=>quickSearch("Дом")}>Дома</button><a href="#catalog">Все объекты →</a></div>
<div className="hero-proof">
<div>
<b>Купить</b>
<span>подбор под ваш запрос</span>
</div>
<div>
<b>Продать</b>
<span>оценка и сопровождение</span>
</div>
<div>
<b>Арендовать</b>
<span>без лишних поездок</span>
</div>
</div>
</div>
<figure className="hero-card property-hero">
<img className="hero-local-photo" src="/tiraspol-dniester.jpg" alt="Тирасполь и набережная Днестра" fetchPriority="high"/>
<figcaption>
<span>Приднестровье · Здесь мы дома</span>
<b>Знаем районы не только по карте</b>
<strong>Недвижимость по всему ПМР</strong>
</figcaption>
<div className="hero-local">Династия<br/>
<small>Знаем каждый район</small>
</div>
</figure>
</section>
    <section className="trust-strip" aria-label="Факты об агентстве"><div><b>6 500+</b><span>следят за «Династией» в Instagram</span></div><div><b>ПМР</b><span>Тирасполь, Бендеры и ближайшие города</span></div><div><b>4 направления</b><span>покупка, аренда, ипотека и документы</span></div><a href="https://www.instagram.com/dinastya_nedvijimost" target="_blank" rel="noreferrer">Смотреть Instagram ↗</a></section>
    <section className="catalog" id="catalog">
<div className="catalog-title">
<div>
<p className="section-kicker">Каталог недвижимости</p>
<h2>Найдите свой объект</h2>
</div>
<span>{objectCount(filtered.length)} по вашим параметрам</span>
</div>
<div className="mobile-searchbar">
<button ref={filterTriggerRef} onClick={()=>setFiltersOpen(true)} aria-haspopup="dialog" aria-expanded={filtersOpen}>☰ Фильтры {activeFilters>0&&<b>{activeFilters}</b>}</button>
<div>
<button className={mobileMode==="list"?"active":""} onClick={()=>setMobileMode("list")}>☷ Список</button>
<button className={mobileMode==="map"?"active":""} onClick={openMap} data-track="map_open">⌖ Карта</button>
</div>
</div>
      <div ref={filterDialogRef} className={`filters ${filtersOpen?"open":""}`} role={filtersOpen?"dialog":undefined} aria-modal={filtersOpen?true:undefined} aria-labelledby={filtersOpen?"filter-dialog-title":undefined}>
<div className="filter-mobile-head">
<strong id="filter-dialog-title">Что вы ищете?</strong>
<button ref={filterCloseRef} onClick={()=>setFiltersOpen(false)} aria-label="Закрыть фильтры">×</button>
</div>
<label>
<span>Сделка</span>
<select aria-label="Тип сделки" value={deal} onChange={e=>changeDeal(e.target.value as "Любая сделка"|Deal)}>
<option>Любая сделка</option>
<option>Продажа</option>
<option>Аренда</option>
</select>
</label>
<label>
<span>Город</span>
<select aria-label="Город объекта" value={place} onChange={e=>{setPlace(e.target.value);setDistrict("Любой район")}}>{places.map(p=>
<option key={p}>{p}</option>)}</select>
</label>
<label>
<span>Район</span>
<select aria-label="Район объекта" value={district} onChange={e=>setDistrict(e.target.value)}>{districts.map(p=>
<option key={p}>{p}</option>)}</select>
</label>
<label className="price-filter">
<span>Стоимость, $</span>
<span className="price-range"><input aria-label="Стоимость от" type="number" min="0" step={deal==="Аренда"?50:1000} value={minPrice??""} placeholder="От" onChange={e=>setMinPrice(e.target.value?Number(e.target.value):null)}/><input aria-label="Стоимость до" type="number" min="0" step={deal==="Аренда"?50:1000} value={maxPrice??""} placeholder="До" onChange={e=>setMaxPrice(e.target.value?Number(e.target.value):null)}/></span>
</label>
<details className="advanced-filter-block"><summary>Дополнительные параметры {advancedCount>0&&<b>{advancedCount}</b>}</summary><div><label><span>Тип объекта</span><select value={type} onChange={e=>setType(e.target.value)}>{types.map(p=><option key={p}>{p}</option>)}</select></label><label><span>Площадь от, м²</span><input type="number" value={minArea||""} placeholder="Любая" onChange={e=>setMinArea(Number(e.target.value))}/></label><fieldset><legend>Количество комнат</legend><div>{[0,1,2,3,4].map(n=><button type="button" data-track="catalog_filter" className={rooms===n?"picked":""} onClick={()=>setRooms(n)} key={n}>{n===0?"Все":n===4?"4+":n}</button>)}</div></fieldset><label><span>Этаж</span><select value={floorMode} onChange={e=>setFloorMode(e.target.value)}><option>Любой этаж</option><option>Не первый</option><option>Не последний</option><option>Средний</option></select></label><label><span>Состояние</span><select value={condition} onChange={e=>setCondition(e.target.value)}>{conditions.map(value=><option key={value}>{value}</option>)}</select></label><label><span>Отопление</span><select value={heating} onChange={e=>setHeating(e.target.value)}>{heatingOptions.map(value=><option key={value}>{value}</option>)}</select></label><label className="photo-filter"><input type="checkbox" checked={photosOnly} onChange={e=>setPhotosOnly(e.target.checked)}/><span>Только с фотографиями</span></label></div></details>
<div className="filter-mobile-actions"><button className="reset-filters" onClick={reset} disabled={activeFilters===0}>Сбросить</button>
<button className="apply-filters" data-track="catalog_filter" onClick={()=>setFiltersOpen(false)}>Показать {objectCount(filtered.length)}</button></div>
</div>
{activeFilters>0&&<div className="active-filter-chips" aria-label="Активные фильтры">{place!=="Все города"&&<button onClick={()=>{setPlace("Все города");setDistrict("Любой район")}}>{place} ×</button>}{district!=="Любой район"&&<button onClick={()=>setDistrict("Любой район")}>{district} ×</button>}{deal!=="Любая сделка"&&<button onClick={()=>setDeal("Любая сделка")}>{deal} ×</button>}{type!=="Любой тип"&&<button onClick={()=>setType("Любой тип")}>{type} ×</button>}{minPrice!==null&&<button onClick={()=>setMinPrice(null)}>от {new Intl.NumberFormat("ru-RU").format(minPrice)} $ ×</button>}{maxPrice!==null&&<button onClick={()=>setMaxPrice(null)}>до {new Intl.NumberFormat("ru-RU").format(maxPrice)} $ ×</button>}{minArea>0&&<button onClick={()=>setMinArea(0)}>от {minArea} м² ×</button>}{rooms>0&&<button onClick={()=>setRooms(0)}>{rooms===4?"4+":rooms} комн. ×</button>}{floorMode!=="Любой этаж"&&<button onClick={()=>setFloorMode("Любой этаж")}>{floorMode} ×</button>}{condition!=="Любое состояние"&&<button onClick={()=>setCondition("Любое состояние")}>{condition} ×</button>}{heating!=="Любое отопление"&&<button onClick={()=>setHeating("Любое отопление")}>{heating} ×</button>}{photosOnly&&<button onClick={()=>setPhotosOnly(false)}>С фото ×</button>}<button className="clear-all" onClick={reset}>Очистить всё</button></div>}
      <div className={`catalog-grid mode-${mobileMode} ${!isMobile&&!desktopMapOpen?"desktop-map-hidden":""}`}>
<section className="results-panel">
<div className="results-toolbar">
<div><strong>{objectCount(filtered.length)}</strong><button className={favoritesOnly?"favorites-toggle active":"favorites-toggle"} onClick={()=>setFavoritesOnly(value=>!value)}>♡ Избранное · {saved.length}</button></div>
<div className="results-toolbar-actions">
<select aria-label="Сортировка объектов" value={sort} onChange={e=>setSort(e.target.value)}>
<option value="recommended">Сначала рекомендуем</option>
<option value="cheap">Сначала дешевле</option>
<option value="large">Сначала больше</option>
</select>
</div>
<button className="desktop-map-toggle" type="button" data-track={desktopMapOpen?"map_close":"map_open"} aria-pressed={!desktopMapOpen} onClick={toggleDesktopMap}>{desktopMapOpen?"Скрыть карту":"Показать карту"}</button>
</div>
<div className="property-list">{filtered.map((p,index)=>
<article className="property-card" key={p.id}>
<Link className="property-card-link" href={`/object/${p.id}`} onClick={rememberPosition} aria-label={`Открыть объект: ${p.title}`}/>
<div className="property-photo">
<CatalogGallery property={p} eager={index<2} onOpen={rememberPosition}/>
<span className={p.publicationStatus==="Задаток"?"status-hold":""}>{p.publicationStatus==="Задаток"?"Под задатком":p.badge??p.deal}</span>
<button className={saved.includes(p.id)?"saved":""} data-track={saved.includes(p.id)?undefined:"favorite_add"} data-property-id={p.id} onClick={e=>{e.stopPropagation();setSaved(current=>current.includes(p.id)?current.filter(id=>id!==p.id):[...current,p.id])}} aria-label={saved.includes(p.id)?"Убрать из избранного":"Сохранить объект"} aria-pressed={saved.includes(p.id)}>♡</button>
</div>
<div className="property-info">
<small>⌖ {p.location} · {p.district}</small>
<h3>{p.title}</h3>
<div className="property-facts">
<span>{p.rooms||"—"} комн.</span>
<span>{p.area} м²</span>
<span>{p.floor}</span>
</div>
<div className="property-price">
<b>{money(p.price,p.deal)}</b>{p.deal==="Продажа"&&<span>{Math.round(p.price/p.area)} $ / м²</span>}</div>
<div className="property-card-foot"><small>{p.updated}</small><span>Смотреть объект →</span></div>
</div>
</article>)}{filtered.length===0&&<div className="empty-results"><span>{favoritesOnly?"♡":"⌕"}</span><h3>{favoritesOnly?"В избранном пока пусто":"Подходящих объектов пока нет"}</h3><p>{favoritesOnly?"Нажмите на сердечко в карточке — объект сохранится на этом устройстве.":"Попробуйте изменить параметры или напишите нам — проверим варианты, которых ещё нет на сайте."}</p>{favoritesOnly?<button onClick={()=>setFavoritesOnly(false)}>Показать все объекты</button>:<button onClick={reset}>Сбросить фильтры</button>}<a href="https://wa.me/37377788308" target="_blank" rel="noreferrer">Написать в WhatsApp</a></div>}</div>
</section>
<aside className="map-panel">{showMap?<PropertyMap properties={filtered} selectedId={selected?.id} onSelect={pickProperty} focusLocation={place==="Все города"?undefined:place}/>:<div className="map-placeholder">Карта загрузится после выбора режима</div>}<div className="map-tip">Нажмите на цену, чтобы увидеть объект</div>{selected&&<div className="map-property">
<button onClick={()=>setSelected(null)} aria-label="Закрыть">×</button>
<img src={imageUrl(selected.image,240)} alt="" loading="lazy" decoding="async" onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src="/tiraspol-dniester.jpg"}}/>
<div>
<small>{selected.location} · {selected.district}</small>
<strong>{money(selected.price,selected.deal)}</strong>
<span>{selected.title}</span>
<Link className="map-more" href={`/object/${selected.id}`} onClick={rememberPosition}>Подробнее</Link>
</div>
</div>}</aside>
</div>
</section>
    <section className="local-story">
<div className="local-photo">
<img src="/tiraspol-dniester.jpg" alt="Тирасполь и набережная Днестра" loading="lazy"/>
<span>Тирасполь · Днестр</span>
</div>
<div>
<p className="section-kicker">Здесь мы дома</p>
<h2>Знаем город<br/>не только по карте</h2>
<p>Район, дорога до работы, инфраструктура, состояние дома — хороший выбор складывается из деталей. Мы поможем увидеть их до принятия решения.</p>
<a className="text-link" href="https://www.instagram.com/dinastya_nedvijimost" target="_blank" rel="noreferrer">Познакомиться с нами в Instagram ↗</a>
</div>
</section>
    <section className="seller-section" id="sell"><div className="seller-intro"><p className="section-kicker">Хотите продать недвижимость?</p><h2>Начнём с честной<br/>оценки объекта</h2><p>Расскажите нам о квартире, доме или участке. Обсудим рыночную стоимость, документы и план продажи — бесплатно и без обязательств.</p><div className="seller-steps"><span><b>01</b> Знакомимся с объектом</span><span><b>02</b> Согласовываем цену и план</span><span><b>03</b> Готовим публикацию и показы</span></div></div><SellerForm/></section>
    <section className="services" id="services">
<p className="section-kicker">Все вопросы — в одном месте</p>
<h2>Сделка без лишних<br/>переживаний</h2>
<div className="service-grid">
<article>
<b>01</b>
<h3>Продать или купить</h3>
<p>Оценим объект, найдём покупателя или подходящий дом.</p>
</article>
<article>
<b>02</b>
<h3>Сдать или снять</h3>
<p>Подберём надёжных арендаторов и оформим договор.</p>
</article>
<article>
<b>03</b>
<h3>Ипотека</h3>
<p>Объясним условия и поможем пройти весь процесс.</p>
</article>
<article>
<b>04</b>
<h3>Документы</h3>
<p>Сопроводим куплю-продажу, дарение и оформление.</p>
</article>
</div>
</section>
    <section className="team-section" aria-labelledby="team-title">
<div className="team-intro"><p className="section-kicker">Наша команда</p><h2 id="team-title">Люди, которым можно<br/>доверить сделку</h2><p>У каждого объекта есть ответственный специалист. Главный контакт агентства — Диана; при необходимости она направит к агенту вашего района.</p><a href="https://www.instagram.com/dinastya_nedvijimost" target="_blank" rel="noreferrer">Команда в Instagram ↗</a></div>
<TeamDirectory/>
<div className="instagram-proof"><b>6 специалистов</b><span>работают по Тирасполю, Бендерам и районам Приднестровья</span><a href="https://www.instagram.com/dinastya_nedvijimost" target="_blank" rel="noreferrer">Познакомиться в Instagram ↗</a></div>
</section>
    <section className="contact-section" id="contacts">
<div>
<p className="section-kicker">Давайте знакомиться</p>
<h2>Расскажите, что<br/>вы ищете</h2>
<p>Консультация бесплатная. Ответим на вопросы и предложим следующие шаги.</p>
</div>
<div className="contact-card">
<Brand/>
<a className="big-phone" href="tel:+37377788308">0 (777) 88-308</a>
<span>Тирасполь, ул. Юности, 15/2</span>
<div>
<a href="https://wa.me/37377788308" target="_blank" rel="noreferrer">WhatsApp</a>
<a href="https://www.instagram.com/dinastya_nedvijimost" target="_blank" rel="noreferrer">Instagram</a>
</div>
</div>
</section>
<footer>
<Brand/>
<div>
<span>© 2026 Агентство недвижимости «Династия»</span>
<small className="photo-credits">Фото Тирасполя: FotoTerra / CC 3.0</small>
<Link className="footer-privacy" href="/privacy">Политика конфиденциальности</Link>
</div>
<a href="#top">Наверх ↑</a>
</footer>
<div className="mobile-contactbar">
<a href="tel:+37377788308">Позвонить</a>
<a href="https://wa.me/37377788308" target="_blank" rel="noreferrer">Написать в WhatsApp</a>
</div>
  </main>
}
