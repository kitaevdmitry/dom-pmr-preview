"use client";

import { useRouter } from "next/navigation";

export default function CatalogBackLink(){
  const router=useRouter();
  return <button className="catalog-back" type="button" onClick={()=>{if(history.length>1)router.back();else router.push("/#catalog")}}>← К каталогу</button>;
}
