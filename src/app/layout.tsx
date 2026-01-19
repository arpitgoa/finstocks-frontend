'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SideNav from "@/components/SideNav";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, createContext, useContext } from 'react';

const inter = Inter({ subsets: ["latin"] });

// Create context for sidebar state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen`}>
        <QueryProvider>
          <ThemeProvider defaultTheme="system">
            <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
              <div className="relative min-h-screen">
                <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
                
                <div className="relative z-10">
                  <SideNav />
                  <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
                    <Navbar />
                    <main className="min-h-screen">
                      {children}
                    </main>
                  </div>
                </div>
              </div>
            </SidebarContext.Provider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
