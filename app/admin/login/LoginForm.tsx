"use client";

import { FormEvent, useState } from "react";

export default function LoginForm(){
  const [status,setStatus]=useState(""),[loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setLoading(true);setStatus("");
    const form=new FormData(event.currentTarget),email=String(form.get("email")??"").trim(),password=String(form.get("password")??"");
    try{
      const response=await fetch("/api/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});
      const data=await response.json();
      if(!response.ok){setStatus(data.error||"Неверный email или пароль");return}
      location.href="/admin";
    }catch{setStatus("Не удалось войти. Попробуйте ещё раз.")}finally{setLoading(false)}
  }
  return <form className="admin-login-form" onSubmit={submit}><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Пароль<input name="password" type="password" required minLength={8} autoComplete="current-password"/></label><button disabled={loading}>{loading?"Входим…":"Войти в админ-панель"}</button>{status&&<p role="alert">{status}</p>}</form>;
}
