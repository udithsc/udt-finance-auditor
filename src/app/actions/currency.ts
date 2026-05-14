"use server";

import { getAppSettings } from "@/lib/app-settings";

export async function getExchangeRates(baseCurrency?: string, displayCurrencies?: string[]) {
  const settings = await getAppSettings();
  const base = (baseCurrency || settings.baseCurrency).toUpperCase();
  const currencies = displayCurrencies || settings.displayCurrencies;

  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!response.ok) throw new Error("Failed to load exchange rates");
    const data = await response.json();
    
    return {
      success: true,
      baseCurrency: base,
      rates: Object.fromEntries(
        Array.from(new Set([base, ...currencies])).map((currency) => [
          currency,
          currency === base ? 1 : Number(data.rates?.[currency] || 0),
        ])
      )
    };
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    return {
      success: false,
      baseCurrency: base,
      rates: { [base]: 1 }
    };
  }
}

export async function convertValue(value: number, rate: number) {
  return value * rate;
}
