"use client";

import { useState } from "react";
import { addDebt } from "@/app/actions/debts";
import { Dialog } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddDebtButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    const formData = new FormData(e.currentTarget);
    const result = await addDebt(formData);
    setIsPending(false);
    if (result.success) {
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium flex items-center gap-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)]"
      >
        <Plus className="w-4 h-4"/> Add New Debt
      </button>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add New Liability">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Creditor / Loan Name</label>
            <input required name="name" placeholder="e.g. Maybank Housing Loan" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</label>
            <select name="type" className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
              <option value="LOAN">Mortgage / Loan</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="INSTALLMENT">Installment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Amount</label>
              <input required name="totalAmount" type="number" step="0.01" placeholder="0.00" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Remaining Balance</label>
              <input required name="remaining" type="number" step="0.01" placeholder="0.00" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-red-400" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Monthly Repayment</label>
            <input name="monthly" type="number" step="0.01" placeholder="0.00" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notes</label>
            <textarea name="notes" placeholder="Additional details..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none h-24" />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="mt-2 w-full py-4 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/20"
          >
            {isPending ? "Adding..." : "Add Debt"}
          </button>
        </form>
      </Dialog>
    </>
  );
}
