import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2/upload";
import { deleteFromR2 } from "@/lib/r2/delete";
const fields=z.object({ownerType:z.enum(["BRANDING","PRODUCT","CATEGORY","COLLECTION"]),ownerId:z.string().uuid(),folder:z.enum(["branding","products","categories","collections"]),alt:z.string().max(240).optional()});
export async function POST(request:NextRequest){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});let upload:Awaited<ReturnType<typeof uploadToR2>>|null=null;try{const form=await request.formData();const parsed=fields.safeParse({ownerType:form.get("ownerType"),ownerId:form.get("ownerId"),folder:form.get("folder"),alt:form.get("alt")||undefined});if(!parsed.success)return NextResponse.json({error:"Invalid upload owner"},{status:400});const file=form.get("file");if(!(file instanceof File)||!file.size)return NextResponse.json({error:"Choose an image"},{status:400});upload=await uploadToR2(file,parsed.data.folder,parsed.data.ownerId);const [record]=await getDb().insert(assets).values({...upload,ownerType:parsed.data.ownerType,ownerId:parsed.data.ownerId,alt:parsed.data.alt,primary:false}).returning();return NextResponse.json({asset:record},{status:201})}catch(error){if(upload)await deleteFromR2(upload.storageKey).catch(()=>undefined);return NextResponse.json({error:error instanceof Error?error.message:"Upload failed"},{status:400})}}

