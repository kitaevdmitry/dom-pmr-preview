import { getAdminUser } from "../../admin-auth";
import { createAdminClient } from "../../../lib/supabase/admin";

const safeName=(name:string)=>name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-").slice(-80)||"photo.jpg";

export async function POST(request:Request){
  if(!(await getAdminUser()))return Response.json({error:"Нет доступа"},{status:403});
  try{
    const data=await request.formData(),files=data.getAll("photos").filter((entry):entry is File=>entry instanceof File);
    if(!files.length)return Response.json({error:"Выберите фотографии"},{status:400});
    if(files.length>12)return Response.json({error:"Можно загрузить не более 12 фотографий за раз"},{status:400});
    const client=createAdminClient(),urls:string[]=[];
    for(const file of files){
      if(!file.type.startsWith("image/"))return Response.json({error:"Допустимы только изображения"},{status:400});
      if(file.size>6*1024*1024)return Response.json({error:"Размер одной фотографии — не более 6 МБ"},{status:400});
      const key=`properties/${crypto.randomUUID()}-${safeName(file.name)}`;
      const {error}=await client.storage.from("property-images").upload(key,await file.arrayBuffer(),{contentType:file.type,cacheControl:"31536000",upsert:false});
      if(error)throw error;
      const {data:publicData}=client.storage.from("property-images").getPublicUrl(key);urls.push(publicData.publicUrl);
    }
    return Response.json({urls},{status:201});
  }catch{return Response.json({error:"Не удалось загрузить фотографии"},{status:500})}
}
