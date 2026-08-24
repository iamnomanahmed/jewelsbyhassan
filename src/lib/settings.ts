import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { storeSettings, type StoreSettingsShape } from "@/db/schema";
import { DEFAULT_SETTINGS } from "./constants";

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

export async function getSettings(): Promise<StoreSettingsShape> {
  try {
    const [record] = await getDb().select().from(storeSettings).where(eq(storeSettings.id, "main")).limit(1);
    return mergeSettings(record?.data);
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

