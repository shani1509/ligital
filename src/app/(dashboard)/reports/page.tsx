'use client';

import { useFetch } from '@/hooks/useFetch';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Wallet, Calendar, Users, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface ReportData {
  totalStudents: number;
  activeStudents: number;
  expiringSoon: number;
  expiredStudents: number;
  totalSeats: number;
  occupiedSeats: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function ReportsPage() {
  const { data, loading } = useFetch<ReportData>('/api/dashboard/stats');

  // Generate mock monthly data for display since we only have aggregate stats
  const monthlyData = [
    { month: 'Jan', revenue: 0 },
    { month: 'Feb', revenue: 0 },
    { month: 'Mar', revenue: 0 },
    { month: 'Apr', revenue: 0 },
    { month: 'May', revenue: 0 },
    { month: 'Jun', revenue: 0 },
    { month: 'Jul', revenue: data?.monthlyRevenue ?? 0 },
  ];

  const subscriptionPieData = [
    { name: 'Active Subscriptions', value: data?.activeStudents ?? 0, color: '#10B981' }, // Emerald 500
    { name: 'Expired Subscriptions', value: data?.expiredStudents ?? 0, color: '#F43F5E' }, // Rose 500
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"/>
        <p className="text-gray-500 font-medium animate-pulse">Generating reports...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* 1. Page Header */}
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Reports & Analytics</h1>
        <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">Deep dive into your library's revenue, subscription health, and overall growth metrics.</p>
      </div>

      {/* 2. Revenue Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Revenue */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Wallet className="w-7 h-7" />
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">All-Time</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
              {formatCurrency(data?.totalRevenue ?? 0)}
            </p>
          </div>
        </div>

        {/* This Month */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <Calendar className="w-7 h-7" />
            </div>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Current Month</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Monthly Revenue</p>
            <p className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
              {formatCurrency(data?.monthlyRevenue ?? 0)}
            </p>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 group sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <Users className="w-7 h-7" />
            </div>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Live</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Active Students</p>
            <p className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter">
              {data?.activeStudents ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-600 shadow-inner">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Revenue Trajectory</h3>
              <p className="text-sm text-gray-500 font-medium">Monthly gross revenue trends.</p>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }} 
                  tickFormatter={(v) => `₹${v / 100}`} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: '#F9FAFB' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '12px 16px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="#10B981" 
                  radius={[8, 8, 0, 0]} 
                  barSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Status Pie */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-600 shadow-inner">
              <PieChartIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Subscription Health</h3>
              <p className="text-sm text-gray-500 font-medium">Active vs Expired student ratios.</p>
            </div>
          </div>
          
          <div className="h-[320px] w-full">
            {subscriptionPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationDuration={1500}
                  >
                    {subscriptionPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.1))' }} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-gray-700 font-semibold ml-1">{value}</span>}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontWeight: 'bold',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ color: '#111827' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <PieChartIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">No subscription data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
