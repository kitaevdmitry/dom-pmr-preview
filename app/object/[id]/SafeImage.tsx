"use client";

import { useState } from "react";
import { imageUrl } from "../../property-data";

export default function SafeImage({src,alt,width=480}:{src:string;alt:string;width?:number}){
  const [fallback,setFallback]=useState(false);
  return <img src={fallback?"/tiraspol-dniester.jpg":imageUrl(src,width)} alt={alt} loading="lazy" decoding="async" onError={()=>setFallback(true)}/>;
}
