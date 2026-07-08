'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  LifeBuoy, 
  Mail, 
  Clock, 
  MessageSquare, 
  ChevronDown, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQs = [
  {
    question: "How do I renew my subscription?",
    answer: "Go to the Billing page from the sidebar and select the plan you wish to renew."
  },
  {
    question: "Can I change a student's seat?",
    answer: "Yes, navigate to Seats Management, select the student's current seat, and reassign them to an available one."
  },
  {
    question: "How do I edit my library capacity?",
    answer: "Go to the My Library page and click \"Edit Profile\" to update your physical seat capacity."
  }
];

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Form State
  const [category, setCategory] = useState('Bug Report');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [formMsg, setFormMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg({ type: '', text: '' });

    // Simulate API call for Phase 1 MVP
    setTimeout(() => {
      setFormMsg({ 
        type: 'success', 
        text: 'Your request has been received. Our team will contact you soon.' 
      });
      setCategory('Bug Report');
      setSubject('');
      setDescription('');
      setIsSubmitting(false);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setFormMsg({ type: '', text: '' });
      }, 5000);
    }, 800);
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-16 font-sans">
      
      {/* 1. Page Layout & Header */}
      <div className="pt-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Help & Support</h1>
        <p className="mt-3 text-base md:text-lg text-gray-500 max-w-xl">Get assistance, report issues, and learn how to get the most out of Ligital.</p>
      </div>

      {/* 2. Contact & App Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Contact Support */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group h-full">
          <div className="flex items-center gap-5 mb-8 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <LifeBuoy className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Contact Support</h2>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-5 group/item">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover/item:border-indigo-200 transition-colors">
                <Mail className="w-5 h-5 text-gray-500 group-hover/item:text-indigo-600 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Email Us</p>
                <p className="text-base font-semibold text-gray-900">support@ligital.com</p>
              </div>
            </div>
            <div className="flex items-center gap-5 group/item">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover/item:border-indigo-200 transition-colors">
                <Clock className="w-5 h-5 text-gray-500 group-hover/item:text-indigo-600 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Working Hours</p>
                <p className="text-base font-semibold text-gray-900">Mon – Sat, 9:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group h-full">
          <div className="flex items-center gap-5 mb-8 pb-5 border-b border-gray-100">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-inner group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
              <Info className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">App Information</h2>
          </div>
          
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex justify-between items-center py-4 px-5 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-teal-100 transition-colors">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Current Version</span>
              <span className="text-base font-black text-gray-900">Version 1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-4 px-5 bg-gray-50 rounded-2xl border border-gray-100 group-hover:border-teal-100 transition-colors">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Last Updated</span>
              <span className="text-base font-black text-gray-900">15 July 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Unified Issue & Feedback Form Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group">
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Send a Request</h2>
            <p className="text-sm text-gray-500">Report a bug, request a feature, or ask for help.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formMsg.text && (
            <div className={`rounded-2xl p-4 text-sm font-medium flex items-center gap-3 ${
              formMsg.type === 'success'
                ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {formMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
              {formMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-bold text-gray-700">Category</label>
              <div className="relative">
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="Bug Report">Bug Report</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Technical Issue">Technical Issue</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="block text-sm font-bold text-gray-700">Subject</label>
              <input
                id="subject"
                type="text"
                placeholder="Brief summary of the issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-bold text-gray-700">Description</label>
            <textarea
              id="description"
              rows={5}
              placeholder="Please provide details about your issue or feedback..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-900 font-medium placeholder-gray-400 focus:bg-white focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold bg-[#1B5E20] hover:bg-[#124116] shadow-lg shadow-green-900/20 hover:-translate-y-0.5 transition-all">
              Submit Request
            </Button>
          </div>
        </form>
      </div>

      {/* 4. FAQ Card */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/30 border border-gray-100 p-8 md:p-10 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50 group">
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Frequently Asked Questions</h2>
            <p className="text-sm text-gray-500">Quick answers to common questions.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {FAQs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className={cn(
                  "border-2 rounded-2xl transition-all duration-300 overflow-hidden",
                  isOpen 
                    ? "border-emerald-500 bg-emerald-50/30 shadow-md shadow-emerald-100" 
                    : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none"
                >
                  <span className={cn(
                    "font-bold text-base transition-colors",
                    isOpen ? "text-emerald-900" : "text-gray-900"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "shrink-0 ml-4 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                    isOpen ? "bg-emerald-100 text-emerald-600 rotate-180" : "bg-gray-100 text-gray-500"
                  )}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                <div 
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-2">
                      <p className="text-gray-600 font-medium leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
