"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { 
  Loader2, Upload, Save, User, MapPin, Briefcase, Phone, 
  ImageIcon, ArrowLeft, CheckCircle, Store, Building
} from 'lucide-react';

// --- 1. Type Definitions ---
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    id: '',
    business_name: '',
    phone: '',
    address: '',
    business_type: '',
    logo_url: ''
  });

  // --- 2. Fetch Existing Data ---
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
      } finally {
        setLoading(false);
      }
    };
    getProfile();
  }, [router]);

  // --- 3. Handle Text Changes ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
    setSaveSuccess(false); // Reset success state when user types
  };

  // --- 4. Handle Logo Upload (With Instant Feedback) ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setUploadSuccess(false);
    
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
      setUploadSuccess(true);
      
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      alert(`Upload Failed: ${msg}`);
    } finally {
      setUploading(false);
    }
  };

  // --- 5. Save Text Details ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

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
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      alert(`Save Failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#005F99]" size={32} />
        <p className="text-slate-500 font-medium animate-pulse">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
           <button 
             onClick={() => router.back()} 
             className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-[#005F99] hover:border-[#005F99] transition-all shadow-sm"
             aria-label="Go back"
           >
             <ArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
             <p className="text-slate-500 text-sm mt-1">Manage your business profile and branding.</p>
           </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* --- CARD 1: BRAND IDENTITY --- */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-10 shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Store className="text-[#005F99]" size={20} /> Brand Identity
            </h2>
            
            {/* Logo Section (Drunk Grandma Friendly - Obvious Upload Button) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10 pb-10 border-b border-slate-100">
              <div className="relative w-28 h-28 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner">
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <Loader2 className="animate-spin text-[#005F99] mb-1" size={24} />
                    <span className="text-[10px] font-bold text-[#005F99]">Uploading</span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="group relative inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-[#005F99]/30 cursor-pointer transition-all shadow-sm">
                  {uploadSuccess ? (
                    <><CheckCircle size={18} className="text-green-500" /> Uploaded Successfully</>
                  ) : (
                    <><Upload size={18} className="text-slate-400 group-hover:text-[#005F99] transition-colors" /> Upload New Logo</>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload}
                    disabled={uploading} 
                  />
                </label>
                <p className="text-xs text-slate-500 mt-3 leading-relaxed max-w-xs">
                  This logo will appear automatically on all your invoices. Recommended size: 500x500px.
                </p>
              </div>
            </div>

            {/* Business Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Business Name
                </label>
                <input 
                  name="business_name"
                  value={profile.business_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#005F99] focus:ring-4 focus:ring-[#005F99]/10 text-slate-900 font-medium transition-all"
                  placeholder="e.g. Acme Hardware"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Industry / Category
                </label>
                <select 
                  name="business_type"
                  value={profile.business_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#005F99] focus:ring-4 focus:ring-[#005F99]/10 text-slate-900 font-medium transition-all appearance-none"
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

          {/* --- CARD 2: CONTACT INFORMATION --- */}
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 md:p-10 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <MapPin className="text-[#00B3B3]" size={20} /> Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  WhatsApp / Phone Number
                </label>
                <input 
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#005F99] focus:ring-4 focus:ring-[#005F99]/10 text-slate-900 font-medium transition-all"
                  placeholder="077 123 4567"
                />
                <p className="text-xs text-slate-500">Customers will use this to contact you.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  Full Business Address
                </label>
                <textarea 
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#005F99] focus:ring-4 focus:ring-[#005F99]/10 text-slate-900 font-medium transition-all resize-none"
                  placeholder="No. 123, Main Street, Colombo 03"
                />
              </div>
            </div>
          </div>

          {/* --- BOTTOM ACTIONS (Sticky layout feel) --- */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className={`px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center gap-2 shadow-lg ${
                saveSuccess 
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/20' 
                  : 'bg-[#005F99] hover:bg-[#004470] shadow-blue-900/20'
              } disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5`}
            >
              {saving ? (
                <><Loader2 className="animate-spin" size={20} /> Saving details...</>
              ) : saveSuccess ? (
                <><CheckCircle size={20} /> Saved Successfully</>
              ) : (
                <><Save size={20} /> Save Changes</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}