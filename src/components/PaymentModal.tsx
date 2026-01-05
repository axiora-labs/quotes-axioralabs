"use client";

import { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle, Loader2, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
  const [error, setError] = useState<string | null>(null);

  // Form State (Visual only - we don't save card data)
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  if (!isOpen) return null;

  const handlePayment = async () => {
    // 1. Basic Validation
    if (!cardName || !cardNumber || !expiry || !cvc) {
      setError("Please fill in all card details.");
      return;
    }

    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      // 2. Simulate Network Delay (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 3. Call the API to "Process" the payment securely
      const res = await fetch('/api/fake-pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingCycle,
          amount: billingCycle === 'monthly' ? 2500 : 25000,
          packageName: billingCycle === 'monthly' ? 'Axiora Pro Monthly' : 'Axiora Pro Yearly'
        }),
      });

      if (!res.ok) {
        throw new Error("Payment declined. Please try again.");
      }

      // 4. Success State
      setStep('success');
      
      // 5. Close and Refresh Dashboard after delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setStep('details');
        setLoading(false);
      }, 2500);

    } catch (err: unknown) {
      console.error(err);
      // Safe Error Handling (fixes 'any' error)
      const errorMessage = err instanceof Error ? err.message : "Transaction failed.";
      setError(errorMessage);
      setStep('details');
      setLoading(false);
    }
  };

  // Pricing Logic
  const price = billingCycle === 'monthly' ? 2500 : 25000;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const savings = billingCycle === 'yearly' ? 'Save 20%' : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-[#001829] p-6 text-white flex justify-between items-start shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="text-[#00B3B3]" size={20} /> Secure Checkout
            </h3>
            <p className="text-slate-400 text-xs mt-1">Encrypted 256-bit SSL transaction</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto">
          
          {step === 'processing' ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-[#005F99] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={20} className="text-[#005F99]" />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Processing Payment...</h4>
                <p className="text-slate-500 text-sm">Please do not close this window.</p>
              </div>
            </div>
          ) : step === 'success' ? (
            <div className="py-12 flex flex-col items-center text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                <CheckCircle size={48} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 text-2xl">Payment Successful!</h4>
                <p className="text-slate-500 text-sm mt-2">Welcome to Axiora Enterprise.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Plan Selector */}
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${billingCycle === 'monthly' ? 'bg-white text-[#005F99] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${billingCycle === 'yearly' ? 'bg-white text-[#005F99] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Yearly <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded-full">SAVE 20%</span>
                </button>
              </div>

              {/* Order Summary */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-700 text-sm">Axiora Enterprise Plan</p>
                  <p className="text-xs text-slate-500">Unlimited Invoices • Priority AI</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl text-[#005F99]">LKR {price.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</p>
                </div>
              </div>

              {/* Credit Card Form */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Cardholder Name</label>
                  <input 
                    placeholder="John Doe" 
                    className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#005F99] font-medium"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      placeholder="0000 0000 0000 0000" 
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#005F99] font-mono font-medium"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Expiry Date</label>
                    <input 
                      placeholder="MM/YY" 
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#005F99] font-mono font-medium text-center"
                      value={expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, '');
                        if (v.length >= 2) v = v.slice(0,2) + '/' + v.slice(2,4);
                        setExpiry(v);
                      }}
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">CVC / CVV</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input 
                        placeholder="123" 
                        type="password"
                        className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#005F99] font-mono font-medium"
                        maxLength={3}
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  {error}
                </div>
              )}

              {/* Pay Button */}
              <button 
                onClick={handlePayment}
                className="w-full bg-[#005F99] hover:bg-[#004470] text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : `Pay LKR ${price.toLocaleString()}`}
              </button>

              <div className="text-center">
                <p className="text-[10px] text-slate-400">
                  By clicking Pay, you agree to our Terms of Service. 
                  <br/>This is a secure 256-bit encrypted transaction.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}