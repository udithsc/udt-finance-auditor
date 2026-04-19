import { prisma } from "@/lib/prisma";
import { Plus, Landmark, CreditCard, Building, History } from "lucide-react";
import { AddDebtButton } from "@/components/debts/add-debt-dialog";
import { EditDebtButton } from "@/components/debts/edit-debt-dialog";
import { DeleteDebtButton } from "@/components/debts/delete-debt-button";

export default async function DebtsPage() {
  let debts: any[] = [];
  let dbError = false;

  try {
    debts = await prisma.debt.findMany();
  } catch (err) {
    console.error("Failed to fetch debts:", err);
    dbError = true;
  }

  const totalDebt = debts.reduce((acc, debt) => Math.round((acc + debt.remaining) * 100) / 100, 0);
  const totalMonthly = debts.reduce((acc, debt) => Math.round((acc + (debt.monthly || 0)) * 100) / 100, 0);

  return (
    <div className="flex flex-col gap-8 pb-12 w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Liabilities & Debts</h1>
          <p className="text-zinc-500 mt-1">Manage your loans, credit cards, and recurring repayments.</p>
        </div>
        <div className="flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] text-right">
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-400">MYR {totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="glass px-6 py-3 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)] text-right">
            <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Monthly Commitment</p>
            <p className="text-2xl font-bold text-blue-400">MYR {totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
            <History className="text-primary w-5 h-5"/> active Liabilities
          </h2>
          <AddDebtButton />
        </div>

        <div className="glass rounded-3xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Creditor / Loan Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Remaining</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Progress</th>
                  <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {debts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Landmark className="w-10 h-10 opacity-20" />
                        <p>No active debts found. Well done!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  debts.map((debt) => {
                    const paid = debt.totalAmount - debt.remaining;
                    const percent = debt.totalAmount > 0 ? (paid / debt.totalAmount) * 100 : 0;
                    
                    return (
                      <tr key={debt.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white group-hover:text-red-400 transition-colors">{debt.name}</div>
                          {debt.notes && <div className="text-xs text-zinc-500 mt-0.5">{debt.notes}</div>}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium px-2 py-1 rounded-lg bg-white/5 text-zinc-300 border border-white/5">{debt.type}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">
                          MYR {debt.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-red-400">{debt.remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1.5 w-32 ml-auto">
                              <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                                <span>Paid</span>
                                <span>{percent.toFixed(1)}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${percent}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <EditDebtButton debt={debt} />
                             <DeleteDebtButton id={debt.id} />
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
