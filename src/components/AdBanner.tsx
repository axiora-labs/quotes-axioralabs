"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sparkles, TrendingUp, ArrowRight, BrainCircuit, Store } from 'lucide-react';

interface Ad {
  id: number;
  image_url: string;
  redirect_url: string;
  position: string;
}

export default function AdBanner({ position }: { position: 'banner' | 'sidebar' | 'modal' }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      // Fetch a random active ad for this position
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('position', position)
        .eq('is_active', true)
        .limit(1);
      
      if (data && data.length > 0) {
        setAd(data[0]);
      }
    };
    fetchAd();
  }, [position]);

  // If there's a custom ad image from the database, show it
  if (ad && ad.image_url) {
    return (
      <a href={ad.redirect_url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300">
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-bold z-10 border border-white/20">Sponsored</div>
        <img src={ad.image_url} alt="Advertisement" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </a>
    );
  }

  // --- "DRUNK GRANDMA" NATIVE HOUSE AD FOR AI POS SYSTEM ---
  // If no ad is found, we show this beautiful, high-converting Tailwind ad.
  
  const targetUrl = "https://www.axioralabs.com/pos"; // Replace with actual POS link

  if (position === 'sidebar') {
    return (
      <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="block group relative bg-[#000d14] rounded-3xl overflow-hidden border border-slate-800 hover:border-[#00B3B3]/50 transition-colors duration-500 shadow-xl">
        {/* Abstract Background Elements */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#00B3B3]/20 rounded-full blur-[60px] group-hover:bg-[#00B3B3]/30 transition-colors duration-500"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#005F99]/20 to-transparent pointer-events-none"></div>

        <div className="p-6 relative z-10 flex flex-col h-full min-h-[320px]">
          <div className="flex justify-between items-start mb-8">
            <div className="w-10 h-10 bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl flex items-center justify-center text-[#00B3B3]">
              <BrainCircuit size={20} />
            </div>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-700 px-2 py-1 rounded-full bg-slate-900/50">Sponsored</span>
          </div>

          <h3 className="text-2xl font-black text-white leading-[1.1] tracking-tight mb-3">
            A cash register that knows what you'll sell <span className="text-[#00B3B3]">tomorrow.</span>
          </h3>
          
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            Stop guessing your inventory. Our AI predicts exactly what your shop needs next.
          </p>

          <div className="mt-auto">
            <div className="bg-white text-slate-900 px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-[#00B3B3] group-hover:text-white transition-colors duration-300">
              Upgrade Your Shop <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </a>
    );
  }

  if (position === 'banner') {
    return (
      <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="block group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-[#005F99] transition-colors duration-500 shadow-lg">
        {/* Abstract Horizontal Glow */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1/3 h-full bg-gradient-to-l from-[#00B3B3]/10 to-transparent pointer-events-none"></div>

        <div className="px-6 py-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-[#00B3B3] flex-shrink-0 relative overflow-hidden">
               <div className="absolute inset-0 bg-[#00B3B3] opacity-20 group-hover:animate-ping"></div>
               <TrendingUp size={20} className="relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-[#00B3B3] uppercase tracking-widest">Axiora Smart POS</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-700 px-1.5 py-0.5 rounded bg-slate-800/50">Ad</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Don't guess your stock. Let AI predict it.
              </h3>
            </div>
          </div>

          <div className="w-full md:w-auto flex-shrink-0">
            <div className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-[#00B3B3] group-hover:text-white transition-colors duration-300 w-full md:w-auto">
              See How It Works <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </a>
    );
  }

  // Modal (Large, spacious, high-conversion layout)
  return (
    <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="block group relative bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-[#00B3B3]/30 transition-colors duration-500 shadow-2xl">
      <div className="absolute top-0 right-0 p-4 z-20">
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded-full bg-slate-50">Advertisement</span>
      </div>

      <div className="grid md:grid-cols-2">
        {/* Graphic Side */}
        <div className="bg-slate-50 p-8 relative overflow-hidden flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 min-h-[200px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,179,179,0.05)_0,transparent_70%)] pointer-events-none"></div>
          
          <div className="relative z-10 bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] transform group-hover:scale-105 group-hover:-rotate-2 transition-all duration-500">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
              <Store size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600">Sales Forecast</span>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-black text-[#005F99]">Rs. 450k</span>
              <span className="text-xs text-green-500 font-bold mb-1 flex items-center"><TrendingUp size={12} className="mr-0.5" /> +15%</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Predicted for tomorrow</p>
          </div>
        </div>

        {/* Text Side */}
        <div className="p-8 md:p-10 flex flex-col justify-center bg-white relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[#005F99] rounded-full text-xs font-bold uppercase tracking-widest mb-4 w-fit">
            <Sparkles size={12} /> Axiora POS
          </div>
          
          <h3 className="text-3xl font-black text-slate-900 leading-[1.1] tracking-tight mb-4">
            A till that thinks <br className="hidden md:block"/>ahead for you.
          </h3>
          
          <p className="text-slate-500 leading-relaxed mb-8">
            Never run out of your best-selling items again. Our smart cash register analyzes your past sales to tell you exactly what to buy from suppliers today.
          </p>

          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 group-hover:bg-[#00B3B3] transition-colors duration-300 w-fit">
            View Pricing <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
}