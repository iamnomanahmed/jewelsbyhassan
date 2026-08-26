import { NextRequest,NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { getAdmin } from "@/lib/auth";
import { z } from "zod";
import { revalidateCatalog } from "@/lib/cache-invalidation";
const schema=z.object({ids:z.array(z.string().uuid()).min(1),action:z.enum(["archive","restore","publish","unpublish"])});
export async function POST(request:NextRequest){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Invalid bulk action"},{status:400});const status=parsed.data.action==="archive"?"ARCHIVED":parsed.data.action==="publish"?"PUBLISHED":"DRAFT";await getDb().update(products).set({status,archivedAt:status==="ARCHIVED"?new Date():null,updatedAt:new Date()}).where(inArray(products.id,parsed.data.ids));revalidateCatalog();return NextResponse.json({updated:parsed.data.ids.length})}
