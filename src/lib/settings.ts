import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/db";
import { storeSettings, type StoreSettingsShape } from "@/db/schema";
import { DEFAULT_SETTINGS } from "./constants";
import { CACHE_TAGS } from "./cache-invalidation";

function mergeSettings(data?: Partial<StoreSettingsShape> | null): StoreSettingsShape {
  if (!data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    colors: { ...DEFAULT_SETTINGS.colors, ...data.colors },
    whatsapp: { ...DEFAULT_SETTINGS.whatsapp, ...data.whatsapp },
    easypaisa: { ...DEFAULT_SETTINGS.easypaisa, ...data.easypaisa },
    delivery: { ...DEFAULT_SETTINGS.delivery, ...data.delivery },
    reviews: { ...DEFAULT_SETTINGS.reviews, ...data.reviews },
    social: { ...DEFAULT_SETTINGS.social, ...data.social }
  };
}

const getStoredSettings = unstable_cache(async () => {
  const [record] = await getDb().select({ data: storeSettings.data }).from(storeSettings).where(eq(storeSettings.id, "main")).limit(1);
  return mergeSettings(record?.data);
}, ["store-settings-v1"], { tags: [CACHE_TAGS.settings], revalidate: 60 * 60 });

let buildSettings: Promise<StoreSettingsShape> | undefined;

export async function getSettings(): Promise<StoreSettingsShape> {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    buildSettings ??= getStoredSettings().catch(() => DEFAULT_SETTINGS);
    return buildSettings;
  }
  try {
    return await getStoredSettings();
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(data: StoreSettingsShape) {
  await getDb()
    .insert(storeSettings)
    .values({ id: "main", data })
    .onConflictDoUpdate({ target: storeSettings.id, set: { data, updatedAt: new Date() } });
}
