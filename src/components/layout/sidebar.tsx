"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Wallet, ArrowRightLeft, Settings, LogOut, ChevronRight, Coins, Landmark, Calculator as CalcIcon } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Assets", href: "/assets", icon: Coins },
  { name: "Debts", href: "/debts", icon: Landmark },
  { name: "Calculator", href: "/calculator", icon: CalcIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex md:w-64 md:flex-col fixed inset-y-0 z-50">
      <div className="flex-1 flex flex-col min-h-0 bg-background border-r border-border glass rounded-r-3xl my-4 ml-4">
        {/* Logo Area */}
        <div className="flex-shrink-0 flex items-center px-6 py-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
            <img 
              src="/icon.png" 
              alt="Auditor Logo" 
              className="relative h-10 w-10 rounded-xl shadow-2xl border border-white/10" 
            />
          </div>
          <div className="ml-3 flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">Auditor</span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/80">Premium</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 mt-4">Menu</p>
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white border border-transparent",
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all"
                )}
              >
                <item.icon
                  className={clsx(
                    isActive ? "text-primary" : "text-zinc-400 group-hover:text-white",
                    "mr-3 flex-shrink-0 h-5 w-5 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
                {isActive && (
                  <ChevronRight className="ml-auto w-4 h-4 text-primary opacity-70" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Area / Settings */}
        <div className="flex-shrink-0 flex flex-col p-4 gap-1 border-t border-white/5">
          <Link
            href="/settings"
             className={clsx(
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary"
                : "text-zinc-400 hover:bg-white/5 hover:text-white",
              "group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all"
            )}
          >
            <Settings className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-white" />
            Settings
          </Link>
          <Link
            href="/login"
            className="group flex w-full items-center px-3 py-2 text-sm font-medium rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-red-400" />
            Login / Lock
          </Link>
        </div>
      </div>
    </div>
  );
}
