'use client';

import React from 'react';
import { Armchair } from 'lucide-react';

export default function SeatOccupancy({
  occupied,
  total,
  loading = false,
}: {
  occupied: number;
  total: number;
  loading?: boolean;
}) {
  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;
  
  // SVG properties
  const size = 180;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/30 border border-gray-100 h-full relative overflow-hidden flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shadow-inner">
          <Armchair className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Seat Occupancy</h3>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Status</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          {/* Background Circle */}
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className="text-gray-100"
            />
            {/* Progress Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-[#1B5E20] transition-all duration-1000 ease-out drop-shadow-md"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-gray-900 tracking-tighter">
              {percentage}%
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              Filled
            </span>
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4 w-full px-4">
          <div className="text-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Occupied</p>
            <p className="text-2xl font-black text-gray-900">{occupied}</p>
          </div>
          <div className="text-center p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Available</p>
            <p className="text-2xl font-black text-emerald-700">{total - occupied}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
