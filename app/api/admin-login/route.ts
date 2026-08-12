import { NextResponse } from "next/server";
import { TEST_COOKIE, isAdminEmail } from "../../admin-auth";

const TEST_PASSWORDS:Record<string,string>={
  "polupoker@gmail.com":"Dynastia-Test-26!Q8m4",
  "troshinskayaa@gmail.com":"Dynastia-Test-26!V7n9",
};

export async function POST(request:Request){
  try{
    const body=await request.json() as {email?:string,password?:string};
    const email=String(body.email??"").trim().toLowerCase(),password=String(body.password??"");
    if(!isAdminEmail(email)||TEST_PASSWORDS[email]!==password)return Response.json({error:"Неверный email или пароль"},{status:401});
    const response=NextResponse.json({ok:true});
    response.cookies.set(TEST_COOKIE,email,{httpOnly:true,sameSite:"lax",secure:true,path:"/",maxAge:60*60*12});
    return response;
  }catch{return Response.json({error:"Не удалось войти"},{status:400})}
}
