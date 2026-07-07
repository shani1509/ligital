'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
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
  ChevronLeft,
  ChevronRight
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
  if (billing.library.status === 'TRIAL') return 'For 7 Days';
  const plan = PLATFORM_PLANS[billing.planType];
  if (plan.durationDays === 30) return 'For 30 Days';
  if (plan.durationDays === 90) return 'For 3 Months';
  return 'For 1 Year';
}

export default function BillingPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { data: billing, loading: billingLoading, error: billingError } = useFetch<BillingData>('/api/billing');
  const { mutate, loading: subscribing } = useMutation();
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [selectedUiPlan, setSelectedUiPlan] = useState<PlanKey>('QUARTERLY');
  const [success, setSuccess] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
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

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };

  // Derived state from live data
  const libraryStatus = billing?.library.status ?? 'TRIAL';
  const isTrial = libraryStatus === 'TRIAL';
  const isActive = billing?.status === 'ACTIVE' && (libraryStatus === 'ACTIVE' || libraryStatus === 'TRIAL');
  const isExpired = libraryStatus === 'EXPIRED' || billing?.status === 'EXPIRED';
  const endDate = billing?.endDate;
  const remaining = endDate ? daysUntil(endDate) : 0;

  return (
    <div className="space-y-10 animate-fade-in font-sans pb-16">

      {/* ── 1. Page Header & Actions ─────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Billing</h1>
          <p className="mt-2 text-base text-gray-500">Manage your current plan and payment history.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02]">
            <Wallet className="w-4 h-4" />
            Payment History
          </button>
          <button 
            onClick={scrollToPlans} 
            className="inline-flex items-center gap-2 rounded-xl bg-[#1B5E20] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:bg-[#2E7D32] hover:shadow-md hover:scale-[1.02]"
          >
            <CreditCard className="w-4 h-4" />
            Choose a Plan
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-xl border border-[#C8E6C9] bg-[#E8F5E9] p-5 text-sm text-[#1B5E20] shadow-sm flex items-center gap-3 animate-fade-in-up">
          <CircleCheck className="w-5 h-5 flex-shrink-0" />
          <span><strong>Payment Successful!</strong> Your subscription has been activated. Enjoy Ligital!</span>
        </div>
      )}

      {/* ── 2. Current Plan Card ────────────── */}
      <Card className="p-0 overflow-hidden border border-gray-100 shadow-md rounded-2xl bg-white">
        {billingLoading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#C8E6C9] border-t-[#1B5E20] rounded-full animate-spin" />
          </div>
        ) : billingError || !billing ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            <p>Unable to load billing information.</p>
            <p className="mt-2 text-xs text-gray-400">Please subscribe to a plan to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="p-8">
              {/* Plan header */}
              <div className="flex items-center gap-5 mb-8">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${isTrial ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-[#1B5E20]'}`}>
                  {isTrial ? <Sparkles className="w-7 h-7" /> : <Crown className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{getPlanDisplayName(billing)}</h4>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${
                      isExpired
                        ? 'bg-red-50 text-red-700 border-red-100'
                        : isTrial
                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                        : 'bg-[#E8F5E9] text-[#1B5E20] border-green-100'
                    }`}>
                      {isExpired ? 'Expired' : isTrial ? 'Trial' : 'Active'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{getPlanSubtitle(billing)}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                <div className="md:pr-8 flex-1">
                  <p className="text-sm font-medium text-gray-400 mb-1">Amount Paid</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isTrial ? '₹0' : formatCurrency(billing.amountPaise)}
                  </p>
                </div>
                <div className="md:px-8 flex-1 pt-6 md:pt-0">
                  <p className="text-sm font-medium text-gray-400 mb-1">Start Date</p>
                  <p className="text-lg font-semibold text-gray-800">{formatDate(billing.startDate)}</p>
                </div>
                <div className="md:pl-8 flex-1 pt-6 md:pt-0">
                  <p className="text-sm font-medium text-gray-400 mb-1">Expiry Date</p>
                  <p className="text-lg font-semibold text-gray-800">{formatDate(billing.endDate)}</p>
                </div>
              </div>
            </div>

            {/* Countdown banner */}
            <div className={`px-8 py-4 flex items-center gap-3 border-t ${
              isExpired ? 'bg-red-50/50 border-red-100' : 'bg-[#E8F5E9]/50 border-green-100'
            }`}>
              <Calendar className={`w-5 h-5 flex-shrink-0 ${isExpired ? 'text-red-600' : 'text-[#1B5E20]'}`} />
              {isExpired ? (
                <p className="text-sm text-red-700">
                  Your plan expired on <strong className="font-semibold">{formatDate(billing.endDate)}</strong>. Please recharge to continue using Ligital.
                </p>
              ) : (
                <p className={`text-sm ${isTrial ? 'text-blue-800' : 'text-[#1B5E20]'}`}>
                  Your {isTrial ? 'trial' : 'plan'} will expire in <strong className="font-bold">{remaining} day{remaining !== 1 ? 's' : ''}</strong> on <strong className="font-bold">{formatDate(billing.endDate)}</strong>.
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* ── 3. Choose Plan Section ───────────────── */}
      <div id="choose-plan" className="pt-8 scroll-mt-24" ref={plansSectionRef}>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Choose Plan</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">Select the perfect plan for your library's needs. Upgrade anytime.</p>
        </div>
        
        <div className="relative group">
          {/* Navigation Arrows */}
          <button 
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#1B5E20] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-[#1B5E20] hover:scale-110 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Carousel Container */}
          <div 
            ref={scrollContainerRef}
            className="flex flex-col lg:flex-row gap-6 justify-center items-stretch w-full px-4 md:px-10 pb-12 pt-6"
          >
            {planCards.map((plan, idx) => {
              const isSelected = selectedUiPlan === plan.key;
              const Icon = plan.icon;

              return (
                <div
                  key={plan.key}
                  onClick={() => setSelectedUiPlan(plan.key)}
                  className={`relative flex flex-col p-8 rounded-[24px] bg-white transition-all duration-300 ease-out cursor-pointer w-full lg:w-[340px] ${
                    isSelected
                      ? 'border-2 border-[#1B5E20] shadow-[0_20px_40px_-15px_rgba(27,94,32,0.2)] scale-[1.03] z-10'
                      : 'border border-gray-100 shadow-sm hover:border-[#1B5E20]/30 hover:-translate-y-1 hover:shadow-xl scale-95 opacity-90 hover:opacity-100'
                  }`}
                  style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  {/* Most Popular Badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1B5E20] text-white text-xs font-bold px-4 py-1.5 rounded-full z-10 shadow-md tracking-wide uppercase">
                      Most Popular
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex flex-col items-center mb-6 text-center">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${
                      isSelected ? 'bg-[#1B5E20] text-white' : 'bg-green-50 text-[#1B5E20]'
                    }`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
                  </div>
                  
                  {/* Price Display */}
                  <div className="text-center mb-8">
                    <span className="text-5xl font-black text-gray-900 tracking-tight">{plan.priceLabel}</span>
                    <span className="text-gray-500 text-sm font-medium ml-1 block mt-2">{plan.period}</span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 flex-1 mb-10">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start text-sm text-gray-600 font-medium">
                        <CircleCheck className="w-5 h-5 text-[#1B5E20] mr-3 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* Action Button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan.key); }}
                    className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                      isSelected
                        ? 'bg-[#1B5E20] text-white shadow-md hover:bg-[#124116] hover:shadow-lg hover:scale-[1.02]'
                        : 'bg-green-50 text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white'
                    }`}
                  >
                    Choose Plan
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center items-center gap-3 mt-2">
            {planCards.map((plan) => (
              <button
                key={`dot-${plan.key}`}
                onClick={() => setSelectedUiPlan(plan.key)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  selectedUiPlan === plan.key ? 'bg-[#1B5E20] w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Payment Confirmation Modal ────────────────────── */}
      {selectedPlan && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPlan(null)}
          title="Confirm Payment"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-[#E8F5E9] p-6 text-center border border-green-100">
              <p className="text-sm font-medium text-gray-600 mb-2">You are subscribing to</p>
              <p className="text-2xl font-bold text-[#1B5E20]">
                {PLATFORM_PLANS[selectedPlan].label}
              </p>
              <p className="mt-3 text-4xl font-black text-gray-900 tracking-tight">
                {formatCurrency(PLATFORM_PLANS[selectedPlan].pricePaise)}
              </p>
              <p className="mt-2 text-sm font-medium text-gray-500">
                for {PLATFORM_PLANS[selectedPlan].durationDays} days
              </p>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 flex items-start gap-3">
              <Wallet className="w-5 h-5 flex-shrink-0 text-yellow-600 mt-0.5" />
              <p><strong>Mock Payment:</strong> In production, this would redirect to a payment gateway. For now, clicking "Pay Now" will instantly activate your subscription.</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button variant="secondary" onClick={() => setSelectedPlan(null)} className="px-6">
              Cancel
            </Button>
            <Button onClick={handleSubscribe} loading={subscribing} className="px-8 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Pay Now
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
