import { prisma } from "@/lib/prisma";
import type { Transaction } from "@prisma/client";
import TransactionsClient from "./TransactionsClient";
import { getExchangeRates } from "@/app/actions/currency";
import { getAppSettings } from "@/lib/app-settings";

export const dynamic = "force-dynamic";

type ClientTransaction = Omit<Transaction, "date" | "createdAt" | "updatedAt"> & {
  date: string;
  createdAt: string;
  updatedAt: string;
};

export default async function TransactionsPage() {
  let transactions: ClientTransaction[] = [];
  let dbError = false;
  const settings = await getAppSettings();
  let rates: Record<string, number> = { [settings.baseCurrency]: 1 };
  
  try {
    const rawData = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });
    // Serialize dates for client component
    transactions = rawData.map((transaction) => ({
      ...transaction,
      date: transaction.date.toISOString(),
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
    }));
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    dbError = true;
  }

  try {
    const rateResult = await getExchangeRates(settings.baseCurrency, Array.from(new Set([
      ...settings.displayCurrencies,
      ...transactions.map((transaction) => transaction.currency),
    ])));
    if (rateResult.success) rates = rateResult.rates;
  } catch (err) {
    console.error("Failed to fetch rates:", err);
  }

  return (
    <TransactionsClient
      initialTransactions={transactions}
      dbError={dbError}
      rates={rates}
      baseCurrency={settings.baseCurrency}
      currencies={settings.displayCurrencies}
      categories={settings.categories}
    />
  );
}
