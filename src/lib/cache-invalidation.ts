import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

export const CACHE_TAGS = {
  catalog: "storefront-catalog",
  taxonomy: "storefront-taxonomy",
  reviews: "storefront-reviews",
  settings: "storefront-settings"
} as const;

function expire(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

export function revalidateCatalog() {
  expire(CACHE_TAGS.catalog);
  expire(CACHE_TAGS.taxonomy);
}

export function revalidateReviews() {
  expire(CACHE_TAGS.reviews);
}

export function revalidateSettings() {
  expire(CACHE_TAGS.settings);
  revalidatePath("/", "layout");
}
