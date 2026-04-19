import { prisma } from "@/lib/prisma";
import TransactionsClient from "./TransactionsClient";
import { getExchangeRates } from "@/app/actions/currency";

export default async function TransactionsPage() {
  let transactions: any[] = [];
  let dbError = false;
  let dbErrorMessage = "";
  let rates: Record<string, number> = { MYR: 1, USD: 0.21, LKR: 65.0 }; // Fallback
  
  try {
    const rawData = await prisma.transaction.findMany({
      orderBy: { date: "desc" },
    });
    // Serialize dates for client component
    transactions = JSON.parse(JSON.stringify(rawData));
  } catch (err: any) {
    console.error("Failed to fetch transactions:", err);
    dbError = true;
    dbErrorMessage = err.message || "Unknown database error";
  }

  try {
    const rateResult = await getExchangeRates();
    if (rateResult.success) rates = rateResult.rates;
  } catch (err) {
    console.error("Failed to fetch rates:", err);
  }

  return <TransactionsClient initialTransactions={transactions} dbError={dbError} rates={rates} />;
}
