"use server";

import { getExchangeRates } from "./currency";
import { getAppSettings } from "@/lib/app-settings";

export async function getCsePrice(symbol: string) {
  try {
    // CSE Public API (often usable without auth for single ticker details)
    // Symbol format: JKH.N0000, COMB.N0000, etc.
    const response = await fetch(`https://www.cse.lk/api/getCompanyDetails?symbol=${symbol}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) throw new Error("CSE API error");
    
    const data = await response.json();
    
    const priceLKR = parseFloat(data.last_traded_price || data.trade_price || "0");
    const settings = await getAppSettings();
    const rateResult = await getExchangeRates("LKR", [settings.baseCurrency]);
    const lkrToBaseRate = rateResult.rates[settings.baseCurrency] || 0;
    const price = priceLKR * lkrToBaseRate;

    return {
      success: true,
      price,
      priceLKR: priceLKR,
      companyName: data.name
    };
  } catch (error) {
    console.error("CSE price fetch error:", error);
    return { success: false, price: 0 };
  }
}
