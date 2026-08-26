import { createHash, randomBytes } from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { customers, orders, reviewInvitations } from "@/db/schema";

export function hashReviewToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export function createReviewToken() { const token=randomBytes(32).toString("base64url"); return {token,tokenHash:hashReviewToken(token)}; }
export function buildReviewUrl(token: string) { return `${(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "")}/review/${token}`; }

export async function ensureReviewInvitation(orderId: string, expiryDays: number) {
  const db = getDb();
  const [existing] = await db.select().from(reviewInvitations).where(eq(reviewInvitations.orderId, orderId)).limit(1);
  if (existing?.token) return { invitation: existing, reviewUrl: buildReviewUrl(existing.token) };

  const { token, tokenHash } = createReviewToken();
  const expiresAt = new Date(Date.now() + expiryDays * 86_400_000);
  if (existing) {
    const [claimed] = await db.update(reviewInvitations).set({ token, tokenHash, expiresAt, revokedAt: null })
      .where(and(eq(reviewInvitations.id, existing.id), isNull(reviewInvitations.token))).returning();
    if (claimed) return { invitation: claimed, reviewUrl: buildReviewUrl(token) };
    const [winner] = await db.select().from(reviewInvitations).where(eq(reviewInvitations.id, existing.id)).limit(1);
    if (winner?.token) return { invitation: winner, reviewUrl: buildReviewUrl(winner.token) };
  }

  const [inserted] = await db.insert(reviewInvitations).values({ orderId, token, tokenHash, expiresAt })
    .onConflictDoNothing({ target: reviewInvitations.orderId }).returning();
  if (inserted) return { invitation: inserted, reviewUrl: buildReviewUrl(token) };

  const [winner] = await db.select().from(reviewInvitations).where(eq(reviewInvitations.orderId, orderId)).limit(1);
  if (!winner?.token) return ensureReviewInvitation(orderId, expiryDays);
  return { invitation: winner, reviewUrl: buildReviewUrl(winner.token) };
}
export async function getReviewInvitation(token:string){const tokenHash=hashReviewToken(token);const [record]=await getDb().select({invitation:reviewInvitations,order:orders,customer:customers}).from(reviewInvitations).innerJoin(orders,eq(orders.id,reviewInvitations.orderId)).innerJoin(customers,eq(customers.id,orders.customerId)).where(and(eq(reviewInvitations.tokenHash,tokenHash),isNull(reviewInvitations.revokedAt))).limit(1);if(!record||record.invitation.expiresAt<=new Date())return null;if(!record.invitation.openedAt)await getDb().update(reviewInvitations).set({openedAt:new Date()}).where(eq(reviewInvitations.id,record.invitation.id));return record;}
