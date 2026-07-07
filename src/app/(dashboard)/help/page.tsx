'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  LifeBuoy, 
  Mail, 
  Clock, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Info 
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
    answer: "Go to the My Library page and click \"Edit Library\" to update your physical seat capacity."
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
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in pb-10">
      
      {/* 1. Page Layout & Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Help & Support</h1>
        <p className="mt-1 text-sm text-gray-500">Get assistance, report issues, and learn how to use Ligital.</p>
      </div>

      {/* 2. Contact & App Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Support */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <LifeBuoy className="w-5 h-5 text-gray-600" />
            Contact Support
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Email Us</p>
                <p className="text-sm text-gray-500">support@ligital.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Working Hours</p>
                <p className="text-sm text-gray-500">Mon – Sat, 9:00 AM – 6:00 PM</p>
              </div>
            </div>
          </div>
        </Card>

        {/* App Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <Info className="w-5 h-5 text-gray-600" />
            App Information
          </h2>
          <div className="flex flex-col h-[calc(100%-2.75rem)] justify-center space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Current Version</span>
              <span className="text-sm font-semibold text-gray-900">Version 1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-500">Last Updated</span>
              <span className="text-sm font-semibold text-gray-900">15 July 2026</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 3. Unified Issue & Feedback Form Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-5 border-b pb-3 border-gray-100">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          Report an Issue or Send Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {formMsg.text && (
            <div className={`rounded-lg p-3 text-sm ${
              formMsg.type === 'success'
                ? 'bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {formMsg.text}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 transition-shadow disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm"
              >
                <option value="Bug Report">Bug Report</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Technical Issue">Technical Issue</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              id="subject"
              label="Subject"
              placeholder="Brief summary of the issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows={4}
              placeholder="Please provide details about your issue or feedback..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600 transition-shadow disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm resize-none"
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto">
              Submit Request
            </Button>
          </div>
        </form>
      </Card>

      {/* 4. FAQ Card */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-3">
          {FAQs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className={cn(
                  "border rounded-xl transition-colors",
                  isOpen ? "border-green-200 bg-green-50/30" : "border-gray-200 bg-white"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left focus:outline-none"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 shrink-0 ml-4" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}
