'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate, daysUntil, PLATFORM_PLANS } from '@/lib/utils';
import { 
  Crown, 
  BadgeCheck, 
  Calendar, 
  Wallet, 
  CreditCard, 
  CircleCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

type PlanKey = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

interface BillingData {
  id: string;
  planType: PlanKey;
  amountPaise: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  library: {
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
    trialEndsAt: string;
  };
}

// ─── Plan Card Data ──────────────────────────────────────
const planCards: {
  key: PlanKey;
  name: string;
  subtitle: string;
  priceLabel: string;
  period: string;
  popular?: boolean;
  features: string[];
  icon: React.ElementType;
}[] = [
  {
    key: 'MONTHLY',
    name: 'Basic',
    subtitle: 'For 30 Days',
    priceLabel: '₹199',
    period: '30 Days',
    features: ['Unlimited Students', 'Seat Management', 'Reports & Analytics', 'Priority Support'],
    icon: BadgeCheck,
  },
  {
    key: 'QUARTERLY',
    name: 'Standard',
    subtitle: 'For 3 Months',
    priceLabel: '₹499',
    period: '3 Months',
    popular: true,
    features: ['Unlimited Students', 'Seat Management', 'Reports & Analytics', 'Priority Support'],
    icon: Crown,
  },
  {
    key: 'YEARLY',
    name: 'Premium',
    subtitle: 'For 1 Year',
    priceLabel: '₹1499',
    period: '1 Year',
    features: ['Unlimited Students', 'Seat Management', 'Reports & Analytics', 'Priority Support'],
    icon: Sparkles,
  },
];

// ─── Helpers ─────────────────────────────────────────────
function getPlanDisplayName(billing: BillingData): string {
  if (billing.library.status === 'TRIAL') return 'Free Trial';
  const cfg = planCards.find((p) => p.key === billing.planType);
  return cfg ? cfg.name + ' Plan' : PLATFORM_PLANS[billing.planType].label + ' Plan';
}

function getPlanSubtitle(billing: BillingData): string {
  if (billing.library.status === 'TRIAL') return 'Enjoy full access for 7 days';
  const plan = PLATFORM_PLANS[billing.planType];
  if (plan.durationDays === 30) return 'Valid for 30 Days';
  if (plan.durationDays === 90) return 'Valid for 3 Months';
  return 'Valid for 1 Year';
}

export default function BillingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { data: billing, loading: billingLoading, error: billingError } = useFetch<BillingData>('/api/billing');
  const { mutate, loading: subscribing } = useMutation();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [success, setSuccess] = useState(false);
  
  const plansSectionRef = useRef<HTMLDivElement>(null);

  const scrollToPlans = () => {
    if (plansSectionRef.current) {
      plansSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    const result = await mutate('/api/billing/subscribe', 'POST', { planType: selectedPlan });
    if (result.success) {
      setSuccess(true);
      setSelectedPlan(null);
      await refreshUser();
      router.refresh();
    }
  };

  // Derived state from live data
  const libraryStatus = billing?.library.status ?? 'TRIAL';
  const isTrial = libraryStatus === 'TRIAL';
  const isActive = billing?.status === 'ACTIVE' && (libraryStatus === 'ACTIVE' || libraryStatus === 'TRIAL');
  const isExpired = libraryStatus === 'EXPIRED' || billing?.status === 'EXPIRED';
  const endDate = billing?.endDate;
  const remaining = endDate ? daysUntil(endDate) : 0;

  // Determine Gradient Based on Status
  let cardGradient = 'from-[#0B3D1B] to-[#1B5E20]'; // Default Active (Green)
  if (isTrial) cardGradient = 'from-indigo-900 to-indigo-600';
  if (isExpired) cardGradient = 'from-red-900 to-red-700';

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12 max-w-6xl mx-auto w-full">

      {/* ── 1. Page Header & Actions ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Billing & Plans</h1>
          <p className="mt-2 text-base text-gray-500 max-w-xl">Manage your active subscription and explore upgrading to our premium plans.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md hover:-translate-y-0.5">
            <Wallet className="w-4 h-4" />
            Payment History
          </button>
          <button 
            onClick={scrollToPlans} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-900/20 transition-all duration-300 hover:bg-[#124116] hover:shadow-xl hover:shadow-green-900/30 hover:-translate-y-0.5"
          >
            <CreditCard className="w-4 h-4" />
            Upgrade Plan
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800 shadow-md flex items-center gap-4 animate-fade-in-up">
          <div className="bg-emerald-100 p-2 rounded-full">
            <CircleCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-base mb-0.5">Payment Successful!</h4>
            <p className="text-emerald-700">Your subscription has been activated successfully. Enjoy Ligital!</p>
          </div>
        </div>
      )}

      {/* ── 2. Current Plan Card (Redesigned with Glassmorphism) ────────────── */}
      <div className="w-full">
        {billingLoading ? (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-16 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-[#C8E6C9] border-t-[#1B5E20] rounded-full animate-spin" />
          </div>
        ) : billingError || !billing ? (
          <div className="rounded-3xl border border-gray-100 bg-white shadow-sm p-16 text-center text-gray-500">
            <p className="font-medium text-lg text-gray-900">Unable to load billing information.</p>
            <p className="mt-2">Please subscribe to a plan to get started.</p>
          </div>
        ) : (
          <div className={`relative overflow-hidden rounded-[2rem] shadow-2xl bg-gradient-to-br ${cardGradient} text-white transition-all duration-500 group`}>
            
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-black/10 blur-2xl"></div>

            <div className="relative z-10 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm border border-white/20 backdrop-blur-md ${
                  isExpired ? 'bg-red-500/20 text-red-100' : isTrial ? 'bg-indigo-400/20 text-indigo-100' : 'bg-emerald-400/20 text-emerald-100'
                }`}>
                  {isExpired ? 'Status: Expired' : isTrial ? 'Status: Trial' : 'Status: Active'}
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-1 flex items-center gap-3">
                    {isTrial ? <Sparkles className="w-8 h-8 text-indigo-300" /> : <Crown className="w-8 h-8 text-emerald-300" />}
                    {getPlanDisplayName(billing)}
                  </h2>
                  <p className="text-base text-white/80 font-medium">{getPlanSubtitle(billing)}</p>
                </div>
                {!isExpired && (
                  <div className="text-left md:text-right">
                    <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-0.5">Time Remaining</p>
                    <p className="text-2xl font-bold">{remaining} <span className="text-lg font-normal text-white/80">days</span></p>
                  </div>
                )}
              </div>

              {/* Glassmorphic Data Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 transition-all duration-300 hover:bg-white/15">
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">Amount Paid</p>
                  <p className="text-2xl font-bold">
                    {isTrial ? '₹0' : formatCurrency(billing.amountPaise)}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 transition-all duration-300 hover:bg-white/15">
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">Start Date</p>
                  <p className="text-lg font-semibold">{formatDate(billing.startDate)}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 transition-all duration-300 hover:bg-white/15">
                  <p className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1">Expiry Date</p>
                  <p className="text-lg font-semibold text-white">{formatDate(billing.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Warning Banner for Expired */}
            {isExpired && (
              <div className="relative z-10 bg-red-950/50 backdrop-blur-md border-t border-red-500/30 px-8 py-5 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-red-300" />
                  <p className="text-sm md:text-base text-red-100 font-medium">
                    Your plan expired on <strong className="font-bold text-white">{formatDate(billing.endDate)}</strong>. Please recharge immediately to restore access.
                  </p>
                </div>
                <button onClick={scrollToPlans} className="shrink-0 bg-white text-red-900 px-5 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-red-50 transition-colors">
                  Recharge Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 3. Choose Plan Section (Redesigned Layout) ───────────────── */}
      <div id="choose-plan" className="pt-6 scroll-mt-24" ref={plansSectionRef}>
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Simple, transparent pricing</h2>
          <p className="mt-3 text-base text-gray-500 max-w-2xl mx-auto">Select the perfect plan for your library's needs. No hidden fees. Upgrade or change your plan at any time.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {planCards.map((plan, idx) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.key}
                className={`relative flex flex-col p-6 md:p-8 rounded-[2rem] bg-white transition-all duration-500 ease-out group ${
                  isPopular
                    ? 'border-2 border-emerald-500 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.3)] hover:-translate-y-2 hover:shadow-[0_30px_70px_-15px_rgba(16,185,129,0.4)] z-10'
                    : 'border border-gray-100 shadow-xl shadow-gray-200/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200/60 hover:border-emerald-200'
                }`}
                style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
              >
                {/* Most Popular Glowing Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-[#1B5E20] text-white text-xs font-black px-5 py-1.5 rounded-full z-10 shadow-[0_0_20px_rgba(16,185,129,0.4)] tracking-wider uppercase">
                    Most Popular
                  </div>
                )}

                {/* Card Header */}
                <div className="mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                    isPopular ? 'bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 shadow-inner' : 'bg-gray-50 text-gray-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
                  }`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                  <p className="text-sm text-gray-500 mt-1 font-medium">{plan.subtitle}</p>
                </div>
                
                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <div className="flex items-baseline text-gray-900">
                    <span className="text-5xl font-black tracking-tighter">{plan.priceLabel}</span>
                  </div>
                  <span className="text-gray-500 font-medium block mt-1.5 text-base">{plan.period}</span>
                </div>

                {/* Features List */}
                <ul className="space-y-4 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                      <div className="mt-0.5 mr-3 rounded-full bg-emerald-100 p-1 flex-shrink-0">
                        <CircleCheck className="w-3.5 h-3.5 text-emerald-700" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Action Button */}
                <button
                  onClick={() => setSelectedPlan(plan.key)}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                    isPopular
                      ? 'bg-[#1B5E20] text-white shadow-lg shadow-green-900/20 hover:bg-[#124116] hover:shadow-xl hover:shadow-green-900/40 hover:-translate-y-1'
                      : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-[#1B5E20] hover:bg-[#1B5E20] hover:text-white hover:-translate-y-1 hover:shadow-lg'
                  }`}
                >
                  Choose Plan
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Payment Confirmation Modal ────────────────────── */}
      {selectedPlan && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          title="Confirm Subscription"
        >
          <div className="space-y-6">
            <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 p-8 text-center border border-emerald-100 shadow-sm">
              <p className="text-sm font-bold tracking-widest text-emerald-800 uppercase mb-3">You are subscribing to</p>
              <p className="text-3xl font-black text-gray-900 mb-4">
                {PLATFORM_PLANS[selectedPlan].label} Plan
              </p>
              <div className="inline-block bg-white rounded-2xl px-8 py-4 shadow-sm border border-emerald-50">
                <p className="text-5xl font-black text-emerald-700 tracking-tight">
                  {formatCurrency(PLATFORM_PLANS[selectedPlan].pricePaise)}
                </p>
                <p className="mt-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                  for {PLATFORM_PLANS[selectedPlan].durationDays} days
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 flex items-start gap-4">
              <Wallet className="w-6 h-6 flex-shrink-0 text-amber-600" />
              <p className="leading-relaxed"><strong>Test Mode Environment:</strong> This action simulates a payment flow. Clicking "Pay Now" will instantly activate your subscription without processing real currency.</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4">
            <Button variant="secondary" onClick={() => setSelectedPlan(null)} className="px-8 py-3 rounded-xl w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubscribe} loading={subscribing} className="px-10 py-3 rounded-xl bg-[#1B5E20] hover:bg-[#124116] flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-green-900/20">
              <CreditCard className="w-5 h-5" />
              Pay Now
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
