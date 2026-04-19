import { prisma } from "@/lib/prisma";
import { Plus, Coins, TrendingUp, Wallet, Landmark, Fuel, Car, Calendar, ArrowUpRight, ArrowDownRight, Globe } from "lucide-react";
import { AddAssetButton } from "@/components/assets/add-asset-dialog";
import { EditAssetButton } from "@/components/assets/edit-asset-dialog";
import { DeleteAssetButton } from "@/components/assets/delete-asset-button";
import { getExchangeRates } from "@/app/actions/currency";

export default async function AssetsPage() {
  let assets: any[] = [];
  let dbError = false;
  let rates: any = { MYR: 1, USD: 0.21, LKR: 65.0 };

  try {
    assets = await prisma.asset.findMany({
      orderBy: { updatedAt: "desc" }
    });
    const rateResult = await getExchangeRates();
    if (rateResult.success) rates = rateResult.rates;
  } catch (err) {
    console.error("Failed to fetch assets:", err);
    dbError = true;
  }

  const totalValueMYR = assets.reduce((acc, asset) => Math.round((acc + asset.value) * 100) / 100, 0);
  const totalValueUSD = Math.round(totalValueMYR * rates.USD * 100) / 100;
  const totalValueLKR = Math.round(totalValueMYR * rates.LKR * 100) / 100;

  return (
    <div className="flex flex-col gap-8 pb-12 w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Assets Portfolio</h1>
          <p className="text-zinc-500 mt-1">Track wealth with multi-currency & performance analysis.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="glass px-5 py-2.5 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
             <div className="flex items-center gap-2 mb-0.5">
               <Globe className="w-3 h-3 text-emerald-500" />
               <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Net Assets</p>
             </div>
             <p className="text-xl font-bold text-emerald-400">MYR {totalValueMYR.toLocaleString()}</p>
             <div className="flex gap-2 text-[10px] text-zinc-400 font-medium">
               <span>USD {totalValueUSD.toLocaleString()}</span>
               <span>LKR {totalValueLKR.toLocaleString()}</span>
             </div>
          </div>
        </div>
      </div>


      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <TrendingUp className="text-primary w-5 h-5"/> Portfolio Performance
          </h2>
          <AddAssetButton rates={rates} />
        </div>

        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Purchase Detail</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Current Value</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Gain / Loss</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Coins className="w-10 h-10 opacity-20" />
                        <p>No assets found. Start by adding your first asset.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const gainLoss = asset.purchasedValue ? asset.value - asset.purchasedValue : null;
                    const gainLossPercent = asset.purchasedValue ? (gainLoss! / asset.purchasedValue) * 100 : null;
                    
                    return (
                      <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-primary transition-colors">{asset.name}</div>
                          {asset.quantity && <div className="text-xs text-zinc-500 mt-0.5">{asset.quantity.toLocaleString()} Units</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-white/5 uppercase">{asset.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          {asset.purchasedValue ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm text-zinc-300">MYR {asset.purchasedValue.toLocaleString()}</span>
                              <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                <Calendar className="w-2.5 h-2.5" />
                                {asset.purchasedAt ? new Date(asset.purchasedAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          ) : <span className="text-zinc-500 text-xs">—</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-bold text-white">MYR {asset.value.toLocaleString()}</span>
                            <div className="flex gap-1.5 text-[9px] text-zinc-500 font-medium">
                              <span>USD {(asset.value * rates.USD).toLocaleString()}</span>
                              <span>LKR {(asset.value * rates.LKR).toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {gainLoss !== null ? (
                            <div className={`flex flex-col items-end gap-0.5 ${gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              <div className="flex items-center gap-1 font-bold">
                                {gainLoss >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                MYR {Math.abs(gainLoss).toLocaleString()}
                              </div>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-400/10">
                                {gainLossPercent?.toFixed(2)}%
                              </span>
                            </div>
                          ) : <span className="text-zinc-500 text-xs">—</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <EditAssetButton asset={asset} />
                            <DeleteAssetButton id={asset.id} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
