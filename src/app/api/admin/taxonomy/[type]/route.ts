import { NextRequest,NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { categories,collections } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { revalidateCatalog } from "@/lib/cache-invalidation";
const schema=z.object({id:z.string().uuid().optional(),name:z.string().trim().min(2).max(120),slug:z.string().optional(),description:z.string().max(1000).optional(),featured:z.boolean().default(false)});
export async function POST(request:NextRequest,{params}:{params:Promise<{type:string}>}){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {type}=await params;if(!["categories","collections"].includes(type))return NextResponse.json({error:"Not found"},{status:404});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message},{status:400});const table=type==="categories"?categories:collections;const values={name:parsed.data.name,slug:slugify(parsed.data.slug||parsed.data.name),description:parsed.data.description||null,featured:parsed.data.featured};try{const [row]=parsed.data.id?await getDb().update(table).set({...values,updatedAt:new Date()}).where(eq(table.id,parsed.data.id)).returning():await getDb().insert(table).values(values).returning();revalidateCatalog();return NextResponse.json({row})}catch{return NextResponse.json({error:"Name or slug already exists."},{status:400})}}
export async function DELETE(request:NextRequest,{params}:{params:Promise<{type:string}>}){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {type}=await params;const id=new URL(request.url).searchParams.get("id");if(!id)return NextResponse.json({error:"ID required"},{status:400});const table=type==="categories"?categories:type==="collections"?collections:null;if(!table)return NextResponse.json({error:"Not found"},{status:404});await getDb().delete(table).where(eq(table.id,id));revalidateCatalog();return NextResponse.json({deleted:true})}
