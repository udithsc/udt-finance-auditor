"use client";

import { useState } from "react";
import { Edit2, Loader2, X } from "lucide-react";
import { updateDebt } from "@/app/actions/debts";
import { useRouter } from "next/navigation";

export function EditDebtButton({ debt }: { debt: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: debt.name,
    type: debt.type,
    totalAmount: debt.totalAmount,
    remaining: debt.remaining,
    monthly: debt.monthly || "",
    currency: debt.currency,
    notes: debt.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateDebt(debt.id, {
      ...formData,
      totalAmount: Number(formData.totalAmount),
      remaining: Number(formData.remaining),
      monthly: formData.monthly ? Number(formData.monthly) : null,
    });
    
    setIsSaving(false);
    if (!res.success) {
      alert("Failed to update: " + res.error);
    } else {
      setIsOpen(false);
      router.refresh();
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
      >
        <Edit2 className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-slide-up">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">Edit Liability</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Account / Creditor Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                  >
                    <option value="Mortgage">Mortgage</option>
                    <option value="Car Loan">Car Loan</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Personal Loan">Personal Loan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Currency</label>
                  <select 
                    value={formData.currency} 
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none"
                  >
                    <option value="MYR">MYR</option>
                    <option value="USD">USD</option>
                    <option value="LKR">LKR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Total Borrowed Amount</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.totalAmount} 
                    onChange={e => setFormData({...formData, totalAmount: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Remaining Balance</label>
                   <input 
                    type="number" 
                    step="0.01"
                    value={formData.remaining} 
                    onChange={e => setFormData({...formData, remaining: e.target.value as any})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Monthly Repayment (Optional)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={formData.monthly} 
                  onChange={e => setFormData({...formData, monthly: e.target.value as any})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-primary outline-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-2.5 mt-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
