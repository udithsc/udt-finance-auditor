import { prisma } from "@/lib/prisma";
import type { Asset, Debt, Transaction } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, Landmark, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { DashboardChart } from "./dashboard-chart";
import { NetWorthBreakdown } from "./net-worth-breakdown";
import { getAppSettings } from "@/lib/app-settings";
import { getExchangeRates } from "@/app/actions/currency";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let assets: Asset[] = [];
  let debts: Debt[] = [];
  let transactions: Transaction[] = [];
  const settings = await getAppSettings();
  let rates: Record<string, number> = { [settings.baseCurrency]: 1 };

  try {
    assets = await prisma.asset.findMany();
    debts = await prisma.debt.findMany();
    transactions = await prisma.transaction.findMany({
      orderBy: { date: "asc" }
    });
    const currencies = Array.from(new Set([
      ...settings.displayCurrencies,
      ...debts.map((debt) => debt.currency),
      ...transactions.map((transaction) => transaction.currency),
    ]));
    const rateResult = await getExchangeRates(settings.baseCurrency, currencies);
    if (rateResult.success) rates = rateResult.rates;
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
  }

  const toBaseAmount = (amount: number, currency: string) => {
    const rate = rates[currency];
    if (!currency || currency === settings.baseCurrency || !rate) return amount;
    return amount / rate;
  };

  const totalAssets = assets.reduce((sum, a) => Math.round((sum + (a.value || 0)) * 100) / 100, 0);
  const totalDebts = debts.reduce((sum, d) => Math.round((sum + toBaseAmount(d.remaining || 0, d.currency)) * 100) / 100, 0);
  const netWorth = totalAssets - totalDebts;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let realIncome = 0;
  let realExpenses = 0;
  
  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    if (!tx.isInternal && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
      if (tx.type === "CREDIT") {
        realIncome = Math.round((realIncome + toBaseAmount(tx.amount, tx.currency)) * 100) / 100;
      } else if (tx.type === "DEBIT") {
        realExpenses = Math.round((realExpenses + toBaseAmount(tx.amount, tx.currency)) * 100) / 100;
      }
    }
  });

  const monthlySavings = Math.round((realIncome - realExpenses) * 100) / 100;

  const monthlyDataMap: Record<string, { income: number, expenses: number }> = {};
  
  transactions.forEach(tx => {
    if (tx.isInternal) return;
    const date = new Date(tx.date);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    if (!monthlyDataMap[monthYear]) {
       monthlyDataMap[monthYear] = { income: 0, expenses: 0 };
    }
    if (tx.type === "CREDIT") {
       monthlyDataMap[monthYear].income = Math.round((monthlyDataMap[monthYear].income + toBaseAmount(tx.amount, tx.currency)) * 100) / 100;
    } else if (tx.type === "DEBIT") {
       monthlyDataMap[monthYear].expenses = Math.round((monthlyDataMap[monthYear].expenses + toBaseAmount(tx.amount, tx.currency)) * 100) / 100;
    }
  });

  let currentBalance = 0;
  const chartData = Object.keys(monthlyDataMap).map(key => {
    currentBalance += (monthlyDataMap[key].income - monthlyDataMap[key].expenses);
    return {
      name: key,
      balance: currentBalance > 0 ? currentBalance : 0,
      expenses: monthlyDataMap[key].expenses
    };
  });

  return (
    <div className="flex flex-col gap-5 pb-8 sm:gap-8 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Image 
            src="/icon.png" 
            alt="Auditor Logo" 
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl border border-white/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]" 
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Dashboard</h1>
            <p className="text-zinc-500 mt-1">Your financial life at a glance (Base Currency: {settings.baseCurrency})</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <Link href="/transactions" className="px-3 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition-colors text-sm font-medium text-center sm:px-4">
            Transactions
          </Link>
          <Link href="/assets" className="px-3 py-2 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm font-medium text-center sm:px-4">
            Add Asset
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        <div className="glass rounded-2xl p-6 group">
          <div className="flex justify-between items-start">
            <div className="bg-primary/20 p-3 rounded-xl border border-primary/20 text-primary">
              <Landmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-zinc-400 text-sm font-medium">Net Worth</h3>
            <p className="text-3xl font-bold tracking-tight mt-1">{settings.baseCurrency} {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 group">
          <div className="flex justify-between items-start">
            <div className="bg-zinc-800 p-3 rounded-xl border border-white/5 text-zinc-300">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-zinc-400 text-sm font-medium">Total Assets</h3>
            <p className="text-3xl font-bold tracking-tight mt-1">{settings.baseCurrency} {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-zinc-500 text-xs mt-2 truncate">All tracked assets</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 group">
           <div className="flex justify-between items-start">
            <div className="bg-red-500/20 p-3 rounded-xl border border-red-500/20 text-red-500">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-zinc-400 text-sm font-medium">Total Debts</h3>
            <p className="text-3xl font-bold tracking-tight mt-1">{settings.baseCurrency} {totalDebts.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-zinc-500 text-xs mt-2 truncate">All tracked liabilities</p>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 group">
          <div className="flex justify-between items-start">
            <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/20 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            {monthlySavings > 0 && (
              <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-400/10 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> Positive
              </div>
            )}
            {monthlySavings < 0 && (
              <div className="flex items-center gap-1 text-red-400 text-xs font-semibold bg-red-400/10 px-2 py-1 rounded-full">
                <ArrowDownRight className="w-3 h-3" /> Negative
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-zinc-400 text-sm font-medium">Monthly Savings</h3>
            <p className="text-3xl font-bold tracking-tight mt-1">{settings.baseCurrency} {monthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-zinc-500 text-xs mt-2 truncate">Current Month</p>
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold tracking-tight">Spending & Balance History</h3>
            <p className="text-sm text-zinc-500">Overview of your cash flow over the months.</p>
          </div>
          <div className="h-[300px] w-full mt-4">
            <DashboardChart data={chartData} />
          </div>
        </div>

        {/* Real Income/Expenses Box */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-semibold tracking-tight">Real Cash Flow</h3>
            <p className="text-sm text-zinc-500">Excludes internal transfers.</p>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-zinc-400 text-sm">Real Income</p>
                <p className="text-emerald-400 font-bold text-xl mt-1">{settings.baseCurrency} {realIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <TrendingUp className="text-emerald-400/50 w-8 h-8" />
            </div>
            
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-zinc-400 text-sm">Real Expenses</p>
                <p className="text-red-400 font-bold text-xl mt-1">{settings.baseCurrency} {realExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <TrendingDown className="text-red-400/50 w-8 h-8" />
            </div>
          </div>

          <div className="mt-6 border-t border-white/5 pt-6">
            <h3 className="text-sm font-semibold tracking-tight mb-4">Assets vs Liabilities</h3>
            <NetWorthBreakdown assets={totalAssets} debts={totalDebts} currency={settings.baseCurrency} />
          </div>
        </div>
      </div>
    </div>
  );
}
