"use client";

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { 
  Loader2, LogOut, TrendingUp, Plus, 
  Search, Filter, Edit, Trash2, ChevronDown, 
  Crown, ShieldAlert, Settings 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AdBanner from '@/components/AdBanner'; 
import EnterpriseModal from '@/components/EnterpriseModal';
import PaymentModal from '@/components/PaymentModal';

// --- TYPE DEFINITIONS ---
type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low';

export interface Profile {
  id: string;
  business_name: string;
  role: 'user' | 'admin';
  is_paid_member: boolean;
}

interface Invoice {
  id: number;
  client_name: string;
  amount: number;
  created_at: string;
  invoice_no: string;
  user_id: string; 
}

interface AiCreditState {
  remaining: number;
  total: number;
}

interface UserViewProps {
  profile: Profile;
}

export default function UserView({ profile }: UserViewProps) {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [showEnterpriseModal, setShowEnterpriseModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Data States
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [aiCredits, setAiCredits] = useState<AiCreditState>({ remaining: 0, total: 10 });

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSort, setFilterSort] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Constants
  const STORAGE_LIMIT = 20;

  // Sort Options Helper
  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Amount', value: 'amount_high' },
    { label: 'Lowest Amount', value: 'amount_low' },
  ];

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Session for Auth Header
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        const authHeaders: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // 2. Fetch Invoices & AI Credits Parallel
        const [invoiceRes, aiRes] = await Promise.all([
          supabase
            .from('invoices')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false }),
            
          fetch('/api/ai-check', { 
            cache: 'no-store',
            headers: authHeaders
          }).then(res => res.json())
        ]);

        if (invoiceRes.error) throw invoiceRes.error;
        
        setInvoices((invoiceRes.data as Invoice[]) || []);

        if (aiRes && typeof aiRes.credits === 'number') {
          setAiCredits({ remaining: aiRes.credits, total: aiRes.total_limit || 10 });
        }

      } catch (error) {
        console.error("UserView Data Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile.id]);

  // --- HANDLERS ---
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice? This cannot be undone.")) return;
    
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      
      // Optimistic update
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (err: unknown) {
      console.error("Delete Error:", err);
      alert("Failed to delete record. Please check your connection.");
    }
  };

  const handlePaymentSuccess = () => {
    // Reload to refresh profile state (paid status) from DB
    window.location.reload(); 
  };

  // --- FILTER LOGIC ---
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(inv => 
        inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (inv.invoice_no && inv.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .sort((a, b) => {
        switch (filterSort) {
          case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'amount_high': return b.amount - a.amount;
          case 'amount_low': return a.amount - b.amount;
          default: return 0;
        }
      });
  }, [invoices, searchQuery, filterSort]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-[#005F99]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
         <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#005F99] rounded-lg flex items-center justify-center text-white font-bold">A</div>
                <div>
                   <h1 className="font-bold text-slate-900 text-sm md:text-base">Axiora Dashboard</h1>
                   <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                      {profile.is_paid_member ? (
                        <span className="text-amber-600 flex items-center gap-1"><Crown size={12}/> Enterprise Plan</span>
                      ) : (
                        <span className="text-slate-400">Free Plan</span>
                      )}
                   </div>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
               <Link 
                 href="/dashboard/settings" 
                 className="text-slate-500 hover:text-[#005F99] text-xs font-bold flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg transition-colors"
               >
                  <Settings size={14}/> <span className="hidden sm:inline">Settings</span>
               </Link>

               <button onClick={handleSignOut} className="text-slate-500 hover:text-red-600 text-xs font-bold flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-lg transition-colors">
                  <LogOut size={14}/> <span className="hidden sm:inline">Sign Out</span>
               </button>
             </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        
        {/* GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* MAIN CONTENT COLUMN */}
            <div className="lg:col-span-3 space-y-6">
               
               {/* Hero Section */}
               <div className="bg-gradient-to-r from-[#005F99] to-[#004470] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Hello, {profile.business_name}</h2>
                      <p className="text-blue-100 text-sm">
                        You have used <span className="font-bold text-white">{invoices.length}</span> of <span className="font-bold text-white">{profile.is_paid_member ? '∞' : STORAGE_LIMIT}</span> document spaces.
                      </p>
                    </div>
                    <Link href="/generator" className="w-full md:w-auto bg-white text-[#005F99] px-8 py-3 rounded-xl font-bold hover:bg-blue-50 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95">
                      <Plus size={20} /> New Invoice
                    </Link>
                  </div>
               </div>

               {/* Table Controls */}
               <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
                 <div className="relative w-full md:w-96">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input 
                     type="text" 
                     placeholder="Search client or invoice #..." 
                     className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-[#005F99]"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                   />
                 </div>
                 <div className="relative w-full md:w-auto">
                    <button onClick={() => setShowFilters(!showFilters)} className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold">
                      <Filter size={14} /> Sort By <ChevronDown size={14} />
                    </button>
                    {showFilters && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                          {sortOptions.map((opt) => (
                            <button 
                              key={opt.value} 
                              onClick={() => {
                                setFilterSort(opt.value); 
                                setShowFilters(false);
                              }} 
                              className="block w-full text-left px-4 py-2 text-xs font-bold uppercase hover:bg-slate-50 text-slate-600"
                            >
                              {opt.label}
                            </button>
                          ))}
                      </div>
                    )}
                 </div>
               </div>

               {/* Invoices List */}
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-6 py-4">Client Details</th>
                          <th className="px-6 py-4">Invoice No</th>
                          <th className="px-6 py-4 text-right">Grand Total</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-700">{inv.client_name}</td>
                            <td className="px-6 py-4 font-mono text-slate-400 text-xs">{inv.invoice_no}</td>
                            <td className="px-6 py-4 text-right font-bold text-[#005F99]">LKR {inv.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-1">
                                <Link href={`/generator?id=${inv.id}`} className="p-2 text-slate-400 hover:text-[#005F99] hover:bg-blue-50 rounded-lg transition-colors">
                                  <Edit size={16} />
                                </Link>
                                <button 
                                  onClick={() => handleDelete(inv.id)} 
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredInvoices.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-slate-400 text-sm">
                              No invoices found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">
              
              {/* Account Usage Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                   <TrendingUp size={16} className="text-[#005F99]"/> Account Usage
                 </h3>
                 
                 {/* Storage Progress */}
                 <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Cloud Storage</span>
                      {profile.is_paid_member ? (
                        <span className="text-[#00B3B3]">Unlimited</span>
                      ) : (
                        <span className={invoices.length >= STORAGE_LIMIT ? 'text-red-500' : ''}>
                          {invoices.length} / {STORAGE_LIMIT}
                        </span>
                      )}
                    </div>
                    
                    {!profile.is_paid_member && (
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${invoices.length >= STORAGE_LIMIT ? 'bg-red-500' : 'bg-[#00B3B3]'}`}
                          style={{ width: `${Math.min((invoices.length / STORAGE_LIMIT) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                 </div>

                 {/* AI Credits Progress */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
                      <span>Daily AI Credits</span>
                      <span>{aiCredits.remaining} / {aiCredits.total}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-[#005F99] h-full transition-all duration-700"
                        style={{ width: `${Math.min((aiCredits.remaining / aiCredits.total) * 100, 100)}%` }}
                      />
                    </div>
                 </div>

                 {/* Upgrade CTA */}
                 {!profile.is_paid_member && (
                   <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-2">
                         <ShieldAlert size={14}/> Storage Warning
                      </div>
                      <p className="text-[10px] text-amber-600 font-medium leading-relaxed mb-3">
                        You are using the Free Plan. Upgrade for unlimited storage and 500 daily AI credits.
                      </p>
                      <button 
                        onClick={() => setShowPaymentModal(true)} // Opens Payment Modal
                        className="w-full py-2 bg-[#005F99] text-white text-[10px] font-bold rounded-lg shadow-md hover:bg-[#004470]"
                      >
                        UPGRADE NOW
                      </button>
                   </div>
                 )}
              </div>

              <AdBanner position="sidebar" />
            </div>
        </div>
      </main>

      {/* MODALS */}
      {/* Enterprise Modal (Storage Limit Hit) -> Redirects to Payment */}
      <EnterpriseModal 
        isOpen={showEnterpriseModal} 
        onClose={() => setShowEnterpriseModal(false)} 
        // No @ts-expect-error needed anymore, logic is sound
        onUpgradeClick={() => {
           setShowEnterpriseModal(false);
           setShowPaymentModal(true);
        }}
      />

      {/* Payment Modal (The Gateway) */}
      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}