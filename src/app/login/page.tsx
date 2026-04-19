"use client";

import { signIn } from "next-auth/react";
import { MoveRight, Shield, Database, Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden items-center justify-center">
      {/* Decorative background elements */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg p-8 animate-slide-up">
        <div className="glass rounded-3xl p-10 flex flex-col items-center border border-white/5 shadow-2xl">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
            <img 
              src="/icon.png" 
              alt="Auditor Logo" 
              className="relative h-20 w-20 rounded-2xl shadow-2xl border border-white/10" 
            />
          </div>
          
          <h1 className="text-3xl font-semibold tracking-tight mb-2 text-foreground">
            Welcome to Auditor
          </h1>
          <p className="text-zinc-400 text-center text-sm mb-10 max-w-xs">
            Your self-hosted, private workspace for extracting and analyzing your financial life.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-white text-zinc-950 px-6 py-3 font-medium transition-all hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
            <MoveRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
          
          <div className="mt-10 grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
              <Shield className="w-5 h-5 text-zinc-400" />
              <span className="text-xs text-zinc-500">End-to-End Private</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
              <Database className="w-5 h-5 text-zinc-400" />
              <span className="text-xs text-zinc-500">Self-Hosted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
