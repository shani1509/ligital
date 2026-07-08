'use client';

import { useState } from 'react';
import { useMutation } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock, Bell, Shield, AlertTriangle, ExternalLink, X, CheckCircle2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { mutate: mutatePassword, loading: passwordLoading } = useMutation();

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  // Preferences State
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    const result = await mutatePassword('/api/settings/password', 'PUT', {
      currentPassword,
      newPassword,
    });
    if (result.success) {
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setPasswordMsg({ type: '', text: '' });
      }, 1500);
    } else {
      setPasswordMsg({ type: 'error', text: result.message || 'Failed to change password' });
    }
  };

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setPasswordMsg({ type: '', text: '' });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10 animate-fade-in pb-16 font-sans">
      {/* 1. Page Layout & Header */}
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">Manage your account security, notification preferences, and legal agreements.</p>
      </div>

      <div className="flex flex-col space-y-8">
        
        {/* 2. Security Section Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between mb-2">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Security Details</h2>
                <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
              </div>
            </div>
            <Button className="px-6 py-3 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all w-full sm:w-auto" onClick={() => setIsPasswordModalOpen(true)}>
              Update Password
            </Button>
          </div>
        </div>

        {/* 3. Notifications Section Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-8 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Control how and when you receive alerts from Ligital.</p>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-6 group/toggle p-4 -mx-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setEmailEnabled(!emailEnabled)}>
              <div>
                <p className="text-base font-bold text-gray-900 mb-1">Email Notifications</p>
                <p className="text-sm text-gray-500 leading-relaxed">Receive renewal reminders and student expiry alerts directly in your inbox.</p>
              </div>
              <button 
                type="button" 
                className={cn(
                  "relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner",
                  emailEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out",
                  emailEnabled ? 'translate-x-6' : 'translate-x-0'
                )} />
              </button>
            </div>
            
            <div className="flex items-center justify-between gap-6 group/toggle p-4 -mx-4 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSmsEnabled(!smsEnabled)}>
              <div>
                <p className="text-base font-bold text-gray-900 mb-1">WhatsApp / SMS Alerts</p>
                <p className="text-sm text-gray-500 leading-relaxed">Receive instant status updates and critical alerts on your registered mobile number.</p>
              </div>
              <button 
                type="button" 
                className={cn(
                  "relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none shadow-inner",
                  smsEnabled ? 'bg-emerald-500' : 'bg-gray-300'
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out",
                  smsEnabled ? 'translate-x-6' : 'translate-x-0'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Privacy & Legal Section Card */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group">
          <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Privacy & Legal</h2>
              <p className="text-sm text-gray-500">Review our terms of service and privacy agreements.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/privacy" className="flex-1 flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors group/link">
              <span className="font-bold text-gray-700 group-hover/link:text-gray-900">Privacy Policy</span>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover/link:text-gray-900" />
            </Link>
            <Link href="/terms" className="flex-1 flex items-center justify-between p-5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors group/link">
              <span className="font-bold text-gray-700 group-hover/link:text-gray-900">Terms & Conditions</span>
              <ExternalLink className="w-5 h-5 text-gray-400 group-hover/link:text-gray-900" />
            </Link>
          </div>
        </div>

        {/* 5. Danger Zone */}
        <div className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-red-200/40 border-2 border-red-100 bg-gradient-to-br from-white to-red-50 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-red-200/60 group">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0 shadow-inner group-hover:bg-red-600 group-hover:text-white transition-colors duration-300">
                <Trash2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-red-700 mb-2">Delete Account</h2>
                <p className="text-sm font-medium text-red-900/70 leading-relaxed max-w-md">
                  Permanently delete your library account and all associated student data. <strong className="text-red-800">This action cannot be undone.</strong>
                </p>
              </div>
            </div>
            <button 
              className="shrink-0 px-6 py-3 bg-white text-red-700 border-2 border-red-200 hover:border-red-600 hover:bg-red-600 hover:text-white font-bold rounded-xl shadow-sm transition-all duration-300 w-full md:w-auto"
              onClick={() => alert('Account deletion is not available in Phase 1.')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col border border-gray-100">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Update Password</h2>
              <button onClick={closePasswordModal} className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-8 space-y-6 bg-gray-50/30">
              {passwordMsg.text && (
                <div className={`rounded-xl p-4 text-sm font-medium flex items-center gap-3 ${
                  passwordMsg.type === 'success'
                    ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
                  {passwordMsg.text}
                </div>
              )}

              <div className="space-y-5">
                <Input
                  id="modal-current-password"
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="bg-white"
                />
                <Input
                  id="modal-new-password"
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  className="bg-white"
                />
              </div>

              <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3">
                <Button type="button" variant="secondary" onClick={closePasswordModal} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold">
                  Cancel
                </Button>
                <Button type="submit" loading={passwordLoading} className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-[#1B5E20] hover:bg-[#124116]">
                  Save Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
