import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { products,productVariants } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { revalidateCatalog } from "@/lib/cache-invalidation";
export async function POST(_:Request,{params}:{params:Promise<{id:string}>}){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const db=getDb();const [source]=await db.select().from(products).where(eq(products.id,id)).limit(1);if(!source)return NextResponse.json({error:"Product not found"},{status:404});const variants=await db.select().from(productVariants).where(eq(productVariants.productId,id));const suffix=Date.now().toString().slice(-6);const created=await db.transaction(async tx=>{const [row]=await tx.insert(products).values({...source,id:undefined,name:`${source.name} (Copy)`,slug:`${source.slug}-copy-${suffix}`,sku:`${source.sku}-COPY-${suffix}`,status:"DRAFT",createdAt:undefined,updatedAt:undefined}).returning();if(variants.length)await tx.insert(productVariants).values(variants.map((variant,index)=>({...variant,id:undefined,productId:row.id,sku:`${variant.sku}-C${suffix}-${index}`,createdAt:undefined,updatedAt:undefined})));return row});revalidateCatalog();return NextResponse.json({product:created},{status:201})}
