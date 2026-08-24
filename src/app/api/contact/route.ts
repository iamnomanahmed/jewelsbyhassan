import { NextRequest,NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { contactInquiries } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";
const schema=z.object({name:z.string().trim().min(2).max(160),email:z.string().email().max(255),phone:z.string().max(40).optional(),subject:z.string().trim().min(2).max(180),message:z.string().trim().min(10).max(3000)});
export async function POST(request:NextRequest){const ip=request.headers.get("x-forwarded-for")?.split(",")[0]??"unknown";if(!rateLimit(`contact:${ip}`,4,60_000).ok)return NextResponse.json({message:"Please wait before sending another message."},{status:429});const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({message:parsed.error.issues[0]?.message??"Check your message."},{status:400});try{await getDb().insert(contactInquiries).values(parsed.data);return NextResponse.json({message:"Thank you. Our team will be in touch soon."});}catch{return NextResponse.json({message:"We could not save your message. Please try again."},{status:500})}}

