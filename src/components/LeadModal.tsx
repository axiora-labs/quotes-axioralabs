"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dictionary, IpData } from '@/types';
import { CheckCircle, Lock, Loader2 } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (whatsapp: string) => void;
  langDict: Dictionary;
}

export default function LeadModal({ isOpen, onClose, onConvert, langDict }: LeadModalProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (whatsapp.length < 9) {
        alert("Please enter a valid WhatsApp number");
        return;
    }
    setLoading(true);

    try {
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData: IpData = await ipRes.json();

      const { error } = await supabase.from('leads').insert({
        whatsapp_number: whatsapp,
        ip_address: ipData.ip,
        location: `${ipData.city}, ${ipData.region}`
      });
      
      if (error) console.log("Supabase log error (non-blocking):", error);
    } catch (err) {
      console.log("IP fetch failed (non-blocking)");
    }

    setLoading(false);
    onConvert(whatsapp); 
  };

  return (
    <div className="fixed inset-0 bg-[#001829]/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        
        {/* Decorative header blob */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#005F99] to-[#00B3B3]"></div>
        
        <div className="text-center mb-6">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
             <CheckCircle size={32} />
           </div>
           <h2 className="text-2xl font-black text-[#005F99]">Ready to Download!</h2>
           <p className="text-slate-500 text-sm mt-2">Your invoice is generated.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">WhatsApp Number</label>
            <input 
              type="tel" 
              placeholder="077 123 4567" 
              className="w-full border-2 border-slate-200 rounded-xl p-4 outline-none focus:border-[#00B3B3] transition-colors text-lg font-medium text-center tracking-widest"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#005F99] text-white py-4 rounded-xl font-bold hover:bg-[#004470] flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Unlock & Download PDF"}
          </button>

          <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1">
            <Lock size={10} /> Secure SSL Connection
          </p>
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">✕</button>
      </div>
    </div>
  );
}