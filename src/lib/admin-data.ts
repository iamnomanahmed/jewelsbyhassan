import { and,asc,count,desc,eq,sql } from "drizzle-orm";
import { getDb } from "@/db";
import { assets,categories,collections,customers,orderEvents,orderItems,orders,paymentProofs,products,productVariants,reviewInvitations,reviews } from "@/db/schema";
import { getR2ObjectUrl } from "@/lib/r2/url";
import { buildReviewUrl } from "@/lib/reviews";
export async function getDashboardStats(){const db=getDb();const [productStats,orderStats,customerStats,reviewStats,revenue]=await Promise.all([
db.select({total:count(),published:sql<number>`count(*) filter (where ${products.status}='PUBLISHED')::int`,outOfStock:sql<number>`count(*) filter (where ${products.stock}<=0)::int`}).from(products),
db.select({total:count(),pending:sql<number>`count(*) filter (where ${orders.status}='PENDING')::int`,confirmed:sql<number>`count(*) filter (where ${orders.status}='CONFIRMED')::int`,processing:sql<number>`count(*) filter (where ${orders.status}='PROCESSING')::int`,shipped:sql<number>`count(*) filter (where ${orders.status}='SHIPPED')::int`,completed:sql<number>`count(*) filter (where ${orders.status}='COMPLETED')::int`,cancelled:sql<number>`count(*) filter (where ${orders.status}='CANCELLED')::int`,cod:sql<number>`count(*) filter (where ${orders.paymentMethod}='COD')::int`,easypaisa:sql<number>`count(*) filter (where ${orders.paymentMethod}='EASYPAISA')::int`}).from(orders),
db.select({total:count()}).from(customers),db.select({total:count(),pending:sql<number>`count(*) filter (where ${reviews.status}='PENDING')::int`}).from(reviews),db.select({total:sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.status}='COMPLETED'),0)::int`}).from(orders)]);
return {products:productStats[0],orders:orderStats[0],customers:customerStats[0],reviews:reviewStats[0],revenue:revenue[0]?.total??0}}
export async function getRecentOrders(limit=8){return getDb().select({order:orders,customer:customers}).from(orders).innerJoin(customers,eq(customers.id,orders.customerId)).orderBy(desc(orders.createdAt)).limit(limit)}
export async function getAdminProducts(){return getDb().select({product:products,imageUrl:assets.url,categoryName:categories.name,collectionName:collections.name}).from(products).leftJoin(assets,and(eq(assets.ownerType,"PRODUCT"),eq(assets.ownerId,products.id),eq(assets.primary,true))).leftJoin(categories,eq(categories.id,products.categoryId)).leftJoin(collections,eq(collections.id,products.collectionId)).orderBy(desc(products.createdAt))}
export async function getAdminProduct(id:string){const db=getDb();const [product]=await db.select().from(products).where(eq(products.id,id)).limit(1);if(!product)return null;const [variants,images]=await Promise.all([db.select().from(productVariants).where(eq(productVariants.productId,id)),db.select().from(assets).where(and(eq(assets.ownerType,"PRODUCT"),eq(assets.ownerId,id))).orderBy(desc(assets.primary),assets.sortOrder)]);return {...product,variants,images}}
export async function getAdminOrders(){return getDb().select({order:orders,customer:customers,itemCount:sql<number>`(select coalesce(sum(quantity),0)::int from ${orderItems} where ${orderItems.orderId}=${orders.id})`}).from(orders).innerJoin(customers,eq(customers.id,orders.customerId)).orderBy(desc(orders.createdAt))}
export async function getAdminOrder(id:string){
  const db=getDb();
  const [row]=await db.select({order:orders,customer:customers}).from(orders).innerJoin(customers,eq(customers.id,orders.customerId)).where(eq(orders.id,id)).limit(1);
  if(!row)return null;
  const [items,proof,events,reviewRecord]=await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId,id)),
    db.select().from(paymentProofs).where(eq(paymentProofs.orderId,id)).limit(1),
    db.select().from(orderEvents).where(eq(orderEvents.orderId,id)).orderBy(asc(orderEvents.createdAt)),
    db.select({invitation:reviewInvitations,review:reviews}).from(reviewInvitations).leftJoin(reviews,eq(reviews.invitationId,reviewInvitations.id)).where(eq(reviewInvitations.orderId,id)).limit(1)
  ]);
  const secureProof=proof[0]?{...proof[0],url:await getR2ObjectUrl(proof[0].storageKey).catch(()=>null)}:null;
  const review=reviewRecord[0]??null;
  const reviewUrl=review?.invitation.token?buildReviewUrl(review.invitation.token):null;
  return {...row,items,proof:secureProof,events,review,reviewUrl};
}
