"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Crown, Lightbulb, ShieldCheck, Loader2 } from "lucide-react";

// --- CUSTOM COMPONENTS ---
import InvoiceEditor from "@/components/InvoiceEditor";
import AdBanner from "@/components/AdBanner";
import EnterpriseModal from "@/components/EnterpriseModal";
import LeadCaptureModal from "@/components/LeadCaptureModal";

// --- LIBRARIES & TYPES ---
import { Language } from "@/lib/dictionaries";
import { InvoiceData } from "@/types";
import { generateProfessionalPDF } from "@/lib/pdfGenerator"; 
import { supabase } from "@/lib/supabase"; 

function GeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  // --- STATE ---
  const [lang, setLang] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  
  // Profile State: null = Guest, Object = Logged In (Free or Paid)
  const [profile, setProfile] = useState<{ business_name: string; is_paid_member: boolean } | null>(null);
  
  // Modal States
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showLeadCapture, setShowLeadCapture] = useState(false);
  
  // Data States
  const [initialData, setInitialData] = useState<InvoiceData | null>(null);
  const [pendingDownloadData, setPendingDownloadData] = useState<InvoiceData | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string>("");

  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 1. Establish User Profile (Prevent "Guest Mode" flicker)
        // Fallback to email name if profile database is empty
        const emailName = user.email?.split('@')[0] || 'My Business';
        let userProfile = { business_name: emailName, is_paid_member: false };

        // 2. Fetch Actual Profile from DB
        const { data: prof } = await supabase
          .from('profiles')
          .select('business_name, is_paid_member')
          .eq('id', user.id)
          .single();
        
        if (prof) {
          userProfile = {
            business_name: prof.business_name || emailName,
            is_paid_member: prof.is_paid_member || false
          };
        }
        
        setProfile(userProfile);

        // 3. Fetch Invoice if Editing
        if (editId) {
          const { data: inv, error } = await supabase
            .from('invoices')
            .select('*') 
            .eq('id', editId)
            .eq('user_id', user.id)
            .single();
          
          if (error || !inv) {
            console.error("Fetch error:", error);
            alert("Invoice not found or access denied.");
            router.push('/dashboard');
            return;
          }

          if (inv.invoice_data) {
            setInitialData(inv.invoice_data as InvoiceData);
          } else {
            // Legacy Data Reconstruction (Safety Fallback)
            setInitialData({
              items: [{ id: 1, desc: 'Restored Item', qty: 1, price: inv.amount || 0, discount: 0, discountType: 'FIXED' }],
              extraFees: [],
              settings: { currency: 'LKR', color: '#005F99', docType: 'INVOICE', taxLabel: 'VAT', taxRate: 0, ssclRate: 0 },
              sender: { name: '', address: '', phone: '', email: '', logoUrl: '' },
              client: { name: inv.client_name || 'Unknown', address: '', phone: '' },
              invoiceNo: inv.invoice_no || `INV-${inv.id}`,
              date: inv.created_at ? new Date(inv.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              dueDate: '',
              notes: 'Restored from legacy record.',
              terms: '',
              subtotal: inv.amount || 0,
              globalDiscount: 0,
              globalDiscountType: 'FIXED',
              grandTotal: inv.amount || 0
            });
          }
        }
      }
      setLoading(false);
    };
    init();
  }, [editId, router]);

  // --- CORE HELPER: Save to Database ---
  const saveToDatabase = async (data: InvoiceData, category: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; 

    // Check Storage Limit (Only if creating NEW record and NOT paid)
    if (!editId && !profile?.is_paid_member) {
      const { count } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      const STORAGE_LIMIT = 20;

      if (count !== null && count >= STORAGE_LIMIT) {
        setShowEnterpriseModal(true); 
        throw new Error("STORAGE_LIMIT_REACHED");
      }
    }

    const payload = {
      user_id: user.id,
      invoice_no: data.invoiceNo,
      client_name: data.client.name || 'Unknown',
      amount: data.grandTotal,
      invoice_data: data 
    };

    let error;
    if (editId) {
      const { error: err } = await supabase.from('invoices').update(payload).eq('id', editId);
      error = err;
    } else {
      const { error: err } = await supabase.from('invoices').insert(payload);
      error = err;
    }

    if (error) throw error;

    // Stealth Analytics (Only for new saves)
    if (data.client.phone && !editId) {
      await supabase.from('leads').insert({
        whatsapp_number: data.client.phone,
        business_category: category,
        location: 'Invoice Generator (User Save)',
      });
    }
  };

  // --- HANDLER: Save Only ---
  const handleSaveOnly = async (data: InvoiceData, category: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Create a free account to save your invoices to the cloud!");
        router.push('/auth'); 
        return;
      }
      await saveToDatabase(data, category);
      alert(editId ? "Invoice updated successfully!" : "Invoice saved to Dashboard!");
    } catch (e: unknown) {
      if (e instanceof Error && e.message === "STORAGE_LIMIT_REACHED") {
        alert("Free Storage limit (20 docs) reached. Please upgrade to save more.");
      } else {
        console.error("Save Error:", e);
        alert("Failed to save. Please check your connection.");
      }
    }
  };

  // --- HANDLER: Download Request ---
  const handleDownloadRequest = async (data: InvoiceData, category: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // GUEST FLOW: Pause and Show Modal
      setPendingDownloadData(data);
      setPendingCategory(category); 
      setShowLeadCapture(true);
    } else {
      // REGISTERED USER FLOW: Direct Download + Save
      try {
        await generateProfessionalPDF(data);
        await saveToDatabase(data, category);
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "STORAGE_LIMIT_REACHED") {
          alert("PDF Downloaded successfully.\n\nHowever, this record was NOT saved to the cloud because your Free Storage (20 docs) is full.");
        } else {
           console.warn("Background Save Warning:", e);
        }
      }
    }
  };

  // --- HANDLER: Guest Download Success ---
  const handleGuestCaptureSuccess = async (whatsapp: string, email: string) => {
    if (!pendingDownloadData) return;

    try {
        // 1. Get IP Info (Client Side) with ROBUST Fallbacks
        // This fixes the "undefined, undefined" issue on Localhost
        let ip = 'Unknown IP';
        let location = 'Unknown Location';

        try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (ipRes.ok) {
                const data = await ipRes.json();
                ip = data.ip || 'Unknown IP';
                
                // If local/reserved IP, API often returns limited data
                if (data.error || data.reserved || data.city === undefined) {
                    location = 'Localhost / Dev Environment';
                } else {
                    const city = data.city || 'Unknown City';
                    const country = data.country_name || 'Unknown Country';
                    location = `${city}, ${country}`;
                }
            }
        } catch (err) {
            console.warn("IP Fetch failed (Using defaults)", err);
        }

        // 2. Insert Lead to Supabase
        const { error } = await supabase.from('leads').insert({
            whatsapp_number: whatsapp,
            email: email,
            business_category: pendingCategory,
            location: location,
            ip_address: ip
        });

        if (error) throw error;

        // 3. Generate PDF & Cleanup
        await generateProfessionalPDF(pendingDownloadData);
        setShowLeadCapture(false);
        setPendingDownloadData(null);
        setPendingCategory("");

    } catch (e) {
        console.error("Guest Capture Error:", e);
        throw e; // Modal handles this error display
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#005F99]" size={40} />
        <p className="text-sm font-bold text-slate-500">Loading Generator...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 text-slate-500 hover:text-[#005F99] transition-colors text-sm font-bold group"
          >
            <div className="p-1.5 rounded-full bg-slate-100 group-hover:bg-blue-50 transition-colors">
               <ArrowLeft size={16} />
            </div>
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="flex items-center gap-2 select-none">
             <div className="w-8 h-8 bg-[#005F99] rounded-lg flex items-center justify-center text-white font-black text-lg shadow-blue-200 shadow-lg">A</div>
             <span className="font-bold text-slate-800 tracking-tight text-lg">Axiora<span className="text-[#00B3B3]">Generator</span></span>
          </div>

          <div className="w-auto flex items-center gap-2">
             <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${profile?.is_paid_member ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                {profile?.is_paid_member ? <Crown size={12} /> : <ShieldCheck size={12} />}
                {/* Shows Profile Name if logged in, else Guest Mode */}
                <span className="truncate max-w-[100px]">{profile ? profile.business_name : 'Guest Mode'}</span>
             </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: EDITOR */}
        <div className="lg:col-span-9 space-y-6">
           {editId && (
             <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 animate-in fade-in">
                <Lightbulb size={16} className="text-amber-600" />
                Editing Existing Invoice {initialData ? `(${initialData.invoiceNo})` : '...'}
             </div>
           )}

           <InvoiceEditor 
            lang={lang} 
            setLang={setLang} 
            onDownloadClick={handleDownloadRequest} 
            onSaveClick={handleSaveOnly} 
            initialData={initialData} 
          />
        </div>

        {/* RIGHT: SIDEBAR */}
        <div className="lg:col-span-3 space-y-6">
          
          <AdBanner position="sidebar" />
          
          {/* Upsell Card (Only for Free Users) */}
          {!profile?.is_paid_member && (
            <div className="bg-gradient-to-br from-[#005F99] to-[#004470] rounded-2xl p-6 text-center text-white shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl group-hover:bg-white/20 transition-all"></div>
              
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20 shadow-inner">
                <Crown size={24} className="text-yellow-400" />
              </div>
              
              <h3 className="font-bold text-lg mb-2">Go Enterprise</h3>
              <p className="text-blue-100 text-xs leading-relaxed mb-4">
                Unlimited storage, premium AI credits, and removed branding.
              </p>
              
              <button 
                onClick={() => setShowEnterpriseModal(true)}
                className="w-full py-3 bg-white text-[#005F99] text-xs font-bold rounded-xl hover:bg-blue-50 transition-all shadow-md active:scale-95"
              >
                Upgrade Now
              </button>
            </div>
          )}

          {/* Tips */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
             <div className="flex items-center gap-2 mb-3">
                <Lightbulb size={18} className="text-yellow-500" />
                <h4 className="font-bold text-slate-700 text-sm">Pro Tips</h4>
             </div>
             <ul className="text-xs text-slate-500 space-y-3 list-disc pl-4 leading-relaxed marker:text-[#00B3B3]">
               <li>
                 <span className="font-semibold text-slate-700">Singlish works!</span> Try typing 
                 <i className="text-slate-400"> &quot;Simenti kotta 5k&quot;</i>.
               </li>
               <li>
                 Click <span className="font-semibold text-slate-700">&quot;Edit Business Details&quot;</span> to auto-load your Logo.
               </li>
               <li>
                 Switch to <span className="font-semibold text-slate-700">&quot;Quotation&quot;</span> mode to set validity dates.
               </li>
             </ul>
          </div>

          <div className="text-center">
             <p className="text-[10px] text-slate-400 font-medium">
               Trusted by 100+ Sri Lankan Businesses
             </p>
          </div>

          <AdBanner position="sidebar" />

        </div>
      </main>

      {/* MODALS */}
      <EnterpriseModal 
        isOpen={showEnterpriseModal} 
        onClose={() => setShowEnterpriseModal(false)} 
      />
      
      <LeadCaptureModal 
        isOpen={showLeadCapture} 
        onClose={() => setShowLeadCapture(false)} 
        onSuccess={handleGuestCaptureSuccess} 
      />
      
    </div>
  );
}

// --- MAIN PAGE EXPORT ---
export default function GeneratorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="animate-spin text-[#005F99]" size={40} />
      </div>
    }>
      <GeneratorContent />
    </Suspense>
  );
}