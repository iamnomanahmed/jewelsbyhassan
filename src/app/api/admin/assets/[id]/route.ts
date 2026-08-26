import { NextRequest,NextResponse } from "next/server";
import { and,eq } from "drizzle-orm";
import { getDb } from "@/db";
import { assets } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { deleteFromR2 } from "@/lib/r2/delete";
import { revalidateCatalog } from "@/lib/cache-invalidation";
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const body=await request.json();const db=getDb();const [asset]=await db.select().from(assets).where(eq(assets.id,id)).limit(1);if(!asset)return NextResponse.json({error:"Image not found"},{status:404});await db.transaction(async tx=>{if(body.primary){await tx.update(assets).set({primary:false}).where(and(eq(assets.ownerType,asset.ownerType),eq(assets.ownerId,asset.ownerId)));await tx.update(assets).set({primary:true}).where(eq(assets.id,id))}else await tx.update(assets).set({sortOrder:Number(body.sortOrder)||0,alt:typeof body.alt==="string"?body.alt:asset.alt}).where(eq(assets.id,id))});revalidateCatalog();return NextResponse.json({ok:true})}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const db=getDb();const [asset]=await db.select().from(assets).where(eq(assets.id,id)).limit(1);if(!asset)return NextResponse.json({error:"Image not found"},{status:404});await deleteFromR2(asset.storageKey);await db.delete(assets).where(eq(assets.id,id));revalidateCatalog();return NextResponse.json({deleted:true})}
