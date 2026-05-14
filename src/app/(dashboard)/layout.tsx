import { MobileHeader, MobileNav, Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporary: Authentication bypassed for development
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar background effect */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
      
      <Sidebar />
      <div className="flex min-h-dvh flex-1 flex-col overflow-hidden lg:h-screen lg:pl-72">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto px-3 pb-28 pt-5 sm:px-5 lg:px-12 lg:py-8 w-full animate-fade-in">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
