"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Lightbulb, Loader2, Github, Heart, 
  CheckCircle2, AlertTriangle, FileText, X 
} from "lucide-react";

// --- CUSTOM COMPONENTS ---
import InvoiceEditor from "@/components/InvoiceEditor";

// --- LIBRARIES & TYPES ---
import { Language } from "@/lib/dictionaries";
import { InvoiceData } from "@/types";
import { generateProfessionalPDF } from "@/lib/pdfGenerator"; 
import { supabase } from "@/lib/supabase"; 

// --- CUSTOM TOAST ---
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
    info: <FileText size={16} className="text-blue-600" />,
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

function GeneratorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  // --- STATE ---
  const [lang, setLang] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Profile State: null = Guest, Object = Logged In
  const [profile, setProfile] = useState<{ business_name: string } | null>(null);
  
  // Data States
  const [initialData, setInitialData] = useState<InvoiceData | null>(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const emailName = user.email?.split('@')[0] || 'My Business';
        let userProfile = { business_name: emailName };

        const { data: prof } = await supabase
          .from('profiles')
          .select('business_name')
          .eq('id', user.id)
          .single();
        
        if (prof) {
          userProfile = {
            business_name: prof.business_name || emailName,
          };
        }
        
        setProfile(userProfile);

        if (editId) {
          const { data: inv, error } = await supabase
            .from('invoices')
            .select('*') 
            .eq('id', editId)
            .eq('user_id', user.id)
            .single();
          
          if (error || !inv) {
            console.error("Fetch error:", error);
            setToast({ message: "Invoice not found or access denied.", type: 'error' });
            setTimeout(() => router.push('/dashboard'), 2000);
            return;
          }

          if (inv.invoice_data) {
            setInitialData(inv.invoice_data as InvoiceData);
          } else {
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

    const payload = {
      user_id: user.id,
      invoice_no: data.invoiceNo,
      client_name: data.client.name || 'Unknown',
      amount: data.grandTotal,
      invoice_data: data,
      status: 'pending' // <--- DEFAULT STATUS FOR NEW INVOICES
    };

    let error;
    if (editId) {
      // WHEN EDITING: We intentionally OMIT the 'status' field so we don't overwrite 
      // an existing status (like 'paid') back to 'pending'.
      const { error: err } = await supabase.from('invoices').update({
         invoice_no: payload.invoice_no,
         client_name: payload.client_name,
         amount: payload.amount,
         invoice_data: payload.invoice_data
      }).eq('id', editId);
      error = err;
    } else {
      // WHEN CREATING: We insert the full payload, including the default 'pending' status.
      const { error: err } = await supabase.from('invoices').insert(payload);
      error = err;
    }

    if (error) throw error;

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
        setToast({ message: "Please sign in to save invoices to your cloud dashboard.", type: 'info' });
        setTimeout(() => router.push('/auth'), 2000);
        return;
      }
      await saveToDatabase(data, category);
      setToast({ message: editId ? "Invoice updated successfully!" : "Invoice saved to your dashboard!", type: 'success' });
    } catch (e: unknown) {
      console.error("Save Error:", e);
      setToast({ message: "Failed to save invoice. Please check your connection.", type: 'error' });
    }
  };

  // --- HANDLER: Download Request ---
  const handleDownloadRequest = async (data: InvoiceData, category: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Guest flow: just download
      try {
        await generateProfessionalPDF(data);
        setToast({ message: "Invoice downloaded! Sign in to save your history.", type: 'success' });
      } catch (e) {
        setToast({ message: "Failed to generate PDF.", type: 'error' });
      }
    } else {
      try {
        await generateProfessionalPDF(data);
        await saveToDatabase(data, category);
        setToast({ message: "Invoice downloaded and saved!", type: 'success' });
      } catch (e: unknown) {
        console.warn("Background Save Warning:", e);
        setToast({ message: "PDF downloaded, but failed to save to cloud.", type: 'error' });
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-slate-900" size={24} />
        <p className="text-xs font-medium text-slate-500">Loading generator...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium group"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="w-px h-5 bg-slate-200"></div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/axiora-logo.png" alt="Axiora" width={20} height={20} className="rounded-md" />
              <span className="font-semibold text-sm text-slate-900">
                Axiora <span className="text-slate-400 font-normal">/</span> <span className="text-slate-500">Generator</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {profile ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md text-xs font-medium text-slate-700">
                <div className="w-5 h-5 rounded-full bg-slate-300 flex items-center justify-center text-[10px] font-bold text-white">
                  {profile.business_name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{profile.business_name}</span>
              </div>
            ) : (
              <Link href="/auth" className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
                Sign in to save
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: EDITOR */}
        <div className="lg:col-span-9 space-y-4">
           {editId && (
             <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <Lightbulb size={14} className="text-amber-600" />
                Editing existing invoice {initialData ? `(${initialData.invoiceNo})` : '...'}
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
        <div className="lg:col-span-3 space-y-4">
          
          {/* Tips Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-500" /> Tips
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>Use <b>Rich Text</b> in Notes & Terms for bold, italic, and lists.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>Click <b>Design</b> to change fonts, sizes, and layout density.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-slate-400 mt-1">•</span>
                <span>Switch between <b>Invoice</b> and <b>Quotation</b> modes.</span>
              </li>
            </ul>
          </div>

          {/* Open Source / Free Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={14} className="text-red-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider">Free & Open Source</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              This tool is completely free. No ads, no tracking, no limits. Built for the community.
            </p>
            <a 
              href="https://github.com/axiora-labs/quotes-axioralabs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 bg-white text-slate-900 text-xs font-medium rounded-md hover:bg-slate-100 transition-colors"
            >
              <Github size={12} /> Star on GitHub
            </a>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4">
            <p className="text-[10px] text-slate-400">
              An open source project by <a href="https://www.axioralabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline">Axiora Labs</a>
            </p>
          </div>

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

// --- MAIN PAGE EXPORT ---
export default function GeneratorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-900" size={24} />
      </div>
    }>
      <GeneratorContent />
    </Suspense>
  );
}