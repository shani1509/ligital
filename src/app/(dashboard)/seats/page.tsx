'use client';

import { useState } from 'react';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Seats</h1>
        <p className="mt-1 text-sm text-gray-500">Visual overview of your library&apos;s seating arrangement.</p>
      </div>

      {/* Summary Bar */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-[#E8F5E9] px-4 py-2.5">
          <div className="h-3 w-3 rounded-full bg-[#4CAF50]" />
          <span className="text-sm font-medium text-[#1B5E20]">Available: {available}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5">
          <div className="h-3 w-3 rounded-full bg-gray-400" />
          <span className="text-sm font-medium text-gray-600">Occupied: {occupied}</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5">
          <span className="text-sm font-medium text-blue-700">Total: {total}</span>
        </div>
      </div>

      {/* Seat Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C8E6C9] border-t-[#1B5E20]" />
        </div>
      ) : (
        <Card>
          <div className="p-6">
            <div className="grid grid-cols-5 gap-3 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
              {(seats ?? [])
                .sort((a, b) => a.seatNumber - b.seatNumber)
                .map((seat) => (
                  <button
                    key={seat.id}
                    id={`seat-${seat.seatNumber}`}
                    onClick={() => setSelectedSeat(seat)}
                    className={`group relative flex h-16 w-full flex-col items-center justify-center rounded-xl border-2 text-sm font-semibold transition-all hover:scale-105 hover:shadow-md ${
                      seat.status === 'AVAILABLE'
                        ? 'border-[#C8E6C9] bg-[#E8F5E9] text-[#1B5E20] hover:border-[#4CAF50] hover:bg-[#C8E6C9]'
                        : 'border-gray-200 bg-gray-100 text-gray-500 hover:border-gray-300 hover:bg-gray-200'
                    }`}
                    title={
                      seat.student
                        ? `Seat #${seat.seatNumber} — ${seat.student.name}`
                        : `Seat #${seat.seatNumber} — Available`
                    }
                  >
                    <span className="text-xs opacity-60">#{seat.seatNumber}</span>
                    {seat.status === 'AVAILABLE' ? (
                      <svg className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Seat Detail Modal */}
      {selectedSeat && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSeat(null)}
          title={`Seat #${selectedSeat.seatNumber}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={selectedSeat.status === 'AVAILABLE' ? 'success' : 'default'}>
                {selectedSeat.status}
              </Badge>
            </div>

            {selectedSeat.student ? (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="text-sm font-semibold text-gray-700">Occupied by</h4>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F5E9] text-sm font-bold text-[#1B5E20]">
                    {selectedSeat.student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedSeat.student.name}</p>
                    <p className="text-sm text-gray-500">{selectedSeat.student.phone}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">This seat is available for assignment.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelectedSeat(null)}>Close</Button>
            {selectedSeat.student && (
              <Button variant="danger" onClick={handleRelease} loading={mutating}>
                Release Seat
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
