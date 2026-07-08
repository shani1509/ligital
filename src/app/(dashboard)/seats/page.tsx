'use client';

import { useState } from 'react';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import { X, UserCircle, Phone, CheckCircle2, AlertTriangle, Info, Grid3X3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatData {
  id: string;
  seatNumber: number;
  status: 'AVAILABLE' | 'OCCUPIED';
  student: {
    id: string;
    name: string;
    phone: string;
    status: string;
  } | null;
}

export default function SeatsPage() {
  const { data: seats, loading, refetch } = useFetch<SeatData[]>('/api/seats');
  const { mutate, loading: mutating } = useMutation();
  const [selectedSeat, setSelectedSeat] = useState<SeatData | null>(null);

  const available = (seats ?? []).filter((s) => s.status === 'AVAILABLE').length;
  const occupied = (seats ?? []).filter((s) => s.status === 'OCCUPIED').length;
  const total = (seats ?? []).length;

  const handleRelease = async () => {
    if (!selectedSeat) return;
    const result = await mutate(`/api/seats/${selectedSeat.id}/release`, 'PATCH');
    if (result.success) {
      setSelectedSeat(null);
      refetch();
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Seat Management</h1>
          <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">Live visual overview and control of your library's physical seating arrangement.</p>
        </div>
        
        {/* Summary Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-sm font-bold text-emerald-800">Available <span className="ml-1 bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full text-xs">{available}</span></span>
          </div>
          <div className="flex items-center gap-2.5 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            <span className="text-sm font-bold text-indigo-800">Occupied <span className="ml-1 bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full text-xs">{occupied}</span></span>
          </div>
          <div className="flex items-center gap-2.5 rounded-full bg-gray-50 border border-gray-200 px-4 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <span className="text-sm font-bold text-gray-700">Total Seats <span className="ml-1 bg-gray-200 text-gray-900 px-2 py-0.5 rounded-full text-xs">{total}</span></span>
          </div>
        </div>
      </div>

      {/* 2. Seat Grid */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 overflow-hidden relative group">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-colors duration-700 group-hover:bg-emerald-100/50"></div>
        
        <div className="relative z-10 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-600 shadow-inner">
              <Grid3X3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Live Floor Plan</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"/>
              <p className="text-gray-500 font-medium animate-pulse">Loading seat configuration...</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 md:gap-5">
              {(seats ?? [])
                .sort((a, b) => a.seatNumber - b.seatNumber)
                .map((seat) => {
                  const isAvailable = seat.status === 'AVAILABLE';
                  return (
                    <button
                      key={seat.id}
                      id={`seat-${seat.seatNumber}`}
                      onClick={() => setSelectedSeat(seat)}
                      className={cn(
                        "relative flex flex-col items-center justify-center aspect-square rounded-2xl border-2 font-bold transition-all duration-300 shadow-sm",
                        "hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4",
                        isAvailable 
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-emerald-200/50 focus:ring-emerald-500/20" 
                          : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-500 hover:bg-indigo-100 hover:shadow-indigo-200/50 focus:ring-indigo-500/20"
                      )}
                      title={seat.student ? `Seat #${seat.seatNumber} — Occupied by ${seat.student.name}` : `Seat #${seat.seatNumber} — Available`}
                    >
                      <span className="text-2xl tracking-tighter mb-1">{seat.seatNumber}</span>
                      {isAvailable ? (
                        <CheckCircle2 className="w-4 h-4 opacity-80" />
                      ) : (
                        <UserCircle className="w-4 h-4 opacity-80" />
                      )}
                      
                      {/* Sub-badge indicating status visually on hover */}
                      <div className={cn(
                        "absolute -bottom-2 -right-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm opacity-0 scale-50 transition-all duration-300",
                        "group-hover:opacity-100 group-hover:scale-100", // Would need group on button, but we use pseudo-hover here, so standard hover is fine
                        // To make it work with standard tailwind, we'll just show it on button hover
                        "peer-hover:opacity-100", // Alternative is custom CSS, let's keep it simple
                        isAvailable ? "bg-emerald-500" : "bg-indigo-500"
                      )} style={{ opacity: 1, transform: 'scale(1)' }}> {/* Force visible for now as it looks good */}
                        {isAvailable ? <CheckCircle2 className="w-3 h-3 text-white" /> : <UserCircle className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Seat Detail Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center font-black text-gray-900 shadow-sm">
                  #{selectedSeat.seatNumber}
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Seat Details</h2>
              </div>
              <button onClick={() => setSelectedSeat(null)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              {/* Status Banner */}
              <div className={cn(
                "rounded-2xl p-4 flex items-center gap-3 border",
                selectedSeat.status === 'AVAILABLE' 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : "bg-indigo-50 border-indigo-100 text-indigo-800"
              )}>
                {selectedSeat.status === 'AVAILABLE' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertTriangle className="w-6 h-6 shrink-0" />}
                <div>
                  <p className="font-bold uppercase tracking-wider text-xs opacity-80 mb-0.5">Current Status</p>
                  <p className="font-black text-lg">{selectedSeat.status}</p>
                </div>
              </div>

              {/* Occupied By Section */}
              {selectedSeat.student ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <UserCircle className="w-4 h-4" /> Assigned Student
                  </h4>
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 border border-indigo-100 text-xl font-black text-indigo-700 shadow-inner shrink-0">
                        {selectedSeat.student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 text-lg truncate mb-1">{selectedSeat.student.name}</p>
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="truncate">{selectedSeat.student.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                    <Info className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-emerald-800 font-bold">Ready for Assignment</p>
                  <p className="text-sm text-emerald-600/80 mt-1">This seat is currently empty and can be assigned to a new or existing student.</p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="secondary" onClick={() => setSelectedSeat(null)} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold">
                Close View
              </Button>
              {selectedSeat.student && (
                <Button 
                  variant="danger" 
                  onClick={handleRelease} 
                  loading={mutating}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                >
                  Release Seat
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
