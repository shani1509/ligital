'use client';

import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isExpired } = useAuth();
  const pathname = usePathname();

  // Routes allowed even when expired
  const allowedWhenExpired = ['/billing', '/settings'];
  const isAllowedRoute = allowedWhenExpired.some((r) => pathname.startsWith(r));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F3F4F6]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C8E6C9] border-t-[#1B5E20]" />
          <p className="text-sm font-medium text-gray-500">Loading Ligital...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Middleware will redirect
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col ml-[260px]">
        {/* Navbar */}
        <Navbar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Expired Lock Overlay */}
          {isExpired && !isAllowedRoute && (
            <div className="fixed inset-0 z-40 ml-[260px] mt-16 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="animate-scale-in mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-gray-900">
                  Subscription Expired
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                  Your Ligital subscription has expired. Please renew your plan to continue managing your library.
                </p>
                <Link
                  href="/billing"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2E7D32]"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Renew Subscription
                </Link>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}
