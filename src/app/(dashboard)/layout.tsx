import { Sidebar } from "@/components/layout/sidebar";

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
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 h-screen overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 py-8 lg:px-12 w-full animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
