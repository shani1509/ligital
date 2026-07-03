'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { mutate: mutateProfile, loading: profileLoading } = useMutation();
  const { mutate: mutatePassword, loading: passwordLoading } = useMutation();

  // Profile state
  const [libraryName, setLibraryName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setLibraryName(user.library.name);
      setOwnerName(user.name);
      setPhone(user.phone);
      setAddress(user.library.address);
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    const result = await mutateProfile('/api/settings/profile', 'PUT', {
      libraryName: libraryName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    if (result.success) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      await refreshUser();
    } else {
      setProfileMsg({ type: 'error', text: result.message || 'Failed to update profile' });
    }
  };

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
      setCurrentPassword('');
      setNewPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: result.message || 'Failed to change password' });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your library profile and account settings.</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <form onSubmit={handleProfileSave} className="p-6 space-y-5">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="h-5 w-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Profile Settings
          </h3>

          {profileMsg.text && (
            <div className={`rounded-lg p-3 text-sm ${
              profileMsg.type === 'success'
                ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {profileMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="settings-library-name"
              label="Library Name"
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
            />
            <Input
              id="settings-owner-name"
              label="Owner Name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              id="settings-phone"
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              id="settings-email"
              label="Email"
              value={user?.email ?? ''}
              disabled
            />
          </div>
          <Input
            id="settings-address"
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={profileLoading} id="btn-save-profile">
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="h-5 w-5 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </h3>

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
            id="settings-current-password"
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
          <Input
            id="settings-new-password"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 8 characters)"
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={passwordLoading} id="btn-change-password">
              Change Password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
