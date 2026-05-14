import { prisma } from "@/lib/prisma";

export type AppSettings = {
  baseCurrency: string;
  displayCurrencies: string[];
  timezone: string;
  categories: string[];
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  baseCurrency: process.env.DEFAULT_BASE_CURRENCY || "MYR",
  displayCurrencies: (process.env.DEFAULT_DISPLAY_CURRENCIES || "MYR,USD,LKR")
    .split(",")
    .map((currency) => currency.trim().toUpperCase())
    .filter(Boolean),
  timezone: process.env.DEFAULT_TIMEZONE || "Asia/Kuala_Lumpur",
  categories: (process.env.DEFAULT_TRANSACTION_CATEGORIES || "Salary,Food & Dining,Transport,Subscriptions,Rent,Health,Investments,Internal Transfer")
    .split(",")
    .map((category) => category.trim())
    .filter(Boolean),
};

function normalizeSettings(value: unknown): AppSettings {
  const settings = typeof value === "object" && value !== null ? value as Partial<AppSettings> : {};
  const baseCurrency = (settings.baseCurrency || DEFAULT_APP_SETTINGS.baseCurrency).toUpperCase();
  const displayCurrencies = Array.isArray(settings.displayCurrencies)
    ? settings.displayCurrencies.map((currency) => String(currency).trim().toUpperCase()).filter(Boolean)
    : DEFAULT_APP_SETTINGS.displayCurrencies;

  return {
    baseCurrency,
    displayCurrencies: Array.from(new Set([baseCurrency, ...displayCurrencies])),
    timezone: settings.timezone || DEFAULT_APP_SETTINGS.timezone,
    categories: Array.isArray(settings.categories) && settings.categories.length > 0
      ? settings.categories.map(String)
      : DEFAULT_APP_SETTINGS.categories,
  };
}

export async function getAppSettings() {
  const record = await prisma.appSetting.findUnique({
    where: { key: "workspace" },
  });

  if (record) return normalizeSettings(record.value);

  return saveAppSettings(DEFAULT_APP_SETTINGS);
}

export async function saveAppSettings(settings: AppSettings) {
  const normalized = normalizeSettings(settings);
  await prisma.appSetting.upsert({
    where: { key: "workspace" },
    update: { value: normalized },
    create: { key: "workspace", value: normalized },
  });

  return normalized;
}
