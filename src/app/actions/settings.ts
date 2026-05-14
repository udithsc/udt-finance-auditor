"use server";

import { revalidatePath } from "next/cache";
import { getAppSettings, saveAppSettings } from "@/lib/app-settings";

export async function updateAppSettings(formData: FormData) {
  const baseCurrency = String(formData.get("baseCurrency") || "").trim().toUpperCase();
  const timezone = String(formData.get("timezone") || "").trim();
  const displayCurrencies = String(formData.get("displayCurrencies") || "")
    .split(",")
    .map((currency) => currency.trim().toUpperCase())
    .filter(Boolean);
  const categories = String(formData.get("categories") || "")
    .split("\n")
    .map((category) => category.trim())
    .filter(Boolean);

  if (!baseCurrency) {
    throw new Error("Base currency is required.");
  }

  const current = await getAppSettings();
  await saveAppSettings({
    baseCurrency,
    timezone: timezone || current.timezone,
    displayCurrencies: displayCurrencies.length > 0 ? displayCurrencies : current.displayCurrencies,
    categories: categories.length > 0 ? categories : current.categories,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/assets");
  revalidatePath("/debts");
  revalidatePath("/calculator");
  revalidatePath("/transactions");
}
