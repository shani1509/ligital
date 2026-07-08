'use client';

import React from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, ShieldAlert } from 'lucide-react';
import type { AlertItem } from '@/types';
import { cn } from '@/lib/utils';

export default function AlertsPanel({
  alerts,
  loading = false,
}: {
  alerts: AlertItem[];
  loading?: boolean;
}) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'danger':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'SUCCESS':
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 border-amber-100';
      case 'danger': return 'bg-red-50 border-red-100';
      case 'SUCCESS': return 'bg-emerald-50 border-emerald-100';
      case 'INFO':
      default: return 'bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/30 border border-gray-100 h-full relative overflow-hidden flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shadow-inner">
          <Bell className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">System Alerts</h3>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Action Required</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <CheckCircle className="h-10 w-10 text-gray-300 mb-3" />
            <p className="text-gray-500 font-bold">All caught up!</p>
            <p className="text-xs text-gray-400 mt-1">No pending alerts at this time.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors group"
            >
              <div className={cn("mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border shadow-sm", getBgColor(alert.type))}>
                {getIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                  {alert.studentName} — {alert.planName}
                </p>
                <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {alert.daysRemaining <= 0 
                    ? `Expired on ${new Date(alert.expiryDate).toLocaleDateString()}`
                    : `Expires in ${alert.daysRemaining} days`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
