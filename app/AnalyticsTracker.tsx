"use client";

import { useEffect } from "react";

function send(event:string,propertyId?:number){
  const body=JSON.stringify({event,path:`${location.pathname}${location.search}`,propertyId});
  if(navigator.sendBeacon){navigator.sendBeacon("/api/analytics",new Blob([body],{type:"application/json"}));return}
  void fetch("/api/analytics",{method:"POST",headers:{"content-type":"application/json"},body,keepalive:true});
}

export default function AnalyticsTracker(){
  useEffect(()=>{
    const objectMatch=location.pathname.match(/^\/object\/(\d+)/),propertyId=objectMatch?Number(objectMatch[1]):undefined;
    send(objectMatch?"object_view":"page_view",propertyId);
    const onClick=(event:MouseEvent)=>{
      const target=(event.target as Element|null)?.closest<HTMLElement>("a,button");if(!target)return;
      const href=target instanceof HTMLAnchorElement?target.href:"",explicit=target.dataset.track;
      const name=explicit||(href.startsWith("tel:")?"contact_call":href.includes("wa.me/")?"contact_whatsapp":"");
      if(name)send(name,Number(target.dataset.propertyId)||propertyId);
    };
    const onChange=(event:Event)=>{if((event.target as Element|null)?.closest(".filters"))send("catalog_filter")};
    document.addEventListener("click",onClick);document.addEventListener("change",onChange);
    return()=>{document.removeEventListener("click",onClick);document.removeEventListener("change",onChange)};
  },[]);
  return null;
}
