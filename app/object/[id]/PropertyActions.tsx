"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY="dinastiya-favorites";

export default function PropertyActions({id,title}:{id:number;title:string}){
  const [saved,setSaved]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{const timer=setTimeout(()=>{try{const ids=JSON.parse(localStorage.getItem(STORAGE_KEY)??"[]") as number[];setSaved(ids.includes(id))}catch{}},0);return()=>clearTimeout(timer)},[id]);
  function toggle(){let ids:number[]=[];try{ids=JSON.parse(localStorage.getItem(STORAGE_KEY)??"[]")}catch{}const next=ids.includes(id)?ids.filter(item=>item!==id):[...ids,id];localStorage.setItem(STORAGE_KEY,JSON.stringify(next));setSaved(next.includes(id));setMessage(next.includes(id)?"Добавлено в избранное":"Удалено из избранного")}
  async function share(){try{if(navigator.share)await navigator.share({title,url:location.href});else{await navigator.clipboard.writeText(location.href);setMessage("Ссылка скопирована")}}catch(error){if((error as Error).name!=="AbortError")setMessage("Скопируйте ссылку из адресной строки")}}
  return <div className="property-tools"><button className={saved?"saved":""} onClick={toggle} aria-pressed={saved}>♡ {saved?"В избранном":"В избранное"}</button><button onClick={share}>↗ Поделиться</button><span aria-live="polite">{message}</span></div>;
}
