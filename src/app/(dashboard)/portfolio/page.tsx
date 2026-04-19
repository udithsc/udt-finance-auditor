import { prisma } from "@/lib/prisma";
import { Plus, Diamond, Building, Landmark, CreditCard } from "lucide-react";

export default async function PortfolioPage() {
  let assets: any[] = [];
  let debts: any[] = [];
  let dbError = false;

  try {
    assets = await prisma.asset.findMany();
    debts = await prisma.debt.findMany();
  } catch (err) {
    console.error("Failed to fetch portfolio:", err);
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-8 pb-12 w-full mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assets & Debts</h1>
        <p className="text-zinc-500 mt-1">Manage everything you own and everything you owe.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Assets Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold flex items-center gap-2">
                <Diamond className="text-primary w-5 h-5"/> Assets
             </h2>
             <button className="p-1 px-3 text-sm flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
               <Plus className="w-4 h-4"/> Add Asset
             </button>
          </div>

          <div className="glass rounded-2xl border border-emerald-500/10 p-2 min-h-[300px]">
            {dbError ? (
               <div className="h-full flex flex-col items-center justify-center p-8 bg-red-500/5 rounded-xl border border-red-500/10 text-center">
                  <Landmark className="w-10 h-10 mb-3 text-red-500/50" />
                  <p className="text-red-400 font-medium">Database Offline</p>
                  <p className="text-zinc-500 text-sm mt-1">Unable to fetch assets.</p>
               </div>
            ) : assets.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center p-8 opacity-50 text-center">
                  <Landmark className="w-10 h-10 mb-3" />
                  <p>No assets tracked.</p>
               </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {assets.map((asset) => (
                  <li key={asset.id} className="p-4 hover:bg-white/5 rounded-xl transition-colors flex justify-between items-center px-6">
                    <div>
                      <h4 className="font-medium text-white">{asset.name}</h4>
                      <p className="text-xs text-zinc-500">{asset.type}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-semibold text-emerald-400">{asset.currency} {asset.value.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Debts Panel */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold flex items-center gap-2">
                <CreditCard className="text-red-400 w-5 h-5"/> Liabilities
             </h2>
             <button className="p-1 px-3 text-sm flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
               <Plus className="w-4 h-4"/> Add Liability
             </button>
          </div>

          <div className="glass rounded-2xl border border-red-500/10 p-2 min-h-[300px]">
            {dbError ? (
               <div className="h-full flex flex-col items-center justify-center p-8 bg-red-500/5 rounded-xl border border-red-500/10 text-center">
                  <Building className="w-10 h-10 mb-3 text-red-500/50" />
                  <p className="text-red-400 font-medium">Database Offline</p>
                  <p className="text-zinc-500 text-sm mt-1">Unable to fetch liabilities.</p>
               </div>
            ) : debts.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center p-8 opacity-50 text-center">
                  <Building className="w-10 h-10 mb-3" />
                  <p>No liabilities tracked.</p>
               </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {debts.map((debt) => (
                  <li key={debt.id} className="p-4 hover:bg-white/5 rounded-xl transition-colors flex justify-between items-center px-6">
                    <div>
                      <h4 className="font-medium text-white">{debt.name}</h4>
                      <p className="text-xs text-zinc-500">Remaining Details</p>
                    </div>
                    <div className="text-right">
                       <p className="font-semibold text-red-400">{debt.currency} {debt.remaining.toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
