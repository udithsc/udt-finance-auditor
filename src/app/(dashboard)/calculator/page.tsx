import { getAppSettings } from "@/lib/app-settings";
import { CalculatorClient } from "./calculator-client";

export const dynamic = "force-dynamic";

export default async function LoanCalculatorPage() {
  const settings = await getAppSettings();

  return <CalculatorClient currency={settings.baseCurrency} />;
}
