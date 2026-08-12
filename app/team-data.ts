export type AgentId = "diana" | "oksana" | "yana" | "alena" | "natalia" | "zinaida";

export type Agent = {
  id: AgentId; initials: string; name: string; role: string; phone: string; tel: string;
  whatsapp: string; areas: string; services: string[]; image: string;
  crop: string; primary?: boolean;
};

export const team: Agent[] = [
  {id:"diana",initials:"МД",name:"Меньшая Диана",role:"Главный агент",phone:"0 (777) 88-308",tel:"+37377788308",whatsapp:"37377788308",areas:"Тирасполь, Бендеры, Слободзейский район, Парканы и Суклея",services:["Покупка и продажа","Аренда","Ипотека","Полное сопровождение сделки"],image:"/team-diana.jpg",crop:"crop-diana",primary:true},
  {id:"oksana",initials:"ОГ",name:"Оксана Граненко",role:"Агент недвижимости",phone:"0 (778) 35-652",tel:"+37377835652",whatsapp:"37377835652",areas:"Незавертайловка, Днестровск и Слободзейский район",services:["Покупка и продажа","Аренда","Ипотека","Сопровождение сделки"],image:"/team-oksana.jpg",crop:"crop-oksana"},
  {id:"yana",initials:"ЯТ",name:"Яна Трощинская",role:"Агент недвижимости",phone:"0 (777) 17-351",tel:"+37377717351",whatsapp:"37377717351",areas:"Тирасполь, Суклея, Ближний Хутор и Парканы",services:["Покупка и продажа","Аренда","Ипотека","Оформление документов"],image:"/team-yana.jpg",crop:"crop-yana"},
  {id:"alena",initials:"ОА",name:"Островская Алёна",role:"Агент по Тирасполю",phone:"0 (777) 96-501",tel:"+37377796501",whatsapp:"37377796501",areas:"Тирасполь",services:["Покупка и продажа","Ипотека","Оформление документов"],image:"/team-alena.jpg",crop:"crop-alena"},
  {id:"natalia",initials:"НЖ",name:"Наталья Журавель",role:"Агент по Тирасполю",phone:"0 (778) 10-038",tel:"+37377810038",whatsapp:"37377810038",areas:"Тирасполь",services:["Покупка и продажа","Аренда","Ипотека","Оформление документов"],image:"/team-natalia.jpg",crop:"crop-natalia"},
  {id:"zinaida",initials:"ЗС",name:"Зинаида Сибагатова",role:"Агент по Бендерам",phone:"0 (778) 55-701",tel:"+37377855701",whatsapp:"37377855701",areas:"Бендеры",services:["Покупка и продажа","Ипотека","Оформление документов"],image:"/team-zinaida.jpg",crop:"crop-zinaida"},
];

export const mainAgent=team[0];
export const agentOptions=team.map(({id,name,role})=>({id,name,role}));
export function getAgent(id?:string|null){return team.find(agent=>agent.id===id)??mainAgent}
export function agentWhatsapp(agent:Agent,message:string){return `https://wa.me/${agent.whatsapp}?text=${encodeURIComponent(message)}`}
