"use client";

import { useState, useEffect } from "react";
import { addAsset } from "@/app/actions/assets";
import { getLiveGoldPrice } from "@/app/actions/gold";
import { getLiveCryptoPrice } from "@/app/actions/crypto";
import { getCsePrice } from "@/app/actions/cse";
import { Dialog } from "@/components/ui/dialog";
import { Plus, Coins, Loader2, Cpu, Search, Calendar, DollarSign, Globe, TrendingUp, ArrowRightLeft } from "lucide-react";
import clsx from "clsx";

const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "ripple", symbol: "XRP", name: "XRP" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "usd-coin", symbol: "USDC", name: "USDC" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "tron", symbol: "TRX", name: "TRON" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  { id: "whitebit", symbol: "WBT", name: "WhiteBIT Coin" },
  { id: "leo-token", symbol: "LEO", name: "LEO Token" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "bitcoin-cash", symbol: "BCH", name: "Bitcoin Cash" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "monero", symbol: "XMR", name: "Monero" },
  { id: "stellar", symbol: "XLM", name: "Stellar" },
  { id: "zcash", symbol: "ZEC", name: "Zcash" },
  { id: "dai", symbol: "DAI", name: "Dai" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "paypal-usd", symbol: "PYUSD", name: "PayPal USD" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "hedera-hashgraph", symbol: "HBAR", name: "Hedera" },
  { id: "sui", symbol: "SUI", name: "Sui" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu" },
  { id: "the-open-network", symbol: "TON", name: "Toncoin" },
  { id: "crypto-com-chain", symbol: "CRO", name: "Cronos" },
  { id: "tether-gold", symbol: "XAUT", name: "Tether Gold" },
  { id: "bittensor", symbol: "TAO", name: "Bittensor" },
  { id: "pax-gold", symbol: "PAXG", name: "PAX Gold" },
  { id: "global-dollar", symbol: "USDG", name: "Global Dollar" },
  { id: "mantle", symbol: "MNT", name: "Mantle" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap" },
  { id: "near", symbol: "NEAR", name: "NEAR Protocol" },
  { id: "sky", symbol: "SKY", name: "Sky" },
  { id: "okb", symbol: "OKB", name: "OKB" },
  { id: "pi-network", symbol: "PI", name: "Pi Network" },
  { id: "aave", symbol: "AAVE", name: "Aave" },
  { id: "htx-dao", symbol: "HTX", name: "HTX DAO" },
  { id: "pepe", symbol: "PEPE", name: "Pepe" },
  { id: "usdd", symbol: "USDD", name: "USDD" },
  { id: "ripple-usd", symbol: "RLUSD", name: "Ripple USD" },
  { id: "internet-computer", symbol: "ICP", name: "Internet Computer" },
  { id: "ethereum-classic", symbol: "ETC", name: "Ethereum Classic" },
  { id: "ondo-us-dollar-yield", symbol: "USDY", name: "Ondo US Dollar Yield" },
  { id: "bitget-token", symbol: "BGB", name: "Bitget Token" },
  { id: "ondo-finance", symbol: "ONDO", name: "Ondo" },
  { id: "kucoin-shares", symbol: "KCS", name: "KuCoin" },
  { id: "gatechain-token", symbol: "GT", name: "Gate" },
  { id: "pump-fun", symbol: "PUMP", name: "Pump.fun" },
  { id: "quant", symbol: "QNT", name: "Quant" },
  { id: "ethena", symbol: "ENA", name: "Ethena" },
  { id: "morpho", symbol: "MORPHO", name: "Morpho" },
  { id: "algorand", symbol: "ALGO", name: "Algorand" },
  { id: "polygon-ecosystem-token", symbol: "POL", name: "POL (ex-MATIC)" },
  { id: "render-token", symbol: "RENDER", name: "Render" },
  { id: "kaspa", symbol: "KAS", name: "Kaspa" },
  { id: "worldcoin-wld", symbol: "WLD", name: "Worldcoin" },
  { id: "cosmos", symbol: "ATOM", name: "Cosmos Hub" },
  { id: "nexo", symbol: "NEXO", name: "NEXO" },
  { id: "arbitrum", symbol: "ARB", name: "Arbitrum" },
  { id: "aptos", symbol: "APT", name: "Aptos" },
  { id: "blockchain-capital", symbol: "BCAP", name: "Blockchain Capital" },
  { id: "filecoin", symbol: "FIL", name: "Filecoin" },
  { id: "flare-networks", symbol: "FLR", name: "Flare" },
  { id: "official-trump", symbol: "TRUMP", name: "Official Trump" },
  { id: "dexe", symbol: "DEXE", name: "DeXe" },
  { id: "jupiter-exchange-solana", symbol: "JUP", name: "Jupiter" },
  { id: "beldex", symbol: "BDX", name: "Beldex" },
  { id: "vechain", symbol: "VET", name: "VeChain" },
  { id: "just", symbol: "JST", name: "JUST" },
  { id: "xdce-crowd-sale", symbol: "XDC", name: "XDC Network" },
  { id: "ousg", symbol: "OUSG", name: "OUSG" },
  { id: "gho", symbol: "GHO", name: "GHO" },
  { id: "usual-usd", symbol: "USD0", name: "Usual USD" },
];

const CSE_STOCKS = [
  { symbol: "JKH.N0000", name: "John Keells Holdings" },
  { symbol: "COMB.N0000", name: "Commercial Bank" },
  { symbol: "SAMP.N0000", name: "Sampath Bank" },
  { symbol: "HNB.N0000", name: "Hatton National Bank" },
  { symbol: "DIAL.N0000", name: "Dialog Axiata" },
  { symbol: "LOLC.N0000", name: "LOLC Holdings" },
  { symbol: "HAYL.N0000", name: "Hayleys" },
  { symbol: "MELS.N0000", name: "Melstacorp" },
  { symbol: "DIST.N0000", name: "Distilleries" },
  { symbol: "SLTL.N0000", name: "Sri Lanka Telecom" },
  { symbol: "LIOC.N0000", name: "Lanka IOC" },
  { symbol: "VONE.N0000", name: "Vallibel One" },
  { symbol: "LOFC.N0000", name: "LOLC Finance" },
  { symbol: "BIL.N0000", name: "Browns Investments" },
  { symbol: "CARG.N0000", name: "Cargills" },
  { symbol: "CTC.N0000", name: "Ceylon Tobacco" },
  { symbol: "EXPO.N0000", name: "Expolanka" },
  { symbol: "ACL.N0000", name: "ACL Cables" },
  { symbol: "SUN.N0000", name: "Sunshine Holdings" },
  { symbol: "TILE.N0000", name: "Lanka Tiles" },
];

export function AddAssetButton({
  rates,
  baseCurrency,
  displayCurrencies,
}: {
  rates: Record<string, number>;
  baseCurrency: string;
  displayCurrencies: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [type, setType] = useState("BANK");
  const [selectedCoin, setSelectedCoin] = useState("BTC");
  const [selectedStock, setSelectedStock] = useState("JKH.N0000");
  const [marketSearch, setMarketSearch] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [value, setValue] = useState<string>("");
  
  const [purchasedValue, setPurchasedValue] = useState<string>("");
  const [purchasedAt, setPurchasedAt] = useState<string>("");

  const [goldPrice, setGoldPrice] = useState<number>(0); 
  const [cryptoPrice, setCryptoPrice] = useState<number>(0);
  const [stockPrice, setStockPrice] = useState<number>(0);

  const filteredCoins = COINS.filter(c => 
    c.name.toLowerCase().includes(marketSearch.toLowerCase()) || 
    c.symbol.toLowerCase().includes(marketSearch.toLowerCase())
  );

  const filteredStocks = CSE_STOCKS.filter(s =>
    s.name.toLowerCase().includes(marketSearch.toLowerCase()) ||
    s.symbol.toLowerCase().includes(marketSearch.toLowerCase())
  );

  useEffect(() => {
    async function fetchPrices() {
      if (!isOpen) return;
      if (type === "GOLD") {
        setIsFetchingPrice(true);
        const result = await getLiveGoldPrice();
        if (result.success) setGoldPrice(result.price);
        setIsFetchingPrice(false);
      } else if (type === "CRYPTO") {
        setIsFetchingPrice(true);
        const result = await getLiveCryptoPrice(selectedCoin);
        if (result.success) setCryptoPrice(result.price);
        setIsFetchingPrice(false);
      } else if (type === "SHARE") {
        setIsFetchingPrice(true);
        const result = await getCsePrice(selectedStock);
        if (result.success) setStockPrice(result.price);
        setIsFetchingPrice(false);
      }
    }
    fetchPrices();
  }, [type, selectedCoin, selectedStock, isOpen]);

  const quantityValue = Number.parseFloat(quantity);
  const marketUnitPrice = type === "GOLD" ? goldPrice : type === "CRYPTO" ? cryptoPrice : type === "SHARE" ? stockPrice : null;
  const calculatedValue = marketUnitPrice !== null && Number.isFinite(quantityValue)
    ? (quantityValue * marketUnitPrice).toFixed(2)
    : null;
  const currentValue = calculatedValue ?? value;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await addAsset(formData);
    setIsPending(false);
    if (result.success) {
      setIsOpen(false);
      setQuantity("");
      setValue("");
      setPurchasedValue("");
      setPurchasedAt("");
    } else {
      alert(result.error);
    }
  }

  const numValue = parseFloat(currentValue) || 0;
  const previewCurrencies = Array.from(new Set([baseCurrency, ...displayCurrencies]));

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full justify-center px-4 py-2.5 text-sm font-medium flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] sm:w-auto"
      >
        <Plus className="w-4 h-4"/> Add New Asset
      </button>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Track New Asset">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset Name</label>
            <input required name="name" placeholder="e.g. My Wealth" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset Category</label>
              <select 
                name="type" 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
              >
                <option value="BANK">Bank Savings</option>
                <option value="SHARE">CSE Shares (Sri Lanka)</option>
                <option value="CRYPTO">Cryptocurrency</option>
                <option value="GOLD">Physical Gold</option>
                <option value="CASH">Cash in Hand</option>
                <option value="LAND">Real Estate / Land</option>
                <option value="VEHICLE">Vehicle / Auto</option>
              </select>
            </div>

            {type === "CRYPTO" || type === "SHARE" ? (
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  {type === "CRYPTO" ? "Search Coin" : "Search CSE Stock"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input 
                    type="text"
                    placeholder={type === "CRYPTO" ? "BTC..." : "JKH..."}
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                {marketSearch && (type === "CRYPTO" ? filteredCoins : filteredStocks).length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto">
                    {(type === "CRYPTO" ? filteredCoins : filteredStocks).map(item => (
                      <button
                        key={'id' in item ? (item.id as string) : (item.symbol as string)}
                        type="button"
                        onClick={() => {
                          if (type === "CRYPTO") {
                            setSelectedCoin('symbol' in item ? item.symbol : "");
                          } else {
                            setSelectedStock('symbol' in item ? item.symbol : "");
                          }
                          setMarketSearch("");
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 text-zinc-300 hover:text-white transition-colors flex justify-between items-center"
                      >
                        <span>{item.name}</span>
                        <span className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded uppercase">
                          {'symbol' in item ? item.symbol.replace('.N0000', '') : ""}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                <input type="hidden" name="name" value={type === "CRYPTO" ? `${selectedCoin} Portfolio` : type === "SHARE" ? selectedStock.split('.')[0] : "Asset"} />
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Live Value ({baseCurrency})</label>
                <input 
                  required 
                  name="value" 
                  type="number" 
                  step="0.01" 
                  placeholder="0.00" 
                  value={currentValue}
                  readOnly={type === "GOLD" && calculatedValue !== null}
                  onChange={(e) => setValue(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" 
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Purchase Price ({baseCurrency})</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  name="purchasedValue" 
                  type="number" 
                  step="0.01" 
                  placeholder="Cost Basis" 
                  value={purchasedValue}
                  onChange={(e) => setPurchasedValue(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Purchase Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  name="purchasedAt" 
                  type="date" 
                  value={purchasedAt}
                  onChange={(e) => setPurchasedAt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" 
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {type === "GOLD" ? "Quantity (grams)" : type === "CRYPTO" ? `Quantity (${selectedCoin})` : type === "SHARE" ? `Quantity (${selectedStock.split('.')[0]})` : "Quantity (Optional)"}
            </label>
            <div className="relative">
              <input 
                name="quantity" 
                type="number" 
                step="0.01" 
                placeholder="Volume..." 
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" 
              />
              {(type === "GOLD" || type === "CRYPTO" || type === "SHARE") && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold uppercase">
                  {isFetchingPrice ? (
                    <Loader2 className="w-3 h-3 animate-spin text-zinc-500" />
                  ) : type === "GOLD" ? (
                    <Coins size={12} className="text-amber-500" />
                  ) : type === "CRYPTO" ? (
                    <Cpu size={12} className="text-primary" />
                  ) : (
                    <ArrowRightLeft size={12} className="text-emerald-500" />
                  )}
                  <span className={clsx(
                    type === "GOLD" ? "text-amber-500/80" : type === "CRYPTO" ? "text-primary/80" : "text-emerald-500/80"
                  )}>
                    Live: {baseCurrency} {type === "GOLD" ? goldPrice.toFixed(2) : type === "CRYPTO" ? cryptoPrice.toLocaleString() : stockPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {(type === "CRYPTO" || type === "SHARE") && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Calculated Current Value ({baseCurrency})</label>
              <input readOnly name="value" value={currentValue} className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-primary font-bold focus:outline-none font-mono" />
            </div>
          )}

          {/* Multi-Currency Preview */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col gap-3">
             <div className="flex items-center gap-2 text-zinc-400">
               <Globe className="w-3.5 h-3.5" />
               <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Multi-Currency Assessment</span>
             </div>
             <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {previewCurrencies.map((currency, index) => (
                  <div className="flex flex-col" key={currency}>
                    <span className="text-[8px] uppercase font-bold text-zinc-500">{currency} Value</span>
                    <span className={clsx("text-sm font-bold", index === 0 ? "text-white" : "text-zinc-400")}>
                      {(numValue * (rates[currency] || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
             </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="mt-2 w-full py-4 rounded-2xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isPending ? "Tracking..." : (
              <>
                <TrendingUp size={18} />
                Save Performance Tracking
              </>
            )}
          </button>
        </form>
      </Dialog>
    </>
  );
}
