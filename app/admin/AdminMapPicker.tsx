"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

export default function AdminMapPicker({lat,lng,onChange}:{lat:number;lng:number;onChange:(lat:number,lng:number)=>void}){
  const host=useRef<HTMLDivElement>(null),mapRef=useRef<LeafletMap|null>(null),markerRef=useRef<Marker|null>(null),changeRef=useRef(onChange),initialPosition=useRef({lat,lng});
  useEffect(()=>{changeRef.current=onChange},[onChange]);
  useEffect(()=>{let cancelled=false;const initial=initialPosition.current;void import("leaflet").then(L=>{if(cancelled||!host.current||mapRef.current)return;const map=L.map(host.current,{zoomControl:true}).setView([initial.lat||46.84,initial.lng||29.64],13);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap"}).addTo(map);const marker=L.marker([initial.lat||46.84,initial.lng||29.64],{draggable:true}).addTo(map);const update=()=>{const point=marker.getLatLng();changeRef.current(Number(point.lat.toFixed(6)),Number(point.lng.toFixed(6)))};marker.on("dragend",update);map.on("click",event=>{marker.setLatLng(event.latlng);update()});mapRef.current=map;markerRef.current=marker;requestAnimationFrame(()=>map.invalidateSize())});return()=>{cancelled=true;mapRef.current?.remove();mapRef.current=null}},[]);
  useEffect(()=>{const marker=markerRef.current,map=mapRef.current;if(!marker||!map||!Number.isFinite(lat)||!Number.isFinite(lng))return;marker.setLatLng([lat,lng]);map.panTo([lat,lng])},[lat,lng]);
  return <div><div ref={host} className="admin-map" aria-label="Выбор расположения объекта на карте"/><small className="admin-map-help">Нажмите на карту или перетащите маркер.</small></div>;
}
