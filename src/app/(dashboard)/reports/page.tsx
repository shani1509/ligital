'use client';

import { useFetch } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

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

const COLORS = ['#1B5E20', '#4CAF50', '#81C784', '#C8E6C9', '#E8F5E9'];
const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#4CAF50',
  EXPIRED: '#EF4444',
  CANCELLED: '#9CA3AF',
};

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
    { name: 'Active', value: data?.activeStudents ?? 0, color: '#4CAF50' },
    { name: 'Expired', value: data?.expiredStudents ?? 0, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C8E6C9] border-t-[#1B5E20]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Revenue reports and subscription analytics.</p>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Card>
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <p className="mt-2 text-3xl font-bold text-[#1B5E20]">
              {formatCurrency(data?.totalRevenue ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">All-time earnings</p>
          </div>
        </Card>
        <Card>
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500">This Month</p>
            <p className="mt-2 text-3xl font-bold text-[#4CAF50]">
              {formatCurrency(data?.monthlyRevenue ?? 0)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Current month revenue</p>
          </div>
        </Card>
        <Card>
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
            <p className="mt-2 text-3xl font-bold text-[#2E7D32]">
              {data?.activeStudents ?? 0}
            </p>
            <p className="mt-1 text-xs text-gray-400">Currently active</p>
          </div>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card>
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Monthly Revenue</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(v) => `₹${v / 100}`} />
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
                  />
                  <Bar dataKey="revenue" fill="#4CAF50" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>

        {/* Subscription Status Pie */}
        <Card>
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Subscription Analytics</h3>
            <div className="h-[300px]">
              {subscriptionPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {subscriptionPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No subscription data yet
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
