import type {Metadata,Viewport} from "next";import "./globals.css";
import AnalyticsTracker from "./AnalyticsTracker";
import { requestOrigin } from "./site-url";

export async function generateMetadata():Promise<Metadata>{
  const origin=await requestOrigin(),title="Династия — недвижимость в ПМР",description="Купить, продать или снять недвижимость в Тирасполе, Бендерах и по всему Приднестровью.";
  return {metadataBase:new URL(origin),title,description,alternates:{canonical:origin},icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"},openGraph:{title,description,url:origin,siteName:"Династия — недвижимость в ПМР",locale:"ru_RU",type:"website",images:[{url:"/tiraspol-dniester.jpg",alt:"Тирасполь и набережная Днестра"}]},twitter:{card:"summary_large_image",title,description,images:["/tiraspol-dniester.jpg"]},robots:{index:true,follow:true}};
}
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover"};
export default async function RootLayout({children}:{children:React.ReactNode}){const origin=await requestOrigin(),structured={"@context":"https://schema.org","@type":"RealEstateAgent",name:"Династия",url:origin,image:`${origin}/tiraspol-dniester.jpg`,telephone:"+37377788308",address:{"@type":"PostalAddress",streetAddress:"ул. Юности, 15/2",addressLocality:"Тирасполь",addressCountry:"MD"},areaServed:["Тирасполь","Бендеры","Приднестровье"],sameAs:["https://www.instagram.com/dinastya_nedvijimost"]};return <html lang="ru"><body><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structured)}}/><AnalyticsTracker/>{children}</body></html>}
