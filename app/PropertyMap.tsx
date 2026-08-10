"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

export type MapProperty = { id:number; title:string; price:number; location:string; lat:number; lng:number };
type Props = { properties:MapProperty[]; selectedId?:number; onSelect:(id:number)=>void };

export default function PropertyMap({ properties, selectedId, onSelect }:Props) {
  const host=useRef<HTMLDivElement>(null),mapRef=useRef<LeafletMap|null>(null),markersRef=useRef<Marker[]>([]),selectRef=useRef(onSelect),fitKey=useRef("");
  const [mapReady,setMapReady]=useState(false);
  useEffect(()=>{selectRef.current=onSelect},[onSelect]);

  useEffect(()=>{
    let cancelled=false,observer:ResizeObserver|undefined,resizeFrame=0,lastWidth=0,lastHeight=0;
    void import("leaflet").then(L=>{
      if(cancelled||!host.current||mapRef.current)return;
      const map=L.map(host.current,{zoomControl:false,attributionControl:true,preferCanvas:true}).setView([47.13,29.32],8);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap",updateWhenIdle:true,keepBuffer:2}).addTo(map);
      L.control.zoom({position:"topright"}).addTo(map);
      mapRef.current=map;setMapReady(true);
      requestAnimationFrame(()=>map.invalidateSize({pan:false,animate:false}));
      observer=new ResizeObserver(entries=>{const box=entries[0]?.contentRect;if(!box||box.width===0||box.height===0||(box.width===lastWidth&&box.height===lastHeight))return;lastWidth=box.width;lastHeight=box.height;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(!cancelled)map.invalidateSize({pan:false,animate:false})})});observer.observe(host.current);
    });
    return()=>{cancelled=true;cancelAnimationFrame(resizeFrame);observer?.disconnect();mapRef.current?.remove();mapRef.current=null};
  },[]);

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
          const property=group[0],priceLabel=isGroup?`${group.length} объекта`:property.price>=10000?`${Math.round(property.price/1000)}k`:`${property.price}$`;
          const icon=L.divIcon({className:"estate-marker-wrap",html:`<div class="estate-marker${active?" active":""}${isGroup?" cluster":""}">${priceLabel}</div>`,iconSize:[isGroup?86:54,44],iconAnchor:[isGroup?43:27,39]});
          const marker=L.marker([lat,lng],{icon}).addTo(map);
          marker.bindTooltip(isGroup?`${group[0].location} · ${group.length} объекта`: `${property.location} · ${property.title}`,{direction:"top",offset:[0,-28]});
          marker.on("click",()=>{if(isGroup)map.flyTo([lat,lng],13,{duration:.45});else selectRef.current(property.id)});return marker;
        });
      };
      const nextKey=properties.map(p=>p.id).join(",");
      if(nextKey!==fitKey.current){fitKey.current=nextKey;requestAnimationFrame(()=>{map.invalidateSize(false);if(properties.length===1)map.flyTo([properties[0].lat,properties[0].lng],13,{duration:.5});else if(properties.length>1)map.fitBounds(L.latLngBounds(properties.map(p=>[p.lat,p.lng] as [number,number])).pad(.25),{maxZoom:11,animate:false});renderMarkers()})}else renderMarkers();
      map.on("zoomend",renderMarkers);removeZoomListener=()=>map.off("zoomend",renderMarkers);
    });
    return()=>{cancelled=true;removeZoomListener?.()};
  },[properties,selectedId,mapReady]);

  return <div ref={host} className="leaflet-host" aria-label="Интерактивная карта объектов недвижимости"/>;
}
