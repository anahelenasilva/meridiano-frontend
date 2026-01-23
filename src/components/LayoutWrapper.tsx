'use client';

import { usePathname } from "next/navigation";
import AuthGuard from "./AuthGuard";
import Navbar from "./Navbar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {!isLoginPage && <Navbar />}
        <main className={isLoginPage ? "" : "container mx-auto px-4 py-4 sm:py-6 lg:py-8"}>
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
