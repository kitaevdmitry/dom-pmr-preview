"use client";

import { useEffect, useRef, useState } from "react";
import { mainAgent, team, type Agent } from "./team-data";

function AreaTags({areas}:{areas:string}){
  return <div className="agent-area-tags" aria-label="Регионы работы">{areas.split(/, | и /).map(area=><span key={area}>{area}</span>)}</div>;
}

function AgentRow({agent,onOpen}:{agent:Agent;onOpen:(agent:Agent)=>void}){
  return <article className="team-row">
    <span className="agent-monogram" aria-hidden="true">{agent.initials}</span>
    <div className="team-row-copy"><small>{agent.role}</small><h3>{agent.name}</h3><AreaTags areas={agent.areas}/></div>
    <button type="button" onClick={()=>onOpen(agent)}>Профиль сотрудника</button>
  </article>;
}

export default function TeamDirectory(){
  const [selected,setSelected]=useState<Agent|null>(null),[showAll,setShowAll]=useState(false),closeRef=useRef<HTMLButtonElement>(null),lastTrigger=useRef<HTMLElement|null>(null);
  const open=(agent:Agent)=>{lastTrigger.current=document.activeElement as HTMLElement;setSelected(agent)};
  const close=()=>setSelected(null);
  useEffect(()=>{
    if(!selected)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    requestAnimationFrame(()=>closeRef.current?.focus());
    const onKey=(event:KeyboardEvent)=>{
      if(event.key==="Escape")close();
      if(event.key!=="Tab")return;
      const dialog=closeRef.current?.closest("[role=dialog]");
      const focusable=dialog?.querySelectorAll<HTMLElement>('button,a[href]');
      if(!focusable?.length)return;
      const first=focusable[0],last=focusable[focusable.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    };
    addEventListener("keydown",onKey);
    return()=>{document.body.style.overflow=previous;removeEventListener("keydown",onKey);lastTrigger.current?.focus()};
  },[selected]);
  return <>
    <div className="team-directory">
      <article className="team-main-card">
        <span className="agent-monogram large" aria-hidden="true">{mainAgent.initials}</span>
        <div><small>{mainAgent.role} · основной контакт</small><h3>{mainAgent.name}</h3><p>Поможет с первым обращением и направит к специалисту нужного района.</p><AreaTags areas={mainAgent.areas}/><strong>{mainAgent.phone}</strong></div>
        <div className="team-main-actions"><a href={`tel:${mainAgent.tel}`}>Позвонить</a><a href={`https://wa.me/${mainAgent.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a><button type="button" onClick={()=>open(mainAgent)}>Профиль сотрудника</button></div>
      </article>
      <div className="team-roster" aria-label="Специалисты агентства">{team.slice(1).map((agent,index)=><div className={!showAll&&index>=3?"team-mobile-hidden":""} key={agent.id}><AgentRow agent={agent} onOpen={open}/></div>)}</div>
      <button className="team-show-all" type="button" aria-expanded={showAll} onClick={()=>setShowAll(value=>!value)}>{showAll?"Показать основных специалистов":"Показать всю команду"}</button>
    </div>
    {selected&&<div className="team-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)close()}}>
      <section className="team-modal" role="dialog" aria-modal="true" aria-labelledby="agent-modal-title">
        <button className="team-modal-close" type="button" onClick={close} ref={closeRef} aria-label="Закрыть карточку агента">×</button>
        <div className="team-modal-poster"><img src={selected.image} alt={`Карточка агента ${selected.name}`}/></div>
        <div className="team-modal-info"><div className="team-modal-copy"><small>{selected.role}</small><h2 id="agent-modal-title">{selected.name}</h2><AreaTags areas={selected.areas}/><p>{selected.services.join(" · ")}</p><span className="team-modal-contact-copy">Свяжитесь с агентом, чтобы уточнить объект или договориться о консультации.</span><strong>{selected.phone}</strong></div><div className="team-modal-actions"><a href={`tel:${selected.tel}`}>Позвонить</a><a href={`https://wa.me/${selected.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></div></div>
      </section>
    </div>}
  </>;
}
