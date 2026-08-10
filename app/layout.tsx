import type {Metadata,Viewport} from "next";import "./globals.css";
export const metadata:Metadata={metadataBase:new URL(process.env.SITE_URL||"http://localhost:3000"),title:"Династия — недвижимость в ПМР",description:"Купить, продать или снять недвижимость в Тирасполе, Бендерах и по всему Приднестровью.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export const viewport:Viewport={width:"device-width",initialScale:1,viewportFit:"cover"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
