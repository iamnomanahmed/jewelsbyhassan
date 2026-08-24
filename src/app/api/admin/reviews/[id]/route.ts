import { NextRequest,NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { reviews } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
const schema=z.object({status:z.enum(["PENDING","APPROVED","REJECTED","HIDDEN"]).optional(),featured:z.boolean().optional()}).refine(value=>value.status!==undefined||value.featured!==undefined);
export async function PATCH(request:NextRequest,{params}:{params:Promise<{id:string}>}){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid review update"},{status:400});const [review]=await getDb().update(reviews).set({...parsed.data,updatedAt:new Date()}).where(eq(reviews.id,id)).returning();if(!review)return NextResponse.json({error:"Review not found"},{status:404});return NextResponse.json({review})}

