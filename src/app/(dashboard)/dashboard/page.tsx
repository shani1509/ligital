'use client';

import { useFetch } from '@/hooks/useFetch';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import SeatOccupancy from '@/components/dashboard/SeatOccupancy';
import RecentStudents from '@/components/dashboard/RecentStudents';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import QuickActions from '@/components/dashboard/QuickActions';
import Link from 'next/link';
import { Users, UserCheck, AlertTriangle, UserX, Download, Plus } from 'lucide-react';
import type { DashboardStats, ChartDataPoint, AlertItem } from '@/types';

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useFetch<DashboardStats>('/api/dashboard/stats');
  const { data: chartData, loading: chartLoading } = useFetch<ChartDataPoint[]>('/api/dashboard/chart');
  const { data: alerts, loading: alertsLoading } = useFetch<AlertItem[]>('/api/dashboard/alerts');

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in pb-16 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">
            Monitor your library's pulse. Key metrics, revenue, and active alerts at a glance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button
            id="btn-import-data"
            disabled
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-6 py-3.5 text-sm font-bold text-gray-400 cursor-not-allowed shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <Link
            href="/students/add"
            id="btn-add-student-top"
            className="inline-flex items-center justify-center gap-2 bg-[#1B5E20] hover:bg-[#124116] shadow-lg shadow-green-900/20 hover:-translate-y-0.5 transition-all px-6 py-3.5 rounded-xl font-bold text-white"
          >
            <Plus className="w-5 h-5" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents ?? 0}
            trend="12% from last month"
            icon={<Users className="w-6 h-6 md:w-8 md:h-8" />}
            variant="primary"
            loading={statsLoading}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <StatsCard
            title="Active Students"
            value={stats?.activeStudents ?? 0}
            trend="Currently active"
            icon={<UserCheck className="w-6 h-6 md:w-8 md:h-8" />}
            loading={statsLoading}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <StatsCard
            title="Expiring Soon"
            value={stats?.expiringSoon ?? 0}
            trend="Within 7 days"
            trendUp={false}
            icon={<AlertTriangle className="w-6 h-6 md:w-8 md:h-8" />}
            loading={statsLoading}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <StatsCard
            title="Expired Students"
            value={stats?.expiredStudents ?? 0}
            trend="Need renewal"
            trendUp={false}
            icon={<UserX className="w-6 h-6 md:w-8 md:h-8" />}
            loading={statsLoading}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <RevenueChart data={chartData ?? []} loading={chartLoading} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <AlertsPanel alerts={alerts ?? []} loading={alertsLoading} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
          <RecentStudents />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <SeatOccupancy
            occupied={stats?.occupiedSeats ?? 0}
            total={stats?.totalSeats ?? 0}
            loading={statsLoading}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.45s' }}>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
