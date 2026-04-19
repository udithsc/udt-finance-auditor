"use client";

import { Save, Key, Wallet, ListTree, Bell, Shield, Download } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800); // Simulate network request for now
  };

  return (
    <div className="flex flex-col gap-8 pb-12 w-full max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-zinc-500 mt-1">Configure your workspace rules, categories, and AI keys.</p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        
        {/* Navigation Tabs */}
        <div className="flex flex-col gap-1">
          {[
            { id: "general", label: "General & Currency", icon: Wallet },
            { id: "categories", label: "Categories", icon: ListTree },
            { id: "api", label: "API Keys & Integrations", icon: Key },
            { id: "security", label: "Security & Access", icon: Shield },
            { id: "data", label: "Data Management", icon: Download },
          ].map((tab) => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
             >
                <tab.icon className="w-4 h-4" />
                {tab.label}
             </button>
          ))}
        </div>

        {/* Form Content Area */}
        <div className="glass rounded-3xl p-8 border border-white/5 min-h-[500px]">
          
          {/* General & Currency */}
          {activeTab === "general" && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white">Localization Setup</h3>
                <p className="text-sm text-zinc-500 mb-4">Set your primary visualization currency.</p>
                <div className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-zinc-300">Base Currency</label>
                    <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-white w-full max-w-md appearance-none">
                      <option value="MYR">MYR - Malaysian Ringgit (Default)</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="LKR">LKR - Sri Lankan Rupee</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-zinc-300">Timezone Offset</label>
                    <input 
                      type="text" 
                      defaultValue="Asia/Kuala_Lumpur" 
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-white w-full max-w-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories */}
          {activeTab === "categories" && (
            <div className="animate-fade-in space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">Custom Categories</h3>
                  <p className="text-sm text-zinc-500">Train the AI Extractor on your specific buckets.</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/15 rounded-lg font-medium transition-colors">
                  + Add New
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {["Salary", "Food & Dining", "Transport", "Subscriptions", "Rent", "Health", "Investments", "Internal Transfer"].map(cat => (
                  <div key={cat} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center justify-between group">
                    <span className="text-sm text-zinc-300">{cat}</span>
                    <button className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Keys */}
          {activeTab === "api" && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white">AI Services</h3>
                <p className="text-sm text-zinc-500 mb-4">Provide keys for external extraction processing.</p>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-zinc-300">Google Gemini API Key</label>
                  <div className="flex gap-2 w-full max-w-md">
                    <input 
                      type="password" 
                      placeholder="AIzaSyB..." 
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors text-white flex-1"
                    />
                    <button className="bg-white/10 px-4 rounded-xl text-sm font-medium hover:bg-white/15 transition-colors">
                      Test
                    </button>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">Used explicitly for document extraction (Phase 3 Engine).</p>
                </div>
              </div>
            </div>
          )}

          {/* Save Footer for active tab */}
          <div className="mt-12 pt-6 border-t border-white/5 flex gap-3">
            <button 
              onClick={handleSave}
              className={clsx(
                "px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-primary/10",
                isSaving ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground hover:scale-[1.02]"
              )}
            >
              {isSaving ? (
                 <>Saved <CheckCircle className="w-4 h-4 ml-1" /></>
              ) : (
                 <><Save className="w-4 h-4" /> Save Configuration</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Inline fallback since Lucide handles huge imports, defining CheckCircle for smooth inline save rendering
function CheckCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}
