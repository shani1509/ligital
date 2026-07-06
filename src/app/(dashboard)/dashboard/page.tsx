'use client';

import { useFetch } from '@/hooks/useFetch';
import StatsCard from '@/components/dashboard/StatsCard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import SeatOccupancy from '@/components/dashboard/SeatOccupancy';
import RecentStudents from '@/components/dashboard/RecentStudents';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import QuickActions from '@/components/dashboard/QuickActions';
import Link from 'next/link';
import Image from 'next/image';
import type { DashboardStats, ChartDataPoint, AlertItem } from '@/types';

export default function DashboardPage() {
  const { data: stats, loading: statsLoading } = useFetch<DashboardStats>('/api/dashboard/stats');
  const { data: chartData, loading: chartLoading } = useFetch<ChartDataPoint[]>('/api/dashboard/chart');
  const { data: alerts, loading: alertsLoading } = useFetch<AlertItem[]>('/api/dashboard/alerts');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your library with ease.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/students/add"
            id="btn-add-student-top"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1B5E20] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#2E7D32] hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Student
          </Link>
          <button
            id="btn-import-data"
            disabled
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-400 cursor-not-allowed"
          >
            Import Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents ?? 0}
            trend="Increased from last month"
            icon={<Image alt="Total Students" className="inline-block flex-shrink-0" height={24} src="/total.png" width={24}/>}
            variant="primary"
            loading={statsLoading}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <StatsCard
            title="Active Students"
            value={stats?.activeStudents ?? 0}
            trend="Currently active"
            icon={<Image alt="Active Students" className="inline-block flex-shrink-0" height={24} src="/active.png" width={24}/>}
            loading={statsLoading}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <StatsCard
            title="Expiring Soon"
            value={stats?.expiringSoon ?? 0}
            trend="Within 7 days"
            icon={<Image alt="Expiring Soon" className="inline-block flex-shrink-0" height={24} src="/alert3.png" width={24}/>}
            loading={statsLoading}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <StatsCard
            title="Expired Students"
            value={stats?.expiredStudents ?? 0}
            trend="Need renewal"
            icon={<Image alt="Expired Students" className="inline-block flex-shrink-0" height={24} src="/expired.png" width={24}/>}
            loading={statsLoading}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <RevenueChart data={chartData ?? []} loading={chartLoading} />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <AlertsPanel alerts={alerts ?? []} loading={alertsLoading} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
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
