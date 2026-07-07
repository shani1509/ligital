'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import { UserPlus, FilePlus, BarChart3, LayoutGrid } from 'lucide-react';

const actions = [
  {
    title: 'Add Student',
    description: 'Register a new student',
    icon: <UserPlus className="w-5 h-5 text-green-700"/>,
    href: '/students/add',
    color: 'bg-green-100',
  },
  {
    title: 'Create Plan',
    description: 'Set up a subscription plan',
    icon: <FilePlus className="w-5 h-5 text-blue-700"/>,
    href: '/plans',
    color: 'bg-blue-50',
  },
  {
    title: 'View Reports',
    description: 'Analyze your library data',
    icon: <BarChart3 className="w-5 h-5 text-purple-700"/>,
    href: '/reports',
    color: 'bg-purple-50',
  },
  {
    title: 'Manage Seats',
    description: 'Assign and release seats',
    icon: <LayoutGrid className="w-5 h-5 text-amber-700"/>,
    href: '/seats',
    color: 'bg-amber-50',
  },
];

export default function QuickActions() {
  return (
    <Card className="animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            id={`quick-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="p-3 rounded-xl border border-gray-100 hover:border-[#C8E6C9] hover:shadow-md transition-all duration-200 group"
          >
            <div
              className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
            >
              {action.icon}
            </div>
            <p className="text-sm font-semibold text-gray-900">{action.title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
