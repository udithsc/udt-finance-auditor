"use server";

export async function getLiveCryptoPrice(symbol: string) {
  try {
    // Mapping symbols to CoinGecko IDs
    const coinMap: Record<string, string> = {
      "BTC": "bitcoin",
      "ETH": "ethereum",
      "USDT": "tether",
      "XRP": "ripple",
      "BNB": "binancecoin",
      "USDC": "usd-coin",
      "SOL": "solana",
      "TRX": "tron",
      "DOGE": "dogecoin",
      "WBT": "whitebit",
      "LEO": "leo-token",
      "ADA": "cardano",
      "BCH": "bitcoin-cash",
      "LINK": "chainlink",
      "XMR": "monero",
      "XLM": "stellar",
      "ZEC": "zcash",
      "DAI": "dai",
      "LTC": "litecoin",
      "PYUSD": "paypal-usd",
      "AVAX": "avalanche-2",
      "HBAR": "hedera-hashgraph",
      "SUI": "sui",
      "SHIB": "shiba-inu",
      "TON": "the-open-network",
      "CRO": "crypto-com-chain",
      "XAUT": "tether-gold",
      "TAO": "bittensor",
      "PAXG": "pax-gold",
      "USDG": "global-dollar",
      "MNT": "mantle",
      "DOT": "polkadot",
      "UNI": "uniswap",
      "NEAR": "near",
      "SKY": "sky",
      "OKB": "okb",
      "PI": "pi-network",
      "AAVE": "aave",
      "HTX": "htx-dao",
      "PEPE": "pepe",
      "USDD": "usdd",
      "RLUSD": "ripple-usd",
      "ICP": "internet-computer",
      "ETC": "ethereum-classic",
      "USDY": "ondo-us-dollar-yield",
      "BGB": "bitget-token",
      "ONDO": "ondo-finance",
      "KCS": "kucoin-shares",
      "GT": "gatechain-token",
      "PUMP": "pump-fun",
      "QNT": "quant",
      "ENA": "ethena",
      "MORPHO": "morpho",
      "ALGO": "algorand",
      "POL": "polygon-ecosystem-token",
      "RENDER": "render-token",
      "KAS": "kaspa",
      "WLD": "worldcoin-wld",
      "ATOM": "cosmos",
      "NEXO": "nexo",
      "ARB": "arbitrum",
      "APT": "aptos",
      "BCAP": "blockchain-capital",
      "FIL": "filecoin",
      "FLR": "flare-networks",
      "TRUMP": "official-trump",
      "DEXE": "dexe",
      "JUP": "jupiter-exchange-solana",
      "BDX": "beldex",
      "VET": "vechain",
      "JST": "just",
      "XDC": "xdce-crowd-sale",
      "OUSG": "ousg",
      "GHO": "gho",
      "USD0": "usual-usd",
    };

    const coinId = coinMap[symbol.toUpperCase()] || "bitcoin";
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=myr`, {
      next: { revalidate: 60 } // Cache for 1 minute
    });
    
    if (!response.ok) throw new Error("API limit reached or network error");
    
    const data = await response.json();
    const price = data[coinId].myr;
    
    return {
      success: true,
      price: price
    };
  } catch (error) {
    console.error("Crypto price fetch error:", error);
    return { success: false, price: 0 };
  }
}
