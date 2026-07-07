'use client';

import { useState } from 'react';
import { useMutation } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Lock, Bell, Shield, AlertTriangle, ExternalLink, X } from 'lucide-react';
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
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-in pb-10">
      {/* 1. Page Layout & Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account security and application preferences.</p>
      </div>

      <div className="flex flex-col space-y-6">
        
        {/* 2. Security Section Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            Security
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
            </div>
            <Button variant="secondary" onClick={() => setIsPasswordModalOpen(true)}>
              Update Password
            </Button>
          </div>
        </div>

        {/* 3. Notifications Section Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            Notifications
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive renewal reminders and student expiry alerts via email</p>
              </div>
              <button 
                type="button" 
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2",
                  emailEnabled ? 'bg-green-600' : 'bg-gray-200'
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  emailEnabled ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-900">WhatsApp / SMS Alerts</p>
                <p className="text-sm text-gray-500">Receive instant updates on your registered mobile number</p>
              </div>
              <button 
                type="button" 
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2",
                  smsEnabled ? 'bg-green-600' : 'bg-gray-200'
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  smsEnabled ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Privacy & Legal Section Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-gray-600" />
            Privacy & Legal
          </h2>
          <div className="flex flex-col space-y-4">
            <Link href="/privacy" className="text-blue-600 hover:underline flex items-center gap-1.5 w-fit font-medium">
              Privacy Policy <ExternalLink className="w-4 h-4" />
            </Link>
            <Link href="/terms" className="text-blue-600 hover:underline flex items-center gap-1.5 w-fit font-medium">
              Terms & Conditions <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 5. Danger Zone */}
        <div className="bg-red-50 rounded-2xl shadow-sm border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-600">Permanently delete your library account and all associated data. This action cannot be undone.</p>
            </div>
            <Button variant="danger" className="shrink-0" onClick={() => alert('Account deletion is not available in Phase 1.')}>
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Update Password</h2>
              <button onClick={closePasswordModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
              {passwordMsg.text && (
                <div className={`rounded-lg p-3 text-sm ${
                  passwordMsg.type === 'success'
                    ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}>
                  {passwordMsg.text}
                </div>
              )}

              <Input
                id="modal-current-password"
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <Input
                id="modal-new-password"
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                required
              />

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={closePasswordModal}>
                  Cancel
                </Button>
                <Button type="submit" loading={passwordLoading}>
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
