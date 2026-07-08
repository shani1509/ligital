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
  X,
  Sparkles,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Library
} from 'lucide-react';
import { PLATFORM_PLANS } from '@/lib/utils';

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

  // Determine styles based on billing status
  const libraryStatus = billing?.library.status ?? 'TRIAL';
  const isTrial = libraryStatus === 'TRIAL';
  const isExpired = libraryStatus === 'EXPIRED' || billing?.status === 'EXPIRED';
  const isActive = billing?.status === 'ACTIVE' && (libraryStatus === 'ACTIVE' || libraryStatus === 'TRIAL');

  let cardGradient = 'from-[#0B3D1B] to-[#1B5E20]'; // Active
  if (isTrial) cardGradient = 'from-indigo-900 to-indigo-600';
  if (isExpired) cardGradient = 'from-red-900 to-red-700';

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full animate-fade-in pb-12 font-sans">
      
      {/* ── A. Header Section ──────────────────────────────── */}
      <div className="bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group">
        {/* Decorative subtle background circle */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-emerald-50/50 blur-3xl group-hover:bg-emerald-100/50 transition-colors duration-700 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
          {/* Logo Placeholder with Hover */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg overflow-hidden cursor-pointer group/logo">
            <Library className="w-10 h-10 text-emerald-700 group-hover/logo:scale-110 group-hover/logo:opacity-0 transition-all duration-300" />
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300">
              <Camera className="w-6 h-6 text-white mb-1" />
              <span className="text-[10px] text-white font-bold uppercase tracking-wider text-center px-1">Update</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 break-words tracking-tight">{user?.library.name || 'My Library'}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold tracking-wide border border-gray-200">
                ID: {user?.library.id.split('-')[0]}
              </span>
              <span className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" /> {user?.library.address.split(',')[0]}
              </span>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-xl shadow-sm hover:shadow-md relative z-10" variant="secondary">
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ── B. Library Information Card ──────────────────────── */}
        <div className="lg:col-span-2">
          <Card className="h-full rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 p-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="w-6 h-6 text-emerald-600" /> Library Details
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="group p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 opacity-70 group-hover:opacity-100 transition-opacity"/> Owner Name
                </p>
                <p className="text-base font-semibold text-gray-900 break-words">{user?.name}</p>
              </div>
              <div className="group p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-600 opacity-70 group-hover:opacity-100 transition-opacity"/> Email
                </p>
                <p className="text-base font-semibold text-gray-900 break-all">{user?.email}</p>
              </div>
              <div className="group p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 opacity-70 group-hover:opacity-100 transition-opacity"/> Contact
                </p>
                <p className="text-base font-semibold text-gray-900">{user?.library.phone}</p>
              </div>
              <div className="md:col-span-2 lg:col-span-1 group p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 opacity-70 group-hover:opacity-100 transition-opacity"/> Address
                </p>
                <p className="text-base font-semibold text-gray-900 break-words leading-relaxed">{user?.library.address}</p>
              </div>
              <div className="group p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 opacity-70 group-hover:opacity-100 transition-opacity"/> Max Capacity
                </p>
                <p className="text-base font-semibold text-gray-900">{user?.library.maxCapacity} Seats</p>
              </div>
              <div className="group p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                <p className="text-xs text-gray-500 font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600 opacity-70 group-hover:opacity-100 transition-opacity"/> Registered
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {user?.library.createdAt ? new Date(user.library.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ── C. Subscription Overview Card (Glassmorphism) ────────────── */}
        <div className="h-full">
          <div className={`relative h-full overflow-hidden rounded-[2rem] shadow-2xl bg-gradient-to-br ${cardGradient} text-white transition-all duration-500 group flex flex-col`}>
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all duration-700 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl pointer-events-none"></div>

            <div className="relative z-10 p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-8 border-b border-white/20 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-white/90" /> Plan Overview
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20 backdrop-blur-md ${
                  isExpired ? 'bg-red-500/30 text-red-100' : isTrial ? 'bg-indigo-400/30 text-indigo-100' : 'bg-emerald-400/30 text-emerald-100'
                }`}>
                  {isExpired ? 'Expired' : isTrial ? 'Trial' : 'Active'}
                </span>
              </div>

              {billingLoading ? (
                <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"/></div>
              ) : (
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {isTrial ? <Sparkles className="w-6 h-6 text-indigo-300" /> : <Crown className="w-6 h-6 text-emerald-300" />}
                      <h3 className="text-3xl font-black tracking-tight capitalize">
                        {isTrial ? 'Free Trial' : billing?.planType.toLowerCase() + ' Plan'}
                      </h3>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mt-6 mb-6">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Time Remaining</p>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-black ${isLowDays && !isExpired ? 'text-red-300' : 'text-white'}`}>
                              {isExpired ? 0 : daysLeft}
                            </span>
                            <span className="text-base font-medium text-white/80">days</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-white/70 uppercase tracking-wider mb-1">Expires On</p>
                          <p className="text-lg font-semibold">
                            {billing?.endDate ? new Date(billing.endDate).toLocaleDateString() : (user?.library.trialEndsAt ? new Date(user.library.trialEndsAt).toLocaleDateString() : 'N/A')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Link href="/billing" className="mt-4 w-full flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-50 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    {isExpired ? 'Recharge Now' : 'Manage Subscription'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── D. Library Statistics Card ───────────────────────── */}
      <Card className="rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/30 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4 flex items-center gap-3">
          <Library className="w-6 h-6 text-emerald-600" /> Real-time Statistics
        </h2>
        {statsLoading ? (
          <div className="py-12 flex justify-center"><div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="p-5 border border-emerald-100/50 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Students</p>
              <p className="text-3xl sm:text-4xl font-black text-[#1B5E20]">{stats?.totalStudents || 0}</p>
            </div>
            <div className="p-5 border border-indigo-100/50 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Students</p>
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-700">{stats?.activeStudents || 0}</p>
            </div>
            <div className="p-5 border border-amber-100/50 rounded-2xl bg-amber-50/50 hover:bg-amber-50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Total Seats</p>
              <p className="text-3xl sm:text-4xl font-black text-amber-700">{stats?.totalSeats || 0}</p>
            </div>
            <div className="p-5 border border-rose-100/50 rounded-2xl bg-rose-50/50 hover:bg-rose-50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Occupied</p>
                <Users className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-rose-700">{stats?.occupiedSeats || 0}</p>
            </div>
            <div className="p-5 border border-teal-100/50 rounded-2xl bg-teal-50/50 hover:bg-teal-50 transition-colors duration-300 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Available</p>
              <p className="text-3xl sm:text-4xl font-black text-teal-700">{(stats?.totalSeats || 0) - (stats?.occupiedSeats || 0)}</p>
            </div>
          </div>
        )}
      </Card>

      {/* ── Edit Library Modal ─────────────────────────────── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh] border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Profile</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
              {msg.text && (
                <div className={`rounded-xl p-4 text-sm font-medium flex items-center gap-3 ${msg.type === 'success' ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                  {msg.text}
                </div>
              )}
              
              <div className="flex justify-center mb-8">
                <div className="relative group w-28 h-28 bg-white rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer overflow-hidden shadow-sm hover:border-emerald-500 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col items-center">
                    <Camera className="w-8 h-8 text-gray-400 mb-2 group-hover:text-emerald-500 transition-colors" />
                    <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider group-hover:text-emerald-600 transition-colors">Update Logo</span>
                  </div>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  id="edit-library-name"
                  label="Library Name"
                  value={formData.libraryName}
                  onChange={(e) => setFormData({ ...formData, libraryName: e.target.value })}
                  required
                  className="bg-white"
                />
                <Input
                  id="edit-library-address"
                  label="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  className="bg-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    id="edit-library-phone"
                    label="Contact Number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="bg-white"
                  />
                  <Input
                    id="edit-library-email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    className="bg-white"
                  />
                </div>
                <Input
                  id="edit-library-capacity"
                  label="Maximum Capacity (Seats)"
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="bg-white"
                />
              </div>

              <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4 w-full">
                <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold">
                  Cancel
                </Button>
                <Button type="submit" loading={saving} className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold bg-emerald-700 hover:bg-emerald-800 shadow-md">
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
