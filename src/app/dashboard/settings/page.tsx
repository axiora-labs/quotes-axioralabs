"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Loader2, Upload, Save, MapPin, 
  ImageIcon, ArrowLeft, CheckCircle2, Store, X, AlertTriangle
} from 'lucide-react';

// --- CUSTOM TOAST (Matches UserView) ---
const Toast = ({ 
  message, 
  type = 'success', 
  onClose 
}: { 
  message: string; 
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };
  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-600" />,
    error: <AlertTriangle size={16} className="text-red-600" />,
    info: <Store size={16} className="text-blue-600" />,
  };

  return (
    <div className="fixed top-20 right-4 z-[110] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} max-w-sm`}>
        {icons[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// --- TYPE DEFINITIONS ---
interface ProfileData {
  id: string;
  business_name: string;
  phone: string;
  address: string;
  business_type: string;
  logo_url: string;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  return "An unexpected error occurred.";
};

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    business_name: '',
    phone: '',
    address: '',
    business_type: '',
    logo_url: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile({
            id: user.id,
            business_name: data.business_name || '',
            phone: data.phone || '',
            address: data.address || '',
            business_type: data.business_type || '',
            logo_url: data.logo_url || ''
          });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        setToast({ message: "Failed to load profile settings", type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [router]);

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const file = e.target.files[0];
    
    // Instant Preview
    const objectUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, logo_url: objectUrl }));

    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ logo_url: data.publicUrl })
        .eq('id', profile.id);

      if (dbError) throw dbError;

      setProfile(prev => ({ ...prev, logo_url: data.publicUrl }));
      setToast({ message: "Logo uploaded successfully", type: 'success' });

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      setToast({ message: `Upload failed: ${msg}`, type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          business_name: profile.business_name,
          phone: profile.phone,
          address: profile.address,
          business_type: profile.business_type
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setToast({ message: "Settings saved successfully", type: 'success' });

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      setToast({ message: `Save failed: ${msg}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-slate-900" size={32} />
        <p className="text-slate-500 text-sm font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
         <div className="max-w-4xl mx-auto px-4 h-14 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.back()} 
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="w-px h-5 bg-slate-200"></div>
                <h1 className="text-sm font-semibold text-slate-900">Settings</h1>
             </div>
             <div className="flex items-center gap-2">
                <Link href="/dashboard" className="text-xs font-medium text-slate-500 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors">
                  Dashboard
                </Link>
             </div>
         </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6 pb-20">
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your business profile and branding. This information will appear on your invoices.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* --- CARD 1: BRAND IDENTITY --- */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Store size={16} className="text-slate-500" /> Brand Identity
              </h3>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Logo Upload */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {profile.logo_url ? (
                    <img 
                      src={profile.logo_url} 
                      alt="Business Logo" 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${uploading ? 'opacity-30' : 'opacity-100'}`}
                    />
                  ) : (
                    <ImageIcon className="text-slate-300" size={32} />
                  )}

                  {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-white/80">
                      <Loader2 className="animate-spin text-slate-900 mb-1" size={20} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="group relative inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-md text-xs font-medium hover:bg-slate-800 cursor-pointer transition-all">
                    <Upload size={14} />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                      disabled={uploading} 
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Recommended size: 500x500px. PNG or JPG.
                  </p>
                </div>
              </div>

              <div className="h-px bg-slate-100"></div>

              {/* Business Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Business Name</label>
                  <input 
                    name="business_name"
                    value={profile.business_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors"
                    placeholder="e.g. Acme Hardware"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Industry / Category</label>
                  <select 
                    name="business_type"
                    value={profile.business_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors appearance-none"
                  >
                    <option value="">Select your industry...</option>
                    <option value="Retail">Retail Store</option>
                    <option value="Hardware">Hardware / Construction</option>
                    <option value="Pharmacy">Pharmacy / Health</option>
                    <option value="Tech">Tech / Electronics</option>
                    <option value="Food">Restaurant / Food</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Other">Other Services</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* --- CARD 2: CONTACT INFORMATION --- */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <MapPin size={16} className="text-slate-500" /> Contact Information
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">WhatsApp / Phone Number</label>
                <input 
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors"
                  placeholder="077 123 4567"
                />
                <p className="text-xs text-slate-400 mt-1.5">Customers will use this to contact you.</p>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Full Business Address</label>
                <textarea 
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors resize-none"
                  placeholder="No. 123, Main Street, Colombo 03"
                />
              </div>
            </div>
          </div>

          {/* --- BOTTOM ACTIONS --- */}
          <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="px-5 py-2.5 rounded-md font-medium text-sm text-white bg-slate-900 hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader2 className="animate-spin" size={14} /> Saving...</>
              ) : (
                <><Save size={14} /> Save Changes</>
              )}
            </button>
          </div>

        </form>

        {/* FOOTER NOTE */}
        <div className="text-center pt-8">
          <p className="text-xs text-slate-400">
            An open source project by <a href="https://www.axioralabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline">Axiora Labs</a>
          </p>
        </div>
      </main>

      {/* CUSTOM TOAST */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}