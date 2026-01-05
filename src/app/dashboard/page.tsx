"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldAlert } from 'lucide-react';

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
          // Optional: Create profile if missing (Self-Healing)
        }

        if (data) {
          // Normalize Data
          const userProfile: DashboardProfile = {
            ...data,
            // Ensure logic matches your schema
            is_paid_member: data.is_paid_member || data.tier === 'pro', 
            email: session.user.email // Ensure email is available for display
          };
          setProfile(userProfile);
        } else {
           setError("Profile not found. Please contact support.");
        }

      } catch (err) {
        console.error("Dashboard Error:", err);
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [router]);

  // --- RENDER LOGIC ---

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-[#005F99] mb-4" size={40} />
        <p className="text-slate-400 text-sm font-bold animate-pulse">Loading Axiora...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
          <ShieldAlert className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800">Access Issue</h3>
          <p className="text-slate-500 text-sm mt-2 mb-6">{error || "User profile data is missing."}</p>
          <button 
            onClick={() => router.push('/auth')} 
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // --- THE TRAFFIC SWITCH ---
  // This is where the magic happens
  if (profile.role === 'admin') {
    return <AdminView profile={profile} />;
  } else {
    return <UserView profile={profile} />;
  }
}