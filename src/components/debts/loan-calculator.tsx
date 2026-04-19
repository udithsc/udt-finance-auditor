"use client";

import { useState, useEffect } from "react";
import { Calculator, Calendar, DollarSign, Percent } from "lucide-react";

export function LoanCalculator() {
  const [amount, setAmount] = useState<number>(10000);
  const [interest, setInterest] = useState<number>(5);
  const [years, setYears] = useState<number>(5);
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalInterest, setTotalInterest] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  useEffect(() => {
    const principal = amount;
    const calculatedInterest = interest / 100 / 12;
    const calculatedPayments = years * 12;

    const x = Math.pow(1 + calculatedInterest, calculatedPayments);
    const monthly = (principal * x * calculatedInterest) / (x - 1);

    if (isFinite(monthly)) {
      setMonthlyPayment(monthly);
      setTotalPayment(monthly * calculatedPayments);
      setTotalInterest(monthly * calculatedPayments - principal);
    }
  }, [amount, interest, years]);

  return (
    <div className="glass rounded-3xl border border-white/5 p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <Calculator size={20} />
        </div>
        <h3 className="text-lg font-semibold text-white">Loan Calculator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <DollarSign size={14} /> Loan Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Percent size={14} /> Interest Rate (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={interest}
            onChange={(e) => setInterest(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={14} /> Loan Term (Years)
          </label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Monthly Payment</p>
          <p className="text-2xl font-bold text-primary">MYR {monthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Total Interest</p>
          <p className="text-xl font-bold text-red-400">MYR {totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Total Payment</p>
          <p className="text-xl font-bold text-white">MYR {totalPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
  );
}
