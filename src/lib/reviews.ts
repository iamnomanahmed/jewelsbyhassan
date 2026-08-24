import { createHash, randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { customers, orders, reviewInvitations } from "@/db/schema";

export function hashReviewToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function createReviewToken() { const token=randomBytes(32).toString("base64url"); return {token,tokenHash:hashReviewToken(token)}; }
export async function getReviewInvitation(token:string){const tokenHash=hashReviewToken(token);const [record]=await getDb().select({invitation:reviewInvitations,order:orders,customer:customers}).from(reviewInvitations).innerJoin(orders,eq(orders.id,reviewInvitations.orderId)).innerJoin(customers,eq(customers.id,orders.customerId)).where(and(eq(reviewInvitations.tokenHash,tokenHash),isNull(reviewInvitations.revokedAt))).limit(1);if(!record||record.invitation.expiresAt<=new Date())return null;if(!record.invitation.openedAt)await getDb().update(reviewInvitations).set({openedAt:new Date()}).where(eq(reviewInvitations.id,record.invitation.id));return record;}
