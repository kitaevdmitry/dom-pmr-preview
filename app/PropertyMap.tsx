"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

export type MapProperty = { id:number; title:string; price:number; location:string; lat:number; lng:number };
type Props = { properties:MapProperty[]; selectedId?:number; onSelect:(id:number)=>void };
function compactPrice(value:number){if(value<1000)return `${value}$`;const thousands=value/1000;return `${new Intl.NumberFormat("ru-RU",{maximumFractionDigits:1}).format(thousands)}k`}
function objectsLabel(count:number){const mod100=count%100,mod10=count%10;return `${count} ${mod100>=11&&mod100<=14?"объектов":mod10===1?"объект":mod10>=2&&mod10<=4?"объекта":"объектов"}`}

export default function PropertyMap({ properties, selectedId, onSelect, focusLocation }: Props & {focusLocation?:string}) {
  const host=useRef<HTMLDivElement>(null),mapRef=useRef<LeafletMap|null>(null),markersRef=useRef<Marker[]>([]),selectRef=useRef(onSelect),fitKey=useRef("");
  const [mapReady,setMapReady]=useState(false),[mapStatus,setMapStatus]=useState<"loading"|"ready"|"error">("loading"),[attempt,setAttempt]=useState(0);
  useEffect(()=>{selectRef.current=onSelect},[onSelect]);
  useEffect(()=>{if(!mapReady||mapStatus!=="loading")return;const timer=setTimeout(()=>setMapStatus("error"),6500);return()=>clearTimeout(timer)},[mapReady,mapStatus]);

  useEffect(()=>{
    let cancelled=false,observer:ResizeObserver|undefined,resizeFrame=0,lastWidth=0,lastHeight=0,tileErrors=0;
    void import("leaflet").then(L=>{
      if(cancelled||!host.current||mapRef.current)return;
      const map=L.map(host.current,{zoomControl:false,attributionControl:true,preferCanvas:true}).setView([47.13,29.32],8);
      const tiles=L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap",updateWhenIdle:true,keepBuffer:2});
      tiles.once("load",()=>{if(!cancelled)setMapStatus("ready")});
      tiles.on("tileerror",()=>{tileErrors+=1;if(tileErrors>=4&&!cancelled)setMapStatus("error")});
      tiles.addTo(map);
      L.control.zoom({position:"topright"}).addTo(map);
      mapRef.current=map;setMapReady(true);
      requestAnimationFrame(()=>map.invalidateSize({pan:false,animate:false}));
      observer=new ResizeObserver(entries=>{const box=entries[0]?.contentRect;if(!box||box.width===0||box.height===0||(box.width===lastWidth&&box.height===lastHeight))return;lastWidth=box.width;lastHeight=box.height;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(!cancelled)map.invalidateSize({pan:false,animate:false})})});observer.observe(host.current);
    }).catch(()=>{if(!cancelled)setMapStatus("error")});
    return()=>{cancelled=true;cancelAnimationFrame(resizeFrame);observer?.disconnect();mapRef.current?.remove();mapRef.current=null};
  },[attempt]);

  useEffect(()=>{
    let cancelled=false,removeZoomListener:(()=>void)|undefined;
    void import("leaflet").then(L=>{
      const map=mapRef.current;if(cancelled||!map)return;
      const renderMarkers=()=>{
        markersRef.current.forEach(marker=>marker.remove());
        const groups=map.getZoom()<=11
          ? Array.from(properties.reduce((result,property)=>{const current=result.get(property.location)??[];current.push(property);result.set(property.location,current);return result},new Map<string,MapProperty[]>()).values())
          : properties.map(property=>[property]);
        markersRef.current=groups.map(group=>{
          const lat=group.reduce((sum,property)=>sum+property.lat,0)/group.length,lng=group.reduce((sum,property)=>sum+property.lng,0)/group.length;
          const isGroup=group.length>1,active=group.some(property=>selectedId===property.id);
          const property=group[0],valueLabel=isGroup?objectsLabel(group.length):compactPrice(property.price),priceLabel=focusLocation?valueLabel:`${property.location} · ${valueLabel}`,iconWidth=focusLocation?(isGroup?92:62):Math.min(156,Math.max(100,priceLabel.length*7+22));
          const icon=L.divIcon({className:"estate-marker-wrap",html:`<div class="estate-marker${active?" active":""}${isGroup?" cluster":""}">${priceLabel}</div>`,iconSize:[iconWidth,44],iconAnchor:[iconWidth/2,39]});
          const marker=L.marker([lat,lng],{icon}).addTo(map);
          const label=isGroup?`${group[0].location}: ${group.length} объекта`: `${property.location}: ${property.title}, ${property.price} долларов`;
          marker.bindTooltip(isGroup?`${group[0].location} · ${group.length} объекта`: `${property.location} · ${property.title}`,{direction:"top",offset:[0,-28]});
          const activate=()=>{if(isGroup)map.flyTo([lat,lng],13,{duration:.45});else selectRef.current(property.id)};
          marker.on("click",activate);requestAnimationFrame(()=>{const element=marker.getElement();if(!element)return;element.setAttribute("role","button");element.setAttribute("tabindex","0");element.setAttribute("aria-label",label);element.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();activate()}})});return marker;
        });
      };
      const nextKey=`${focusLocation??"all"}:${properties.map(p=>p.id).join(",")}`;
      if(nextKey!==fitKey.current){fitKey.current=nextKey;requestAnimationFrame(()=>{map.invalidateSize(false);requestAnimationFrame(()=>{if(properties.length===1)map.flyTo([properties[0].lat,properties[0].lng],14,{duration:.5});else if(properties.length>1&&focusLocation){const lat=properties.reduce((sum,p)=>sum+p.lat,0)/properties.length,lng=properties.reduce((sum,p)=>sum+p.lng,0)/properties.length;map.setView([lat,lng],13,{animate:false})}else if(properties.length>1){const bounds=L.latLngBounds(properties.map(p=>[p.lat,p.lng] as [number,number])),latitudes=properties.map(p=>p.lat),longitudes=properties.map(p=>p.lng),span=Math.max(Math.max(...latitudes)-Math.min(...latitudes),Math.max(...longitudes)-Math.min(...longitudes));map.fitBounds(bounds,{padding:[44,44],maxZoom:11,animate:false});if(span<.5&&map.getZoom()<9)map.setZoom(9,{animate:false})}renderMarkers()})})}else renderMarkers();
      map.on("zoomend",renderMarkers);removeZoomListener=()=>map.off("zoomend",renderMarkers);
    });
    return()=>{cancelled=true;removeZoomListener?.()};
  },[properties,selectedId,mapReady,focusLocation]);

  return <div className="map-canvas">
    <div ref={host} className="leaflet-host" role="region" aria-label="Интерактивная карта объектов недвижимости"/>
    <div className={`map-loading ${mapStatus}`} role="status" aria-live="polite">{mapStatus==="error"?<><b>Карта временно недоступна</b><small>Объекты остаются доступны в режиме списка.</small><button type="button" onClick={()=>{setMapStatus("loading");setMapReady(false);setAttempt(value=>value+1)}}>Повторить</button></>:<><span/>Загружаем карту…</>}</div>
  </div>;
}
