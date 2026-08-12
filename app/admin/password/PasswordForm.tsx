"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function PasswordForm(){
  const [status,setStatus]=useState(""),[loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget),password=String(form.get("password")??""),repeat=String(form.get("repeat")??"");if(password.length<12){setStatus("Пароль должен содержать не менее 12 символов");return}if(password!==repeat){setStatus("Пароли не совпадают");return}setLoading(true);const {error}=await createClient().auth.updateUser({password});setLoading(false);setStatus(error?"Не удалось изменить пароль":"Пароль успешно изменён")}
  return <form className="admin-login-form" onSubmit={submit}><label>Новый пароль<input name="password" type="password" required minLength={12} autoComplete="new-password"/></label><label>Повторите пароль<input name="repeat" type="password" required minLength={12} autoComplete="new-password"/></label><button disabled={loading}>{loading?"Сохраняем…":"Изменить пароль"}</button>{status&&<p role="status">{status}</p>}</form>;
}
