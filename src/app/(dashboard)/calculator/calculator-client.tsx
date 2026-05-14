"use client";

import { useState, useMemo } from "react";
import { Calculator as CalcIcon } from "lucide-react";
import clsx from "clsx";

export function CalculatorClient({ currency }: { currency: string }) {
  const [loanAmount, setLoanAmount] = useState<number>(300000000);
  const [years, setYears] = useState<number>(3);
  const [months, setMonths] = useState<number>(3);
  const [interestRate, setInterestRate] = useState<number>(3);
  const [repaymentType, setRepaymentType] = useState<"EQUATED" | "REDUCING">("EQUATED");

  const results = useMemo(() => {
    const P = loanAmount;
    const n = (years * 12) + months;
    const r = (interestRate / 100) / 12;

    if (n === 0) return null;

    const breakdown = [];
    let totalInterest = 0;
    let monthlyInstallment: number;

    if (repaymentType === "EQUATED") {
      // EMI = [P x r x (1+r)^n] / [((1+r)^n)-1]
      monthlyInstallment = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
      
      let balance = P;
      for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const principal = monthlyInstallment - interest;
        balance -= principal;
        totalInterest += interest;
        
        if (i <= 12 || i === n) { // Limit breakdown display for performance/UI
           breakdown.push({
             month: i,
             principal: principal,
             interest: interest,
             installment: monthlyInstallment,
             balance: Math.max(0, balance)
           });
        }
      }
    } else {
      // Fixed Principal (Reducing Balance)
      const fixedPrincipal = P / n;
      let balance = P;
      
      // We calculate first month to show as "result"
      monthlyInstallment = fixedPrincipal + (P * r);

      for (let i = 1; i <= n; i++) {
        const interest = balance * r;
        const installment = fixedPrincipal + interest;
        balance -= fixedPrincipal;
        totalInterest += interest;

        if (i <= 12 || i === n) {
          breakdown.push({
            month: i,
            principal: fixedPrincipal,
            interest: interest,
            installment: installment,
            balance: Math.max(0, balance)
          });
        }
      }
    }

    return {
      monthlyInstallment,
      firstMonthPrincipal: breakdown[0]?.principal || 0,
      firstMonthInterest: breakdown[0]?.interest || 0,
      totalInterest,
      totalPayment: P + totalInterest,
      breakdown
    };
  }, [loanAmount, years, months, interestRate, repaymentType]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <CalcIcon className="text-primary w-8 h-8" />
          Housing Loan Calculator
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
        {/* Input Controls */}
        <div className="lg:col-span-5 bg-[#0052cc] rounded-3xl p-8 shadow-2xl flex flex-col gap-8 text-white">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-blue-100">I would like to borrow</label>
            <div className="relative group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-200 font-bold border-r border-blue-400/30 pr-4">{currency}</div>
               <input 
                 type="number" 
                 value={loanAmount} 
                 onChange={(e) => setLoanAmount(Number(e.target.value))}
                 className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl pl-20 pr-4 py-4 text-2xl font-bold focus:outline-none transition-all"
               />
               <p className="text-[10px] text-blue-200 mt-2 text-right">Minimum {currency} 500,000</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-blue-100">Over a loan term of</label>
            <div className="grid grid-cols-2 gap-4">
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-200 uppercase">Years</div>
                  <input 
                    type="number" 
                    value={years} 
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-16 pr-4 py-4 text-xl font-bold focus:outline-none"
                  />
               </div>
               <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-200 uppercase">Months</div>
                  <input 
                    type="number" 
                    value={months} 
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-16 pr-4 py-4 text-xl font-bold focus:outline-none"
                  />
               </div>
            </div>
            <p className="text-[10px] text-blue-200 mt-2 text-right text-balance">Maximum 15 years</p>
          </div>

          <div className="flex flex-col gap-2">
             <label className="text-sm font-medium text-blue-100">With a repayment type</label>
             <div className="grid grid-cols-2 bg-white/10 p-1 rounded-xl border border-white/20">
                <button 
                  onClick={() => setRepaymentType("EQUATED")}
                  className={clsx(
                    "py-3 rounded-lg text-sm font-bold transition-all",
                    repaymentType === "EQUATED" ? "bg-white text-blue-700 shadow-lg" : "text-blue-100 hover:text-white"
                  )}
                >
                  Equated Balance
                </button>
                <button 
                  onClick={() => setRepaymentType("REDUCING")}
                  className={clsx(
                    "py-3 rounded-lg text-sm font-bold transition-all",
                    repaymentType === "REDUCING" ? "bg-white text-blue-700 shadow-lg" : "text-blue-100 hover:text-white"
                  )}
                >
                  Reducing Balance
                </button>
             </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-blue-100">With an interest rate of</label>
            <div className="relative">
               <input 
                 type="number" 
                 value={interestRate} 
                 onChange={(e) => setInterestRate(Number(e.target.value))}
                 className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-4 text-xl font-bold focus:outline-none text-right pr-28"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 font-medium">%p.a.</div>
            </div>
          </div>

          <button className="mt-4 bg-[#ffd100] hover:bg-[#e6bd00] text-blue-900 font-bold py-4 rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]">
            Calculate
          </button>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-7 bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">
           <div className="p-10 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Your result</span>
              <h2 className="text-2xl font-bold text-zinc-800 mb-2">
                {repaymentType === "EQUATED" ? "Equated monthly instalment" : "Initial monthly instalment"}
              </h2>
              <p className="text-6xl font-black text-[#0052cc] mt-4 mb-2 tracking-tighter">
                {currency} {results?.monthlyInstallment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xl font-bold text-zinc-600">at {interestRate}% p.a.</p>

              <div className="w-full max-w-md mt-10 space-y-4">
                 <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                    <span className="text-zinc-500 font-medium">Capital payment (1st Month)</span>
                    <span className="font-bold text-zinc-800">{currency} {results?.firstMonthPrincipal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                 </div>
                 <div className="flex justify-between items-center py-4 border-b border-zinc-100">
                    <span className="text-zinc-500 font-medium">Interest (1st Month)</span>
                    <span className="font-bold text-zinc-800">{currency} {results?.firstMonthInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                 </div>
                 <p className="text-[10px] text-zinc-400 text-right italic mt-2">*Government taxes will apply.</p>
              </div>
           </div>

           <div className="bg-zinc-50 flex-1 p-10 border-t border-zinc-100">
              <h3 className="text-2xl font-bold text-zinc-800 text-center mb-8">Loan breakdown</h3>
              <div className="overflow-hidden rounded-xl border border-zinc-200">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#0052cc] text-white">
                      <th className="px-4 py-3 font-semibold">Months</th>
                      <th className="px-4 py-3 font-semibold">Monthly Installment Principal Amount</th>
                      <th className="px-4 py-3 font-semibold">Monthly Interest</th>
                      <th className="px-4 py-3 font-semibold text-right">Monthly Installment</th>
                      <th className="px-4 py-3 font-semibold text-right">Principal Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 bg-white">
                    {results?.breakdown.map((row) => (
                      <tr key={row.month} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-4 py-3 text-zinc-600 font-medium">{row.month}</td>
                        <td className="px-4 py-3 text-zinc-800">{currency} {row.principal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-zinc-800">{currency} {row.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right font-bold text-[#0052cc]">{currency} {row.installment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-right text-zinc-500">{currency} {row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-white text-center text-[10px] text-zinc-400 uppercase tracking-widest border-t border-zinc-100">
                   showing first 12 months & final month
                </div>
              </div>

               <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                     <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Total Interest</p>
                     <p className="text-xl font-bold text-zinc-800">{currency} {results?.totalInterest.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                     <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Total Payment</p>
                     <p className="text-xl font-bold text-zinc-800">{currency} {results?.totalPayment.toLocaleString()}</p>
                  </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
}
