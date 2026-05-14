import { getAppSettings } from "@/lib/app-settings";
import { updateAppSettings } from "@/app/actions/settings";
import { Save, Wallet, ListTree, Shield, Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getAppSettings();

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-zinc-500 mt-1">Configure workspace rules from the database.</p>
      </div>

      <form action={updateAppSettings} className="grid lg:grid-cols-[240px_1fr] gap-8">
        <div className="flex flex-col gap-1">
          {[
            { label: "General & Currency", icon: Wallet },
            { label: "Categories", icon: ListTree },
            { label: "Security & Access", icon: Shield },
            { label: "Data Management", icon: Download },
          ].map((tab) => (
            <div
              key={tab.label}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </div>
          ))}
        </div>

        <div className="glass rounded-3xl p-8 border border-white/5 min-h-[500px] space-y-10">
          <section className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white">Localization Setup</h3>
              <p className="text-sm text-zinc-500 mb-4">These values are loaded from and saved to Postgres.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">Base Currency</label>
                <input
                  name="baseCurrency"
                  defaultValue={settings.baseCurrency}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-white uppercase"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-300">Display Currencies</label>
                <input
                  name="displayCurrencies"
                  defaultValue={settings.displayCurrencies.join(", ")}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-white uppercase"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-zinc-300">Timezone</label>
                <input
                  name="timezone"
                  defaultValue={settings.timezone}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-white"
                  required
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white">Transaction Categories</h3>
              <p className="text-sm text-zinc-500">One category per line. Extraction and manual transactions use this list.</p>
            </div>
            <textarea
              name="categories"
              defaultValue={settings.categories.join("\n")}
              className="min-h-56 w-full resize-y bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors text-white"
            />
          </section>

          <div className="pt-6 border-t border-white/5 flex gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/10 bg-primary text-primary-foreground hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
