"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

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
        .limit(1); // In a real app, you might randomize this logic
      
      if (data && data.length > 0) {
        setAd(data[0]);
      }
    };
    fetchAd();
  }, [position]);

  if (!ad) {
    // Fallback: Show Axiora Placeholder if no ad exists
    return (
      <div className={`bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center p-4 ${position === 'sidebar' ? 'h-64' : 'h-24'}`}>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sponsored</p>
        <p className="text-sm font-bold text-[#005F99]">Your Ad Here?</p>
        <a href="mailto:hello@axioralabs.com" className="text-xs text-[#00B3B3] hover:underline mt-1">Contact Axiora Labs</a>
      </div>
    );
  }

  return (
    <a href={ad.redirect_url} target="_blank" rel="noopener noreferrer" className="block relative group overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-1.5 rounded uppercase tracking-wider font-bold">Ad</div>
      <img src={ad.image_url} alt="Advertisement" className="w-full h-full object-cover" />
    </a>
  );
}