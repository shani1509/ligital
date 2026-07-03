'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMutation } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate, daysUntil, PLATFORM_PLANS } from '@/lib/utils';

type PlanKey = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export default function BillingPage() {
  const { user, refreshUser } = useAuth();
  const { mutate, loading } = useMutation();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [success, setSuccess] = useState(false);

  const libraryStatus = user?.library.status ?? 'TRIAL';
  const trialEndsAt = user?.library.trialEndsAt;
  const trialDays = trialEndsAt ? daysUntil(trialEndsAt) : 0;

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    const result = await mutate('/api/billing/subscribe', 'POST', { planType: selectedPlan });
    if (result.success) {
      setSuccess(true);
      setSelectedPlan(null);
      await refreshUser();
    }
  };

  const statusVariant = () => {
    switch (libraryStatus) {
      case 'ACTIVE': return 'success' as const;
      case 'TRIAL': return 'info' as const;
      case 'EXPIRED': return 'danger' as const;
      default: return 'default' as const;
    }
  };

  const plans: { key: PlanKey; popular?: boolean }[] = [
    { key: 'MONTHLY' },
    { key: 'QUARTERLY', popular: true },
    { key: 'YEARLY' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your Ligital platform subscription.</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg border border-[#C8E6C9] bg-[#E8F5E9] p-4 text-sm text-[#1B5E20]">
          <strong>🎉 Payment Successful!</strong> Your subscription has been activated. Enjoy Ligital!
        </div>
      )}

      {/* Current Status */}
      <Card>
        <div className="flex items-center justify-between p-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant={statusVariant()}>{libraryStatus}</Badge>
              {libraryStatus === 'TRIAL' && trialDays > 0 && (
                <span className="text-sm text-gray-500">
                  {trialDays} day{trialDays !== 1 ? 's' : ''} remaining in trial
                </span>
              )}
              {libraryStatus === 'TRIAL' && trialDays <= 0 && (
                <span className="text-sm text-red-500 font-medium">Trial expired</span>
              )}
              {libraryStatus === 'EXPIRED' && (
                <span className="text-sm text-red-500 font-medium">
                  Your subscription has expired. Renew to continue using Ligital.
                </span>
              )}
            </div>
          </div>
          {trialEndsAt && (
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {libraryStatus === 'TRIAL' ? 'Trial ends' : 'Since'}
              </p>
              <p className="text-sm font-medium text-gray-700">{formatDate(trialEndsAt)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map(({ key, popular }) => {
          const plan = PLATFORM_PLANS[key];
          return (
            <div
              key={key}
              className={`relative rounded-2xl border-2 bg-white p-6 transition-all hover:shadow-lg ${
                popular
                  ? 'border-[#1B5E20] shadow-lg scale-105'
                  : 'border-gray-200 shadow-md'
              }`}
            >
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#1B5E20] px-4 py-1 text-xs font-bold text-white">
                  Most Popular
                </div>
              )}

              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">{plan.label}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-black text-[#1B5E20]">
                    {formatCurrency(plan.pricePaise)}
                  </span>
                  <span className="text-sm text-gray-400">
                    /{plan.durationDays === 30 ? 'month' : plan.durationDays === 90 ? '3 months' : 'year'}
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-left text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Unlimited Students
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Seat Management
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Reports & Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Priority Support
                  </li>
                </ul>

                <Button
                  className="mt-6 w-full"
                  variant={popular ? 'primary' : 'secondary'}
                  onClick={() => setSelectedPlan(key)}
                  id={`btn-subscribe-${key.toLowerCase()}`}
                >
                  {libraryStatus === 'ACTIVE' ? 'Switch Plan' : 'Subscribe Now'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Confirmation Modal */}
      {selectedPlan && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          title="Confirm Payment"
        >
          <div className="space-y-4">
            <div className="rounded-lg bg-[#E8F5E9] p-4 text-center">
              <p className="text-sm text-gray-600">You are subscribing to</p>
              <p className="mt-1 text-xl font-bold text-[#1B5E20]">
                {PLATFORM_PLANS[selectedPlan].label} Plan
              </p>
              <p className="mt-2 text-3xl font-black text-gray-900">
                {formatCurrency(PLATFORM_PLANS[selectedPlan].pricePaise)}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                for {PLATFORM_PLANS[selectedPlan].durationDays} days
              </p>
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-700">
              <strong>Mock Payment:</strong> In production, this would redirect to Razorpay. For now, clicking &quot;Pay Now&quot; will instantly activate your subscription.
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setSelectedPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubscribe} loading={loading}>
              💳 Pay Now
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
