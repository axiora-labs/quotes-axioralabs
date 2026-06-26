"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

// --- IMPORT YOUR VIEWS ---
import UserView from './UserView';
import AdminView from './AdminView';

// Define a Unified Profile Interface
export interface DashboardProfile {
  id: string;
  business_name: string;
  role: 'user' | 'admin';
  is_paid_member: boolean;
  email?: string;
  phone?: string;
  tier?: 'free' | 'pro';
  address?: string;
  business_type?: string;
  logo_url?: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        setLoading(true);
        
        // 1. Get Current Session
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          router.push('/auth');
          return;
        }

        // 2. Fetch Profile Role from Database
        const { data, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profError) {
          console.warn("Profile fetch warning:", profError.message);
        }

        if (data) {
          const userProfile: DashboardProfile = {
            ...data,
            is_paid_member: data.is_paid_member || data.tier === 'pro', 
            email: session.user.email 
          };
          setProfile(userProfile);
        } else {
           setError("ERR_PROFILE_NOT_FOUND: User profile data is missing.");
        }

      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("ERR_CONNECTION_FAILED: Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  // --- RENDER LOGIC ---

  if (loading) {
    return (
      // FIXED: h-[100dvh] ensures it perfectly fits the visible screen on mobile devices 
      // (unlike h-screen which breaks on iOS/Android browser URL bars)
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-6"></div>
          <div className="text-center">
            <p className="text-sm font-mono text-slate-900 tracking-tight font-medium">Initializing workspace...</p>
            <p className="text-xs font-mono text-slate-400 mt-1.5 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Fetching profile data
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-white p-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>

        <div className="relative z-10 bg-white border border-slate-200 rounded-xl shadow-sm p-8 text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={20} />
          </div>
          
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Access Restricted</h3>
          <p className="text-xs text-slate-500 mb-6 font-mono leading-relaxed bg-slate-50 border border-slate-100 rounded-md p-3 text-left">
            <span className="text-red-500">$</span> {error || "ERR_PROFILE_NOT_FOUND"}
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => router.push('/auth')} 
              className="w-full px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} /> Return to Login
            </button>
            <a 
              href="mailto:hello@axioralabs.com" 
              className="text-xs text-slate-500 hover:text-slate-900 font-mono transition-colors"
            >
              Need help? Contact support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- THE TRAFFIC SWITCH ---
  return (
    // Wrap in min-h-[100dvh] to ensure the dashboard always fills the screen height perfectly
    <div className="min-h-[100dvh] bg-slate-50">
      {profile.role === 'admin' ? <AdminView profile={profile} /> : <UserView profile={profile} />}
    </div>
  );
}