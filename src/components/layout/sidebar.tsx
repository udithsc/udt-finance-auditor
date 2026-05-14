"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowRightLeft, Settings, LogOut, ChevronRight, Coins, Landmark, Calculator as CalcIcon } from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: ArrowRightLeft },
  { name: "Assets", href: "/assets", icon: Coins },
  { name: "Debts", href: "/debts", icon: Landmark },
  { name: "Calculator", href: "/calculator", icon: CalcIcon },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex md:w-64 md:flex-col fixed inset-y-0 z-50">
      <div className="flex-1 flex flex-col min-h-0 bg-background border-r border-border glass rounded-r-3xl my-4 ml-4">
        {/* Logo Area */}
        <div className="flex-shrink-0 flex items-center px-6 py-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full group-hover:bg-primary/30 transition-all" />
            <Image 
              src="/icon.png" 
              alt="Auditor Logo" 
              width={40}
              height={40}
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
            const isActive = isActivePath(pathname, item.href);
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

export function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-background/90 px-4 py-3 backdrop-blur-xl supports-[padding:max(0px)]:pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <Image
            src="/icon.png"
            alt="Auditor Logo"
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl border border-white/10 shadow-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Auditor</p>
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-primary/80">Private finance</p>
          </div>
        </Link>
        <Link
          href="/settings"
          aria-label="Settings"
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 active:scale-95"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  );
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {navigation.map((item) => {
          const isActive = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={clsx(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition-colors",
                isActive ? "bg-primary/15 text-primary" : "text-zinc-500 active:bg-white/10"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="w-full truncate text-center">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
