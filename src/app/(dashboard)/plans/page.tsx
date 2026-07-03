'use client';

import { useState } from 'react';
import { useFetch, useMutation } from '@/hooks/useFetch';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage subscription plans for your students.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} id="btn-create-plan">
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C8E6C9] border-t-[#1B5E20]" />
        </div>
      ) : !plans || plans.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F5E9]">
              <svg className="h-8 w-8 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No plans yet</h3>
            <p className="mt-1 text-sm text-gray-500">Create your first subscription plan.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-xl border-2 bg-white p-6 shadow-md transition-all hover:shadow-lg ${
                plan.isActive ? 'border-[#C8E6C9]' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <Badge variant={plan.isActive ? 'success' : 'default'}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1B5E20]">{formatCurrency(plan.pricePaise)}</p>
                  <p className="text-xs text-gray-400">{plan.durationDays} days</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                {plan._count.subscriptions} subscriber{plan._count.subscriptions !== 1 ? 's' : ''}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                  Edit
                </button>
                {plan.isActive && (
                  <button
                    onClick={() => setDeactivatePlan(plan)}
                    className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Modal — DOUBLE CONFIRMATION */}
      {showCreate && (
        <Modal
          isOpen={true}
          onClose={resetCreate}
          title={
            confirmStep === 0
              ? 'Create New Plan'
              : confirmStep === 1
              ? 'Confirm Plan Details'
              : '⚠️ Final Price Confirmation'
          }
        >
          {confirmStep === 0 && (
            <div className="space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{formError}</div>
              )}
              <Input id="create-plan-name" label="Plan Name" value={planName} onChange={(e) => setPlanName(e.target.value)} placeholder="e.g. Monthly Pass" />
              <Input id="create-plan-duration" label="Duration (days)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="30" />
              <Input id="create-plan-price" label="Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="499" />
            </div>
          )}

          {confirmStep === 1 && (
            <div className="space-y-4">
              <div className="rounded-lg bg-[#E8F5E9] p-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-500">Name</p><p className="font-semibold">{planName}</p></div>
                  <div><p className="text-gray-500">Duration</p><p className="font-semibold">{duration} days</p></div>
                  <div><p className="text-gray-500">Price</p><p className="font-semibold">₹{price}</p></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">Please confirm these details are correct.</p>
            </div>
          )}

          {confirmStep === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-yellow-300 bg-yellow-50 p-4 text-center">
                <p className="text-lg font-bold text-yellow-800">
                  Are you sure about the pricing?
                </p>
                <p className="mt-2 text-3xl font-black text-[#1B5E20]">₹{price}</p>
                <p className="mt-1 text-sm text-gray-500">for {duration} days</p>
              </div>
              <p className="text-xs text-gray-400 text-center">
                This price will be charged to students who subscribe to this plan. You can edit it later.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={confirmStep === 0 ? resetCreate : () => setConfirmStep(confirmStep - 1)}>
              {confirmStep === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button onClick={handleCreateSubmit} loading={mutating}>
              {confirmStep === 0 ? 'Next' : confirmStep === 1 ? 'Confirm Details' : 'Create Plan'}
            </Button>
          </div>
        </Modal>
      )}

      {/* Edit Plan Modal */}
      {editPlan && (
        <Modal isOpen={true} onClose={() => setEditPlan(null)} title="Edit Plan">
          <div className="space-y-4">
            <Input id="edit-plan-name" label="Plan Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            <Input id="edit-plan-duration" label="Duration (days)" type="number" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
            <Input id="edit-plan-price" label="Price (₹)" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditPlan(null)}>Cancel</Button>
            <Button onClick={handleEdit} loading={mutating}>Save Changes</Button>
          </div>
        </Modal>
      )}

      {/* Deactivate Modal */}
      {deactivatePlan && (
        <Modal isOpen={true} onClose={() => setDeactivatePlan(null)} title="Deactivate Plan">
          <p className="text-sm text-gray-600">
            Are you sure you want to deactivate <strong>{deactivatePlan.name}</strong>? Existing subscriptions will not be affected, but no new subscriptions can use this plan.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDeactivatePlan(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeactivate} loading={mutating}>Deactivate</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
