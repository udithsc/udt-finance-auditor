"use server";

import { getExchangeRates } from "./currency";
import { getAppSettings } from "@/lib/app-settings";

export async function getLiveGoldPrice() {
  try {
    const response = await fetch("https://api.gold-api.com/price/XAU", { next: { revalidate: 3600 } });
    if (!response.ok) throw new Error("Failed to load gold price");
    const data = await response.json();
    
    // Price from API is USD/ounce
    const pricePerOunceUSD = data.price;
    const gramsPerOunce = 31.1035;
    const pricePerGramUSD = pricePerOunceUSD / gramsPerOunce;
    
    const settings = await getAppSettings();
    const rateResult = await getExchangeRates("USD", [settings.baseCurrency]);
    const usdToBase = rateResult.rates[settings.baseCurrency] || 1;
    const pricePerGram = pricePerGramUSD * usdToBase;
    
    return {
      success: true,
      price: pricePerGram,
      updatedAt: data.updatedAtReadable
    };
  } catch (error) {
    console.error("Gold price fetch error:", error);
    return { success: false, price: 0 };
  }
}
