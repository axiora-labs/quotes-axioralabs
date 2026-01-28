"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Mail, Lock, User, Phone, ArrowLeft, Smartphone, FileText, CheckCircle } from 'lucide-react';

// --- VISUAL COMPONENT: Animated Illustration (Left Panel) ---
const AnimatedIllustration = () => (
  <div className="relative w-full max-w-md aspect-square flex items-center justify-center pointer-events-none select-none">
    {/* Glowing Background Orbs */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B3B3]/20 rounded-full blur-3xl animate-pulse"></div>
    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#005F99]/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

    {/* Center Tech Scene */}
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      <div className="relative w-48 h-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl flex flex-col items-center p-4 transform -rotate-6 transition-transform hover:rotate-0 duration-700">
         <div className="w-16 h-1 bg-white/20 rounded-full mb-4"></div>
         <div className="w-12 h-12 bg-white/20 rounded-full mb-6 flex items-center justify-center">
            <Smartphone className="text-white" size={24} />
         </div>
         <div className="w-full space-y-3">
             <div className="w-full h-2 bg-white/20 rounded-full"></div>
             <div className="w-3/4 h-2 bg-white/10 rounded-full"></div>
         </div>
         <div className="absolute -right-4 top-20 bg-white p-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-xs font-bold text-slate-600">Sent!</span>
         </div>
      </div>
      <div className="absolute -z-10 w-56 h-72 bg-[#005F99] rounded-2xl shadow-xl transform rotate-6 translate-x-12 translate-y-4 opacity-90 flex flex-col p-6">
         <FileText className="text-white/80 mb-4" size={32} />
         <div className="w-full h-2 bg-white/40 rounded-full mb-3"></div>
      </div>
    </div>
  </div>
);

export default function AuthPage() {
  const router = useRouter();
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phone: '',
    password: ''
  });

  // --- SESSION CHECK ---
  // If the user is already logged in, redirect them to dashboard immediately
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.replace('/dashboard');
    };
    checkSession();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (view === 'login') {
        // --- LOGIN FLOW ---
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (signInError) throw signInError;
        
        // Success -> Middleware/Router takes over
        router.push('/dashboard');
      } else {
        // --- REGISTER FLOW ---
        // We pass the business details as 'data' (metadata). 
        // The SQL Trigger we set up will read this and create the Profile automatically.
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              business_name: formData.businessName,
              phone: formData.phone,
            }
          },
        });

        if (authError) throw authError;

        // Check if session was created instantly (Email Confirm OFF) 
        // or if we need to wait (Email Confirm ON)
        if (data.session) {
          router.push('/dashboard');
        } else {
          setSuccessMessage("Success! Please check your email inbox to confirm your account.");
          setView('login');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* =======================
          LEFT PANEL (Visuals)
          ======================= */}
      <div className="hidden lg:flex w-1/2 bg-[#001829] relative items-center justify-center p-12 overflow-hidden">
         
         {/* --- NEW ADDITION: DESKTOP BACK BUTTON --- */}
         <div className="absolute top-8 left-8 z-20">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-white/50 hover:text-white transition-all hover:-translate-x-1 duration-300 font-medium group"
            >
               <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                 <ArrowLeft size={18} />
               </div>
               <span>Back to Home</span>
            </Link>
         </div>
         
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
         <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
            <div className="mb-12 relative w-auto h-12 flex items-center justify-center gap-2">
                 <div className="w-10 h-10 bg-[#00B3B3] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-teal-900/50">A</div>
                 <span className="text-3xl font-black text-white tracking-tight">Axiora<span className="text-[#00B3B3]">Labs</span></span>
            </div>
            <AnimatedIllustration />
            <div className="mt-12 space-y-4">
               <h2 className="text-3xl font-bold text-white">Manage Invoices <br/> <span className="text-[#00B3B3]">The Smart Way</span></h2>
               <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">Join 100+ Sri Lankan businesses using AI to automate their billing.</p>
            </div>
         </div>
      </div>

      {/* =======================
          RIGHT PANEL (Forms)
          ======================= */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white h-screen overflow-y-auto">
         <div className="lg:hidden p-6 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-20">
            <Link href="/" className="flex items-center gap-2 text-slate-800 font-bold">
               <div className="w-8 h-8 bg-[#005F99] rounded-lg flex items-center justify-center text-white font-bold">A</div> Axiora
            </Link>
            <Link href="/" className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium">
               <ArrowLeft size={16} /> Back
            </Link>
         </div>

         <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-20">
            <div className="w-full max-w-md space-y-8">
               <div className="text-center space-y-2">
                  <h1 className="text-3xl font-black text-slate-900">{view === 'login' ? 'Welcome Back' : 'Get Started Free'}</h1>
                  <p className="text-slate-500 text-sm">{view === 'login' ? 'Enter your details to access your dashboard.' : 'Create an account to verify your business.'}</p>
               </div>

               {/* Messages */}
               {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2"><Lock size={16} className="mt-0.5" /><p>{error}</p></div>}
               {successMessage && <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2"><CheckCircle size={16} className="mt-0.5" /><p>{successMessage}</p></div>}

               <form onSubmit={handleSubmit} className="space-y-5">
                  {view === 'register' && (
                    <div className="space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-300">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase ml-1">Business Name</label>
                            <div className="relative group">
                              <User className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#00B3B3]" size={20} />
                              <input name="businessName" type="text" placeholder="e.g. Kandy Hardware" required={view === 'register'} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00B3B3] focus:ring-4 focus:ring-[#00B3B3]/10 font-medium text-slate-800" onChange={handleChange} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase ml-1">WhatsApp Number</label>
                            <div className="relative group">
                              <Phone className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#00B3B3]" size={20} />
                              <input name="phone" type="text" placeholder="e.g. 077 123 4567" required={view === 'register'} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#00B3B3] focus:ring-4 focus:ring-[#00B3B3]/10 font-medium text-slate-800" onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className={`absolute left-4 top-3.5 text-slate-400 ${view === 'register' ? 'group-focus-within:text-[#00B3B3]' : 'group-focus-within:text-[#005F99]'}`} size={20} />
                        <input name="email" type="email" placeholder="name@company.com" required className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 font-medium text-slate-800 ${view === 'register' ? 'focus:border-[#00B3B3] focus:ring-[#00B3B3]/10' : 'focus:border-[#005F99] focus:ring-[#005F99]/10'}`} onChange={handleChange} />
                      </div>
                  </div>

                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase ml-1">Password</label>
                      <div className="relative group">
                        <Lock className={`absolute left-4 top-3.5 text-slate-400 ${view === 'register' ? 'group-focus-within:text-[#00B3B3]' : 'group-focus-within:text-[#005F99]'}`} size={20} />
                        <input name="password" type="password" placeholder="••••••••" required className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 font-medium text-slate-800 ${view === 'register' ? 'focus:border-[#00B3B3] focus:ring-[#00B3B3]/10' : 'focus:border-[#005F99] focus:ring-[#005F99]/10'}`} onChange={handleChange} />
                      </div>
                  </div>
                  
                  {view === 'login' && (
                    <div className="flex justify-end">
                      <button type="button" className="text-xs font-bold text-[#005F99] hover:underline">Forgot Password?</button>
                    </div>
                  )}

                  <button disabled={loading} className={`w-full text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex justify-center items-center gap-2 ${view === 'register' ? 'bg-[#00B3B3] hover:bg-[#009999] shadow-teal-200' : 'bg-[#005F99] hover:bg-[#004470] shadow-blue-200'} ${loading ? 'opacity-80' : ''}`}>
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (view === 'login' ? 'Sign In' : 'Create Account')}
                  </button>
               </form>

               <div className="text-center pt-6">
                 <p className="text-slate-500 text-sm">
                   {view === 'login' ? "Don't have an account?" : "Already have an account?"}
                   <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(null); setSuccessMessage(null); }} className={`ml-2 font-bold hover:underline ${view === 'login' ? 'text-[#005F99]' : 'text-[#00B3B3]'}`}>
                     {view === 'login' ? 'Sign Up' : 'Log In'}
                   </button>
                 </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}