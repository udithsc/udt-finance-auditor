"use server";

export async function getExchangeRates() {
  try {
    // Fetching rates relative to MYR
    const response = await fetch("https://api.exchangerate-api.com/v4/latest/MYR", {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    const data = await response.json();
    
    return {
      success: true,
      rates: {
        MYR: 1,
        USD: data.rates.USD,
        LKR: data.rates.LKR
      }
    };
  } catch (error) {
    console.error("Exchange rate fetch error:", error);
    return {
      success: false,
      rates: {
        MYR: 1,
        USD: 0.21, // Probable fallback for 2026
        LKR: 65.00 // Probable fallback for 2026
      }
    };
  }
}

export async function convertValue(value: number, rate: number) {
  return value * rate;
}
