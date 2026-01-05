"use client";

import React from 'react';
import { X, Crown, CheckCircle, Zap, ShieldCheck, Database, Rocket } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Function to trigger the Payment Modal. 
   * If not provided, it will redirect to the dashboard.
   */
  onUpgradeClick?: () => void;
}

export default function EnterpriseModal({ isOpen, onClose, onUpgradeClick }: EnterpriseModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleCtaClick = () => {
    if (onUpgradeClick) {
      // If parent provided a handler (like opening PaymentModal), use it
      onUpgradeClick();
    } else {
      // Fallback: Redirect to dashboard if this modal is used in a standalone context
      router.push('/dashboard');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      
      {/* CARD CONTAINER */}
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col transform transition-all scale-100">
        
        {/* --- HERO HEADER --- */}
        <div className="bg-[#001829] p-8 text-center relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#00B3B3]/20 rounded-full blur-3xl -ml-10 -mt-10"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl -mr-10 -mb-10"></div>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white p-2 rounded-full transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-900/40 mb-4 rotate-3">
               <Crown size={32} className="text-[#001829]" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Upgrade to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">Enterprise</span>
            </h2>
            <p className="text-slate-400 text-sm mt-2 font-medium max-w-xs mx-auto">
              Remove limits and power up your business with advanced AI tools.
            </p>
          </div>
        </div>

        {/* --- BENEFITS LIST --- */}
        <div className="p-8 space-y-6 bg-white">
          
          {/* Storage Benefit */}
          <div className="flex items-start gap-4">
             <div className="p-3 bg-blue-50 text-[#005F99] rounded-xl shrink-0">
                <Database size={24} />
             </div>
             <div>
                <h4 className="font-bold text-slate-800 text-base">Unlimited Cloud Storage</h4>
                <p className="text-slate-500 text-xs leading-relaxed mt-1">
                  Never delete an invoice again. Store unlimited records securely in the cloud and access them from anywhere.
                </p>
             </div>
          </div>

          {/* AI Benefit */}
          <div className="flex items-start gap-4">
             <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
                <Zap size={24} />
             </div>
             <div>
                <h4 className="font-bold text-slate-800 text-base">Premium AI Credits</h4>
                <p className="text-slate-500 text-xs leading-relaxed mt-1">
                  Get 500 Daily AI credits to instantly generate invoices from text, voice notes, or messy lists.
                </p>
             </div>
          </div>

          {/* Branding Benefit */}
          <div className="flex items-start gap-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-xl shrink-0">
                <ShieldCheck size={24} />
             </div>
             <div>
                <h4 className="font-bold text-slate-800 text-base">Remove Axiora Branding</h4>
                <p className="text-slate-500 text-xs leading-relaxed mt-1">
                  Send professional PDF invoices with only your logo. No &quot;Powered by Axiora&quot; watermarks.
                </p>
             </div>
          </div>
        </div>

        {/* --- FOOTER CTA --- */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col gap-3">
           <button 
             onClick={handleCtaClick}
             className="w-full py-4 bg-gradient-to-r from-[#005F99] to-[#004470] hover:from-[#004c7a] hover:to-[#003355] text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98]"
           >
             <Rocket size={18} /> Upgrade to Pro - LKR 2,500/mo
           </button>
           
           <p className="text-[10px] text-center text-slate-400 font-medium">
             Secure payment via Card. Cancel anytime.
           </p>
        </div>
      </div>
    </div>
  );
}