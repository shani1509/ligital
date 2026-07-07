'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFetch, useMutation } from '@/hooks/useFetch';
import type { DashboardStats, BillingInfo } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  CalendarDays,
  CreditCard,
  Camera,
  X
} from 'lucide-react';

export default function MyLibraryPage() {
  const { user, refreshUser } = useAuth();
  
  // Fetch Stats and Billing
  const { data: stats, loading: statsLoading } = useFetch<DashboardStats>('/api/dashboard/stats');
  const { data: billing, loading: billingLoading } = useFetch<BillingInfo>('/api/billing');
  const { mutate: mutateProfile, loading: saving } = useMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    libraryName: '',
    address: '',
    phone: '',
    email: '',
    maxCapacity: 0,
  });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        libraryName: user.library.name,
        address: user.library.address,
        phone: user.library.phone,
        email: user.email,
        maxCapacity: user.library.maxCapacity,
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    
    // Using existing profile PUT endpoint
    const result = await mutateProfile('/api/settings/profile', 'PUT', {
      libraryName: formData.libraryName.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      // Note: Backend might not support capacity/email/logo yet, but we send what's supported.
    });

    if (result.success) {
      setMsg({ type: 'success', text: 'Library updated successfully!' });
      await refreshUser();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setMsg({ type: '', text: '' });
      }, 1500);
    } else {
      setMsg({ type: 'error', text: result.message || 'Failed to update library' });
    }
  };

  const getDaysLeft = () => {
    if (!billing) return 0;
    const end = new Date(billing.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };
  const daysLeft = getDaysLeft();
  const isLowDays = daysLeft <= 7;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-10">
      
      {/* ── A. Header Section ──────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Logo Placeholder with Hover */}
          <div className="relative group w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 overflow-hidden cursor-pointer">
            <Building2 className="w-8 h-8 text-gray-400 group-hover:opacity-0 transition-opacity" />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-5 h-5 text-white mb-1" />
              <span className="text-[9px] text-white font-medium uppercase tracking-wider text-center px-1">Upload</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">{user?.library.name || 'My Library'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Library ID: {user?.library.id.split('-')[0]}</p>
          </div>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto" variant="secondary">
          Edit Library
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── B. Library Information Card ──────────────────────── */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b pb-3">Library Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Owner Name</p>
                <p className="text-sm font-semibold text-gray-900 break-words">{user?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5"><Mail className="w-3.5 h-3.5"/> Email</p>
                <p className="text-sm font-semibold text-gray-900 break-all">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5"><Phone className="w-3.5 h-3.5"/> Contact Number</p>
                <p className="text-sm font-semibold text-gray-900">{user?.library.phone}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-1">
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5"/> Address</p>
                <p className="text-sm font-semibold text-gray-900 break-words">{user?.library.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Max Capacity</p>
                <p className="text-sm font-semibold text-gray-900">{user?.library.maxCapacity} Seats</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wider flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5"/> Registration Date</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user?.library.createdAt ? new Date(user.library.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── C. Subscription Overview Card ────────────────────── */}
        <Card className="h-full bg-gradient-to-br from-green-50 to-white border-green-100 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b border-green-200 pb-3 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-700" /> Subscription
          </h2>
          {billingLoading ? (
            <div className="flex-1 flex items-center justify-center"><div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin"/></div>
          ) : (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 font-medium">Current Plan</p>
                  <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {billing?.status === 'ACTIVE' ? 'Active' : billing?.library.status === 'TRIAL' ? 'Trial' : 'Expired'}
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 capitalize mb-4">
                  {billing?.library.status === 'TRIAL' ? 'Free Trial' : billing?.planType.toLowerCase()}
                </p>

                <div className="flex items-end gap-2 mb-2">
                  <span className={`text-4xl font-black ${isLowDays ? 'text-red-500' : 'text-green-700'}`}>
                    {daysLeft}
                  </span>
                  <span className="text-sm text-gray-500 font-medium pb-1 flex-1">Days Left</span>
                </div>
                <p className="text-xs text-gray-500">
                  Expires: <span className="font-semibold">{billing?.endDate ? new Date(billing.endDate).toLocaleDateString() : (user?.library.trialEndsAt ? new Date(user.library.trialEndsAt).toLocaleDateString() : 'N/A')}</span>
                </p>
              </div>
              <Link href="/billing" className="mt-6 w-full text-center bg-green-700 hover:bg-green-800 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm shadow-sm hover:shadow-md block">
                Renew Subscription
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* ── D. Library Statistics Card ───────────────────────── */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-5 border-b pb-3">Library Statistics</h2>
        {statsLoading ? (
          <div className="py-8 flex justify-center"><div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="p-2 sm:p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1B5E20]">{stats?.totalStudents || 0}</p>
            </div>
            <div className="p-2 sm:p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium mb-1">Active Students</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1B5E20]">{stats?.activeStudents || 0}</p>
            </div>
            <div className="p-2 sm:p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Seats</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1B5E20]">{stats?.totalSeats || 0}</p>
            </div>
            <div className="p-2 sm:p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium mb-1">Occupied Seats</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1B5E20]">{stats?.occupiedSeats || 0}</p>
            </div>
            <div className="p-2 sm:p-4 border border-gray-100 rounded-lg bg-gray-50/50">
              <p className="text-xs text-gray-500 font-medium mb-1">Available Seats</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#1B5E20]">{(stats?.totalSeats || 0) - (stats?.occupiedSeats || 0)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* ── Edit Library Modal ─────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Edit Library Details</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              {msg.text && (
                <div className={`rounded-lg p-3 text-sm ${msg.type === 'success' ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {msg.text}
                </div>
              )}
              
              <div className="flex justify-center mb-6">
                <div className="relative group w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border border-dashed border-gray-300 cursor-pointer overflow-hidden">
                  <div className="flex flex-col items-center">
                    <Camera className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-[10px] text-gray-500 font-medium">Change Logo</span>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              <Input
                id="edit-library-name"
                label="Library Name"
                value={formData.libraryName}
                onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                required
              />
              <Input
                id="edit-library-address"
                label="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="edit-library-phone"
                  label="Contact Number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
                <Input
                  id="edit-library-email"
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  type="email"
                />
              </div>
              <Input
                id="edit-library-capacity"
                label="Maximum Capacity (Seats)"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                min={0}
              />

              <div className="pt-4 border-t mt-6 flex flex-col sm:flex-row justify-end gap-3 w-full">
                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
