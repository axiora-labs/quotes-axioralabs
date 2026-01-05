"use client";

import React, { useState } from 'react';
import { X, Download, Sparkles, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css'; 

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  // The parent component handles the actual DB save & PDF download
  onSuccess: (whatsapp: string, email: string) => Promise<void>;
}

export default function LeadCaptureModal({ isOpen, onClose, onSuccess }: LeadCaptureModalProps) {
  const [whatsapp, setWhatsapp] = useState<string | undefined>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError(null);

    // 1. Validate Phone (Libraries internal logic)
    if (!whatsapp || !isValidPhoneNumber(whatsapp)) {
      setError("Please enter a valid WhatsApp number.");
      return;
    }

    // 2. Validate Email (Strict Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      // Pass data to parent (GeneratorPage) to handle DB save & Download
      await onSuccess(whatsapp, email);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative overflow-hidden transform transition-all scale-100">
         
         {/* --- HEADER --- */}
         <div className="bg-[#005F99] p-6 text-white text-center relative overflow-hidden">
            {/* Decorative blob */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col items-center">
               <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm shadow-inner">
                  <Sparkles size={24} className="text-white" />
               </div>
               <h3 className="text-xl font-black tracking-tight">Document Ready!</h3>
               <p className="text-blue-100 text-xs mt-1 font-medium">Enter your details to unlock download.</p>
            </div>

            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors bg-white/10 p-1.5 rounded-full hover:bg-white/20"
            >
               <X size={18} />
            </button>
         </div>

         {/* --- FORM BODY --- */}
         <div className="p-6 space-y-5">
            
            {/* Error Message */}
            {error && (
               <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl flex items-center gap-2 animate-pulse font-bold">
                  <AlertCircle size={14} /> {error}
               </div>
            )}

            <div className="space-y-4">
               {/* Phone Input */}
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">WhatsApp Number</label>
                  <div className="phone-input-wrapper">
                    <PhoneInput
                        defaultCountry="LK"
                        placeholder="Enter phone number"
                        value={whatsapp}
                        onChange={setWhatsapp}
                        international
                        countryCallingCodeEditable={false}
                    />
                  </div>
               </div>
               
               {/* Email Input */}
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block ml-1">Email Address</label>
                  <input 
                     type="email" 
                     placeholder="name@company.com" 
                     className="w-full p-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm focus:border-[#005F99] focus:bg-white outline-none font-medium transition-all focus:ring-4 ring-blue-50 text-slate-800"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                  />
               </div>
            </div>

            {/* Submit Button */}
            <button 
               onClick={handleSubmit}
               disabled={loading}
               className="w-full py-3.5 bg-[#005F99] text-white font-bold rounded-xl hover:bg-[#004470] transition-all shadow-lg shadow-blue-900/20 flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:scale-100"
            >
               {loading ? <Loader2 className="animate-spin" size={18}/> : <Download size={18} />}
               {loading ? "Verifying..." : "Download Now"}
            </button>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
               <ShieldCheck size={12} className="text-green-500" />
               <span>Secure & Spam Free. We respect your privacy.</span>
            </div>
         </div>
      </div>

      {/* --- GLOBAL STYLES FOR PHONE INPUT --- */}
      <style jsx global>{`
        .phone-input-wrapper .PhoneInput {
            display: flex;
            align-items: center;
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 0.75rem; /* rounded-xl */
            padding: 4px 12px;
            transition: all 0.2s;
        }
        .phone-input-wrapper .PhoneInput:focus-within {
            border-color: #005F99;
            background: white;
            box-shadow: 0 0 0 4px rgba(0, 95, 153, 0.05);
        }
        .phone-input-wrapper .PhoneInputInput {
            background: transparent;
            border: none;
            outline: none;
            font-size: 0.875rem; /* text-sm */
            font-weight: 500;
            color: #1e293b; /* text-slate-800 */
            padding: 8px 0;
            height: 100%;
        }
        .phone-input-wrapper .PhoneInputCountry {
            margin-right: 12px;
            opacity: 0.8;
        }
        .phone-input-wrapper .PhoneInputCountrySelect {
            display: none;
        }
      `}</style>
    </div>
  );
}