'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { AlertItem } from '@/types';

interface AlertsPanelProps {
  alerts: AlertItem[];
  loading?: boolean;
}

export default function AlertsPanel({ alerts, loading }: AlertsPanelProps) {
  if (loading) {
    return (
      <Card className="animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Expiring Soon</h3>
        <div className="h-[200px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C8E6C9] border-t-[#4CAF50] rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">⚠️ Expiring Soon</h3>
        {alerts.length > 0 && (
          <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">
            {alerts.length} alerts
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-3xl mb-2 block">✅</span>
          <p className="text-sm text-gray-400">No expiring subscriptions</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[300px] overflow-y-auto">
          {alerts.map((alert) => (
            <li
              key={alert.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-xl border',
                alert.type === 'danger'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              )}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">
                {alert.type === 'danger' ? '🔴' : '🟡'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {alert.studentName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {alert.planName}
                </p>
                <p
                  className={cn(
                    'text-xs font-semibold mt-1',
                    alert.type === 'danger' ? 'text-red-600' : 'text-yellow-700'
                  )}
                >
                  Expires in {alert.daysRemaining} day{alert.daysRemaining !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer',
                  alert.type === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                )}
              >
                Renew
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
