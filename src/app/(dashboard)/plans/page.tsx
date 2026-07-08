'use client';

import { useState } from 'react';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency } from '@/lib/utils';
import { Plus, Users, Edit3, PowerOff, ShieldCheck, X, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanData {
  id: string;
  name: string;
  durationDays: number;
  pricePaise: number;
  isActive: boolean;
  createdAt: string;
  _count: { subscriptions: number };
}

export default function PlansPage() {
  const { data: plans, loading, refetch } = useFetch<PlanData[]>('/api/plans');
  const { mutate, loading: mutating } = useMutation();

  // Create plan state
  const [showCreate, setShowCreate] = useState(false);
  const [confirmStep, setConfirmStep] = useState(0); // 0: form, 1: first confirm, 2: price confirm
  const [planName, setPlanName] = useState('');
  const [duration, setDuration] = useState('');
  const [price, setPrice] = useState('');
  const [formError, setFormError] = useState('');

  // Edit plan state
  const [editPlan, setEditPlan] = useState<PlanData | null>(null);
  const [editName, setEditName] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Deactivate state
  const [deactivatePlan, setDeactivatePlan] = useState<PlanData | null>(null);

  const resetCreate = () => {
    setShowCreate(false);
    setConfirmStep(0);
    setPlanName('');
    setDuration('');
    setPrice('');
    setFormError('');
  };

  const handleCreateSubmit = async () => {
    if (confirmStep === 0) {
      // Validate
      if (!planName.trim() || !duration || !price) {
        setFormError('All fields are required');
        return;
      }
      if (parseInt(duration) < 1 || parseInt(duration) > 365) {
        setFormError('Duration must be between 1 and 365 days');
        return;
      }
      if (parseFloat(price) < 1) {
        setFormError('Price must be at least ₹1');
        return;
      }
      setFormError('');
      setConfirmStep(1);
      return;
    }

    if (confirmStep === 1) {
      setConfirmStep(2);
      return;
    }

    // Step 2: actually create
    const result = await mutate('/api/plans', 'POST', {
      name: planName.trim(),
      durationDays: parseInt(duration),
      pricePaise: Math.round(parseFloat(price) * 100),
    });
    if (result.success) {
      resetCreate();
      refetch();
    } else {
      setFormError(result.message || 'Failed to create plan');
      setConfirmStep(0);
    }
  };

  const handleEdit = async () => {
    if (!editPlan) return;
    const result = await mutate(`/api/plans/${editPlan.id}`, 'PUT', {
      name: editName.trim(),
      durationDays: parseInt(editDuration),
      pricePaise: Math.round(parseFloat(editPrice) * 100),
    });
    if (result.success) {
      setEditPlan(null);
      refetch();
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatePlan) return;
    const result = await mutate(`/api/plans/${deactivatePlan.id}`, 'DELETE');
    if (result.success) {
      setDeactivatePlan(null);
      refetch();
    }
  };

  const openEdit = (plan: PlanData) => {
    setEditPlan(plan);
    setEditName(plan.name);
    setEditDuration(String(plan.durationDays));
    setEditPrice(String(plan.pricePaise / 100));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* 1. Page Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Subscription Plans</h1>
          <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">Create and manage the subscription tiers available to your students.</p>
        </div>
        <Button 
          onClick={() => setShowCreate(true)} 
          id="btn-create-plan"
          className="bg-[#1B5E20] hover:bg-[#124116] shadow-lg shadow-green-900/20 hover:-translate-y-0.5 transition-all px-6 py-3.5 rounded-xl font-bold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create New Plan
        </Button>
      </div>

      {/* 2. Plans Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"/>
          <p className="text-gray-500 font-medium animate-pulse">Loading available plans...</p>
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600 shadow-inner">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">No plans created yet</h3>
          <p className="mt-2 text-base text-gray-500 max-w-sm mx-auto">Set up your first subscription plan to start enrolling students into your library.</p>
          <Button 
            onClick={() => setShowCreate(true)} 
            className="mt-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 px-8 py-3 rounded-xl font-bold"
          >
            Create Your First Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col bg-white rounded-[2rem] border transition-all duration-300 group h-full",
                plan.isActive 
                  ? "border-emerald-100 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1" 
                  : "border-gray-200 opacity-75 hover:opacity-100 shadow-sm"
              )}
            >
              {/* Optional glowing top border for active plans */}
              {plan.isActive && (
                <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-[2rem]"></div>
              )}

              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">{plan.name}</h3>
                    <div className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                      plan.isActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                    )}>
                      {plan.isActive ? 'Active Plan' : 'Inactive Plan'}
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1 text-gray-900">
                    <span className="text-4xl font-black tracking-tighter">{formatCurrency(plan.pricePaise)}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-1">For {plan.durationDays} days</p>
                </div>

                <div className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <Users className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-gray-900">{plan._count.subscriptions}</span> active subscriber{plan._count.subscriptions !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100 rounded-b-[2rem] flex gap-3">
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-3 text-sm font-bold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                {plan.isActive && (
                  <button
                    onClick={() => setDeactivatePlan(plan)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 hover:border-red-200"
                  >
                    <PowerOff className="w-4 h-4" />
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Create Plan Modal Wizard */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-100 animate-scale-in">
            
            {/* Wizard Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                {confirmStep === 0 && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">1</span>}
                {confirmStep === 1 && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm">2</span>}
                {confirmStep === 2 && <span className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-sm">3</span>}
                {confirmStep === 0 ? 'Plan Details' : confirmStep === 1 ? 'Review Plan' : 'Final Confirmation'}
              </h2>
              <button onClick={resetCreate} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {confirmStep === 0 && (
                <div className="space-y-6">
                  {formError && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-700 border border-red-100 flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      {formError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">Plan Name</label>
                    <input
                      type="text"
                      value={planName}
                      onChange={(e) => setPlanName(e.target.value)}
                      placeholder="e.g. Monthly Pass"
                      className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Duration (days)</label>
                      <input
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="30"
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-gray-700">Price (₹)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="499"
                        className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {confirmStep === 1 && (
                <div className="space-y-6">
                  <p className="text-gray-600 font-medium">Please review the configuration below. Once created, these parameters will be locked to ensure active subscriptions aren't disrupted.</p>
                  
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Plan Name</span>
                      <span className="font-bold text-gray-900 text-lg">{planName}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Access Duration</span>
                      <span className="font-bold text-gray-900">{duration} days</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-gray-500 font-bold uppercase tracking-wider text-xs">Base Price</span>
                      <span className="font-black text-emerald-600 text-xl">₹{price}</span>
                    </div>
                  </div>
                </div>
              )}

              {confirmStep === 2 && (
                <div className="space-y-6">
                  <div className="rounded-2xl border-2 border-yellow-300 bg-yellow-50 p-8 text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                      <ShieldCheck className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-xl font-bold text-yellow-900 mb-2">
                      Pricing Finalization
                    </p>
                    <p className="text-sm text-yellow-800/80 mb-6 max-w-xs">
                      You are about to lock in the following rate for all students enrolling in this tier:
                    </p>
                    <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-yellow-200 w-full">
                      <p className="text-4xl font-black text-gray-900">₹{price}</p>
                      <p className="mt-1 text-sm font-bold text-gray-500 uppercase tracking-wider">Per {duration} Days</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Actions */}
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <Button 
                variant="secondary" 
                onClick={confirmStep === 0 ? resetCreate : () => setConfirmStep(confirmStep - 1)}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
              >
                {confirmStep === 0 ? 'Cancel' : 'Back'}
              </Button>
              <Button 
                onClick={handleCreateSubmit} 
                loading={mutating}
                className={cn(
                  "flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
                  confirmStep === 2 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" 
                    : "bg-gray-900 hover:bg-black shadow-lg shadow-gray-900/20"
                )}
              >
                {confirmStep === 0 ? (
                  <>Continue <ChevronRight className="w-4 h-4" /></>
                ) : confirmStep === 1 ? (
                  'Confirm Setup'
                ) : (
                  <>Publish Plan <CheckCircle2 className="w-5 h-5" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Edit Plan Modal */}
      {editPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 animate-scale-in">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Edit Plan</h2>
              <button onClick={() => setEditPlan(null)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Plan Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Duration (days)</label>
                <input
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setEditPlan(null)} className="py-3 px-6 rounded-xl font-bold bg-white">Cancel</Button>
              <Button onClick={handleEdit} loading={mutating} className="py-3 px-6 rounded-xl font-bold bg-gray-900 hover:bg-black shadow-md shadow-gray-900/20">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Deactivate Modal */}
      {deactivatePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 animate-scale-in">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
              <h2 className="text-xl font-extrabold text-red-900 tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Deactivate Plan
              </h2>
              <button onClick={() => setDeactivatePlan(null)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <p className="text-base text-gray-600 font-medium leading-relaxed">
                Are you sure you want to deactivate <strong className="text-gray-900">{deactivatePlan.name}</strong>? 
              </p>
              <p className="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                Existing subscriptions will remain active until they expire, but no new students will be able to select this tier.
              </p>
            </div>
            <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeactivatePlan(null)} className="py-3 px-6 rounded-xl font-bold bg-white">Cancel</Button>
              <Button variant="danger" onClick={handleDeactivate} loading={mutating} className="py-3 px-6 rounded-xl font-bold bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20">Deactivate</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
