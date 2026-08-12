"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { imageUrl } from "../../property-data";

function GalleryImage({src,alt,width,eager=false}:{src:string;alt:string;width:number;eager?:boolean}){
  const [fallback,setFallback]=useState(false);
  return <img src={fallback?"/tiraspol-dniester.jpg":imageUrl(src,width)} alt={alt} loading={eager?"eager":"lazy"} decoding="async" fetchPriority={eager?"high":"auto"} draggable={false} onError={()=>setFallback(true)}/>;
}

export default function PropertyGallery({images,title}:{images:string[];title:string}){
  const [index,setIndex]=useState(0),[open,setOpen]=useState(false);
  const gesture=useRef<{x:number;y:number}|null>(null),ignoreClick=useRef(false),opener=useRef<HTMLButtonElement>(null),dialog=useRef<HTMLDivElement>(null),closeButton=useRef<HTMLButtonElement>(null);
  const active=images[index]??images[0];
  const move=useCallback((direction:number)=>setIndex(current=>(current+direction+images.length)%images.length),[images.length]);
  const startGesture=(event:React.PointerEvent<HTMLElement>)=>{if(event.pointerType==="mouse")return;gesture.current={x:event.clientX,y:event.clientY};ignoreClick.current=false};
  const trackGesture=(event:React.PointerEvent<HTMLElement>)=>{if(!gesture.current)return;const dx=event.clientX-gesture.current.x,dy=event.clientY-gesture.current.y;if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy))ignoreClick.current=true};
  const finishGesture=(event:React.PointerEvent<HTMLElement>)=>{if(!gesture.current)return;const dx=event.clientX-gesture.current.x,dy=event.clientY-gesture.current.y;gesture.current=null;if(images.length>1&&Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.15){ignoreClick.current=true;move(dx<0?1:-1)}};
  const cancelGesture=()=>{gesture.current=null};
  useEffect(()=>{if(!open)return;const previous=document.body.style.overflow,openerElement=opener.current;document.body.style.overflow="hidden";closeButton.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false);if(event.key==="ArrowRight")move(1);if(event.key==="ArrowLeft")move(-1);if(event.key==="Tab"){const controls=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled])')??[]);if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}};addEventListener("keydown",key);return()=>{document.body.style.overflow=previous;removeEventListener("keydown",key);openerElement?.focus()}},[open,move]);
  return <section className="interactive-gallery">
    <button ref={opener} className="gallery-main" type="button" onPointerDown={startGesture} onPointerMove={trackGesture} onPointerUp={finishGesture} onPointerCancel={cancelGesture} onClick={event=>{if(ignoreClick.current){event.preventDefault();ignoreClick.current=false;return}setOpen(true)}} aria-label="Открыть фотографию на весь экран"><GalleryImage key={active} src={active} alt={`${title}, фотография ${index+1}`} width={1200} eager/><span>{index+1} / {images.length}</span></button>
    {images.length>1&&<><button className="gallery-inline-prev" type="button" onClick={()=>move(-1)} aria-label="Предыдущая фотография">‹</button><button className="gallery-inline-next" type="button" onClick={()=>move(1)} aria-label="Следующая фотография">›</button></>}
    {images.length>1&&<div className="gallery-thumbs">{images.map((photo,photoIndex)=><button type="button" className={photoIndex===index?"active":""} onClick={()=>setIndex(photoIndex)} key={`${photo}-${photoIndex}`} aria-label={`Показать фотографию ${photoIndex+1}`}><GalleryImage src={photo} alt="" width={320}/></button>)}</div>}
    {open&&<div ref={dialog} className="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Галерея объекта" onPointerDown={startGesture} onPointerMove={trackGesture} onPointerUp={finishGesture} onPointerCancel={cancelGesture}><button ref={closeButton} className="gallery-close" type="button" onClick={()=>setOpen(false)} aria-label="Закрыть">×</button>{images.length>1&&<button className="gallery-prev" type="button" onClick={()=>move(-1)} aria-label="Предыдущая фотография">←</button>}<GalleryImage key={active} src={active} alt={`${title}, фотография ${index+1}`} width={1600} eager/>{images.length>1&&<button className="gallery-next" type="button" onClick={()=>move(1)} aria-label="Следующая фотография">→</button>}<span>{index+1} из {images.length}</span></div>}
  </section>
}
