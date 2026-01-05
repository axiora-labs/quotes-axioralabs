"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, Save, User, MapPin, Briefcase, Phone, ImageIcon, ArrowLeft, CheckCircle } from 'lucide-react';
import Image from 'next/image';

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
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false); // New Success State
  
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
  };

  // --- 4. Handle Logo Upload (With Instant Feedback) ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    setUploadSuccess(false);
    
    const file = e.target.files[0];
    
    // A. INSTANT PREVIEW: Show the user what they chose immediately
    const objectUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev, logo_url: objectUrl }));

    // B. Prepare Real Upload
    const fileExt = file.name.split('.').pop();
    const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      // 3. Update Profile in Database
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ logo_url: data.publicUrl })
        .eq('id', profile.id);

      if (dbError) throw dbError;

      // 4. Finalize State
      // We update the state with the REAL url now (it will look the same to the user)
      setProfile(prev => ({ ...prev, logo_url: data.publicUrl }));
      setUploadSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      alert(`Upload Failed: ${msg}`);
      // Revert preview on failure (optional, but good UX)
    } finally {
      setUploading(false);
    }
  };

  // --- 5. Save Text Details ---
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
      alert("Profile saved successfully!");

    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      alert(`Save Failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#005F99]" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
           <button onClick={() => router.back()} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
             <ArrowLeft size={20} />
           </button>
           <h1 className="text-2xl font-black text-slate-800">Business Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* LEFT: Logo Uploader */}
           <div className="md:col-span-1 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center relative overflow-hidden">
                 
                 {/* Success Overlay */}
                 {uploadSuccess && (
                   <div className="absolute top-0 left-0 w-full bg-green-500 text-white text-xs font-bold py-1 z-20 animate-in slide-in-from-top fade-in">
                     ✓ Upload Complete
                   </div>
                 )}

                 <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-slate-100 bg-slate-50 flex items-center justify-center group">
                    {/* KEY PROP forces React to re-render image when URL changes */}
                    {profile.logo_url ? (
                      <Image 
                        key={profile.logo_url} 
                        src={profile.logo_url} 
                        alt="Business Logo" 
                        fill 
                        className={`object-cover transition-opacity duration-300 ${uploading ? 'opacity-50' : 'opacity-100'}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <ImageIcon className="text-slate-300" size={40} />
                    )}
                    
                    {/* Hover Overlay */}
                    <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                       <Upload className="text-white mb-1" size={24} />
                       <span className="text-white text-[10px] font-bold uppercase">Change</span>
                       <input 
                         type="file" 
                         accept="image/*" 
                         className="hidden" 
                         onChange={handleLogoUpload}
                         disabled={uploading} 
                       />
                    </label>

                    {/* Loading Spinner */}
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center z-20">
                        <Loader2 className="animate-spin text-[#00B3B3]" size={32} />
                      </div>
                    )}
                 </div>
                 
                 <p className="text-sm font-bold text-slate-700">Business Logo</p>
                 <p className="text-xs text-slate-400 mt-1">Click image to change</p>
              </div>
           </div>

           {/* RIGHT: Details Form */}
           <div className="md:col-span-2">
              <form onSubmit={handleSave} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                          <User size={14} /> Business Name
                       </label>
                       <input 
                         name="business_name"
                         value={profile.business_name}
                         onChange={handleChange}
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#005F99] font-medium"
                         placeholder="e.g. Acme Corp"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                          <Briefcase size={14} /> Business Type
                       </label>
                       <select 
                         name="business_type"
                         value={profile.business_type}
                         onChange={handleChange}
                         className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#005F99] font-medium"
                       >
                         <option value="">Select Type...</option>
                         <option value="Retail">Retail Store</option>
                         <option value="Hardware">Hardware / Construction</option>
                         <option value="Pharmacy">Pharmacy / Health</option>
                         <option value="Tech">Tech / Agency</option>
                         <option value="Food">Restaurant / Food</option>
                         <option value="Other">Other</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                       <Phone size={14} /> Phone Number
                    </label>
                    <input 
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#005F99] font-medium"
                      placeholder="+94 77 123 4567"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                       <MapPin size={14} /> Business Address
                    </label>
                    <textarea 
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#005F99] font-medium resize-none"
                      placeholder="No. 123, Main Street, Colombo 03"
                    />
                 </div>

                 <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="bg-[#005F99] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#004470] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                 </div>

              </form>
           </div>
        </div>
      </div>
    </div>
  );
}