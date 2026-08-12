"use client";

export default function CatalogBackLink(){
  const returnToCatalog=()=>{
    let destination="/#catalog";
    try{destination=sessionStorage.getItem("dinastiya-catalog-return")||destination}catch{}
    location.assign(destination);
  };
  return <button className="catalog-back" type="button" onClick={returnToCatalog}>← К каталогу</button>;
}
