'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus, FilePlus, BarChart3, LayoutGrid, Zap } from 'lucide-react';

const actions = [
  {
    title: 'Add Student',
    description: 'Enroll a new user',
    icon: <UserPlus className="w-6 h-6 text-emerald-600"/>,
    href: '/students/add',
    color: 'bg-emerald-50 border-emerald-100',
  },
  {
    title: 'Create Plan',
    description: 'Setup sub tiers',
    icon: <FilePlus className="w-6 h-6 text-indigo-600"/>,
    href: '/plans',
    color: 'bg-indigo-50 border-indigo-100',
  },
  {
    title: 'View Reports',
    description: 'Analyze data',
    icon: <BarChart3 className="w-6 h-6 text-purple-600"/>,
    href: '/reports',
    color: 'bg-purple-50 border-purple-100',
  },
  {
    title: 'Manage Seats',
    description: 'Assign physical spots',
    icon: <LayoutGrid className="w-6 h-6 text-amber-600"/>,
    href: '/seats',
    color: 'bg-amber-50 border-amber-100',
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/30 border border-gray-100 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-inner">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Quick Actions</h3>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Fast Navigation</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            id={`quick-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center"
          >
            <div
              className={`w-14 h-14 ${action.color} border rounded-[1.25rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner`}
            >
              {action.icon}
            </div>
            <p className="text-sm font-bold text-gray-900">{action.title}</p>
            <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-1">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
