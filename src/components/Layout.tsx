import * as React from "react";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  user?: any;
  onLogout?: () => void;
}

export function Layout({ children, user, onLogout }: LayoutProps) {
  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        <div className="flex-1 container mx-auto p-6 md:p-10 max-w-7xl">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
