"use server";

export async function getLiveGoldPrice() {
  try {
    const response = await fetch("https://api.gold-api.com/price/XAU", { next: { revalidate: 3600 } });
    const data = await response.json();
    
    // Price from API is USD/ounce
    const pricePerOunceUSD = data.price;
    const gramsPerOunce = 31.1035;
    const pricePerGramUSD = pricePerOunceUSD / gramsPerOunce;
    
    // Get USD to MYR exchange rate (using a fallback or other API)
    // For now, using a fixed rate of 4.7 (approximate for April 2026)
    const usdToMyr = 4.75; 
    const pricePerGramMYR = pricePerGramUSD * usdToMyr;
    
    return {
      success: true,
      price: pricePerGramMYR,
      updatedAt: data.updatedAtReadable
    };
  } catch (error) {
    console.error("Gold price fetch error:", error);
    return { success: false, price: 620.00 }; // Fallback
  }
}
