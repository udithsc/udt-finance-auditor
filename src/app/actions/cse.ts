"use server";

import { getExchangeRates } from "./currency";

export async function getCsePrice(symbol: string) {
  try {
    // CSE Public API (often usable without auth for single ticker details)
    // Symbol format: JKH.N0000, COMB.N0000, etc.
    const response = await fetch(`https://www.cse.lk/api/getCompanyDetails?symbol=${symbol}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!response.ok) throw new Error("CSE API error");
    
    const data = await response.json();
    
    // The API returns trade_price in LKR
    const priceLKR = parseFloat(data.last_traded_price || data.trade_price || "0");
    
    // Get LKR to MYR exchange rate
    const rateResult = await getExchangeRates();
    const lkrToMyrRate = rateResult.rates.LKR; // This is LKR per 1 MYR
    
    // Convert LKR to MYR: valueInMYR = priceLKR / ratePerMYR
    const priceMYR = priceLKR / lkrToMyrRate;

    return {
      success: true,
      price: priceMYR,
      priceLKR: priceLKR,
      companyName: data.name
    };
  } catch (error) {
    console.error("CSE price fetch error:", error);
    return { success: false, price: 0 };
  }
}
