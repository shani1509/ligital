'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Package, 
  CreditCard, 
  BarChart, 
  LayoutGrid, 
  Library, 
  Settings, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  {
    section: 'MENU',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Students', href: '/students', icon: Users },
      { label: 'Add Student', href: '/students/add', icon: UserPlus },
      { label: 'Subscription Plans', href: '/plans', icon: Package },
      { label: 'Billing', href: '/billing', icon: CreditCard },
      { label: 'Reports & Analytics', href: '/reports', icon: BarChart },
      { label: 'Seats Management', href: '/seats', icon: LayoutGrid },
    ],
  },
  {
    section: 'GENERAL',
    items: [
      { label: 'My Library', href: '/settings/library', icon: Library },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Help', href: '/help', icon: HelpCircle },
    ],
  },
];

export default function Sidebar({ isOpen }: { isOpen?: boolean }) {
  const pathname = usePathname();
  const { user, logout, isExpired } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 w-[260px] bg-gradient-to-b from-[#0B3D1B] to-[#05200E] border-r border-white/5 text-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out shadow-2xl shadow-black/50",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/5 bg-white/5 backdrop-blur-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Link href="/dashboard" className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 bg-white rounded-[1.25rem] flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-shadow duration-300">
            <Image 
              src="/logo.png" 
              alt="Ligital Logo" 
              width={48} 
              height={48} 
              className="object-contain p-1.5"
            />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">Ligital</h1>
            <p className="text-[11px] text-emerald-400/80 font-bold tracking-widest uppercase mt-0.5">Library Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto hide-scrollbar flex flex-col relative z-10">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            <p className="text-[10px] font-black text-emerald-500/60 tracking-widest uppercase mb-4 px-2">
              {section.section}
            </p>
            <ul className="space-y-1.5">
              {section.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 group relative',
                        active
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/40 border border-emerald-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1 hover:border-white/5 border border-transparent'
                      )}
                    >
                      {active && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                      )}
                      <Icon className={cn("w-5 h-5 transition-colors duration-300 flex-shrink-0", active ? "text-white drop-shadow-md" : "text-gray-500 group-hover:text-emerald-400")} />
                      <span className="truncate">{item.label}</span>
                      
                      {/* Billing indicator */}
                      {item.label === 'Billing' && isExpired && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                      )}
                      {item.label === 'Billing' && user?.library.status === 'TRIAL' && (
                        <span className="ml-auto text-[10px] bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 px-2 py-0.5 rounded-full font-bold shadow-inner">
                          TRIAL
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Logout at bottom */}
        <div className="mt-auto pt-8 pb-4 px-2">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
          <button
            id="sidebar-logout"
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-gray-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 hover:text-red-400 transition-all duration-300 cursor-pointer group"
          >
            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400 transition-colors" />
            <span>Secure Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
