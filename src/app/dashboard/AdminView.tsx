"use client";

import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, FileText, Zap, RefreshCw, LogOut, 
  Image as ImageIcon, Menu, X, 
  LayoutDashboard, DollarSign, MapPin, List, MousePointer, Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- 1. STRICT TYPE DEFINITIONS (ALL TABLES) ---

interface UserProfile {
  id: string;
  business_name: string;
  phone?: string;
  role: 'user' | 'admin';
  tier?: 'free' | 'pro';
  is_paid_member: boolean;
  address?: string;
  business_type?: string;
  logo_url?: string;
  created_at: string;
}

interface SystemInvoice {
  id: number;
  user_id: string;
  invoice_no: string;
  client_name: string;
  amount: number;
  // Use unknown instead of any for JSON data to be safe
  invoice_data?: Record<string, unknown>; 
  created_at: string;
}

interface Lead {
  id: number;
  whatsapp_number: string;
  business_category: string;
  location: string;
  ip_address: string;
  generated_at: string;
}

interface AiUsage {
  id: number;
  user_id?: string;
  ip_address: string;
  usage_date: string;
  count: number;
  created_at: string;
}

interface Payment {
  id: number;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  package_type: string;
  payment_method: string;
  transaction_id: string;
  created_at: string;
}

interface CreditLog {
  id: number;
  user_id?: string;
  ip_address?: string;
  action_type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface Ad {
  id: number;
  image_url: string;
  redirect_url?: string;
  position: 'sidebar' | 'modal' | 'banner';
  is_active: boolean;
  created_at?: string;
}

// --- SUB-COMPONENT PROPS ---

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

interface DataTableProps<T> {
  columns: string[];
  data: T[];
  renderRow: (item: T) => ReactNode;
}

interface BadgeProps {
  val: string;
  color?: 'gray' | 'green' | 'red' | 'blue' | 'purple';
}

export default function AdminView({ profile }: { profile: UserProfile }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentUser = profile; // Kept for future logic if needed
  const router = useRouter();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'invoices' | 'leads' | 'ai' | 'payments' | 'credits' | 'ads'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [loading, setLoading] = useState(true);
  
  // Data Buckets
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invoices, setInvoices] = useState<SystemInvoice[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [aiUsage, setAiUsage] = useState<AiUsage[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);

  // IP Location Cache
  const [resolvedLocations, setResolvedLocations] = useState<Record<string, string>>({});

  // --- 2. DATA INGESTION (FETCH EVERYTHING) ---
  const fetchGodModeData = async () => {
    setLoading(true);
    try {
      const [
        userRes, invRes, leadsRes, aiRes, payRes, creditRes, adsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('generated_at', { ascending: false }),
        supabase.from('ai_usage').select('*').order('usage_date', { ascending: false }).limit(100),
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('credit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('ads').select('*').order('id', { ascending: true })
      ]);

      if (userRes.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processedUsers = userRes.data.map((u: any) => ({
          ...u,
          is_paid_member: u.is_paid_member || u.tier === 'pro'
        }));
        setUsers(processedUsers as UserProfile[]);
      }
      
      if (invRes.data) setInvoices(invRes.data as SystemInvoice[]);
      if (leadsRes.data) setLeads(leadsRes.data as Lead[]);
      if (aiRes.data) setAiUsage(aiRes.data as AiUsage[]);
      if (payRes.data) setPayments(payRes.data as Payment[]);
      if (creditRes.data) setCreditLogs(creditRes.data as CreditLog[]);
      if (adsRes.data) setAds(adsRes.data as Ad[]);

    } catch (err) {
      console.error("Admin Fetch Error:", err);
      alert("Error fetching data. Check console.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGodModeData();
  }, []);

  // --- 3. HELPERS ---
  
  const resolveIp = async (ip: string) => {
    if (resolvedLocations[ip]) return; 
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`);
      const data = await res.json();
      const loc = `${data.city}, ${data.country_name}`;
      setResolvedLocations(prev => ({ ...prev, [ip]: loc }));
    } catch (e) {
      console.warn("IP Resolve Failed", e);
      setResolvedLocations(prev => ({ ...prev, [ip]: "Unknown" }));
    }
  };

  const toggleEnterprise = async (userId: string, currentStatus: boolean) => {
    if (!confirm("Change membership status?")) return;
    const newStatus = !currentStatus;
    const { error } = await supabase.from('profiles').update({ is_paid_member: newStatus }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_paid_member: newStatus } : u));
    }
  };

  // --- 4. RENDER ---
  return (
    <div className="flex h-screen bg-[#F1F5F9] font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#001829] text-white transition-all duration-300 flex flex-col shadow-xl z-50`}>
        <div className="h-16 flex items-center justify-center border-b border-white/10">
           {isSidebarOpen ? <span className="font-black text-xl tracking-tight">AXIORA<span className="text-[#00B3B3]">ADMIN</span></span> : <span className="font-black">A</span>}
        </div>

        <nav className="flex-1 py-6 space-y-1 px-2 overflow-y-auto custom-scrollbar">
           <NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active={activeTab === 'dashboard'} open={isSidebarOpen} onClick={() => setActiveTab('dashboard')} />
           <NavItem icon={<Users size={18}/>} label="User Registry" active={activeTab === 'users'} open={isSidebarOpen} onClick={() => setActiveTab('users')} />
           <NavItem icon={<FileText size={18}/>} label="Invoices" active={activeTab === 'invoices'} open={isSidebarOpen} onClick={() => setActiveTab('invoices')} />
           <NavItem icon={<MousePointer size={18}/>} label="Leads" active={activeTab === 'leads'} open={isSidebarOpen} onClick={() => setActiveTab('leads')} />
           <NavItem icon={<Zap size={18}/>} label="AI Usage" active={activeTab === 'ai'} open={isSidebarOpen} onClick={() => setActiveTab('ai')} />
           <NavItem icon={<DollarSign size={18}/>} label="Payments" active={activeTab === 'payments'} open={isSidebarOpen} onClick={() => setActiveTab('payments')} />
           <NavItem icon={<List size={18}/>} label="Credit Logs" active={activeTab === 'credits'} open={isSidebarOpen} onClick={() => setActiveTab('credits')} />
           <NavItem icon={<ImageIcon size={18}/>} label="Ad Campaigns" active={activeTab === 'ads'} open={isSidebarOpen} onClick={() => setActiveTab('ads')} />
        </nav>

        <div className="p-3 border-t border-white/10">
           <button onClick={() => supabase.auth.signOut().then(() => router.push('/auth'))} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/20 text-slate-400">
              <LogOut size={18} />
              {isSidebarOpen && <span className="font-bold text-xs uppercase">Sign Out</span>}
           </button>
           <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mt-2 flex justify-center w-full p-2 bg-white/5 rounded hover:bg-white/10 text-slate-500">
              {isSidebarOpen ? <X size={14}/> : <Menu size={14}/>}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
         <header className="h-16 bg-white border-b border-slate-200 flex justify-between items-center px-6 shadow-sm shrink-0">
            <h2 className="font-black text-slate-800 text-lg uppercase tracking-wide">{activeTab}</h2>
            <div className="flex items-center gap-4">
               <button onClick={fetchGodModeData} className="p-2 bg-slate-50 rounded hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors">
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
               </button>
            </div>
         </header>

         <div className="flex-1 overflow-auto p-6">
            
            {/* --- DASHBOARD TAB --- */}
            {activeTab === 'dashboard' && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Revenue" value={payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()} icon={<DollarSign/>} />
                  <StatCard title="Total Users" value={users.length} icon={<Users/>} />
                  <StatCard title="Total Invoices" value={invoices.length} icon={<FileText/>} />
                  <StatCard title="Leads Captured" value={leads.length} icon={<MousePointer/>} />
               </div>
            )}

            {/* --- USERS TAB (FULL DETAILS) --- */}
            {activeTab === 'users' && (
               <DataTable<UserProfile>
                  columns={['ID', 'Business', 'Phone', 'Address', 'Type', 'Role', 'Status', 'Logo', 'Created']}
                  data={users}
                  renderRow={(u) => (
                     <>
                        <td className="font-mono text-[10px] text-slate-500">{u.id}</td>
                        <td className="font-bold text-slate-800">{u.business_name}</td>
                        <td>{u.phone || '-'}</td>
                        <td className="text-xs truncate max-w-[150px]" title={u.address}>{u.address || '-'}</td>
                        <td>{u.business_type || '-'}</td>
                        <td><Badge val={u.role} /></td>
                        <td>
                           <button onClick={() => toggleEnterprise(u.id, u.is_paid_member)}>
                              <Badge val={u.is_paid_member ? 'PRO' : 'FREE'} color={u.is_paid_member ? 'green' : 'gray'} />
                           </button>
                        </td>
                        <td>
                           {u.logo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={u.logo_url} alt="Logo" className="w-8 h-8 rounded border object-contain bg-white" />
                           ) : '-'}
                        </td>
                        <td className="text-[10px]">{new Date(u.created_at).toLocaleDateString()}</td>
                     </>
                  )}
               />
            )}

            {/* --- INVOICES TAB --- */}
            {activeTab === 'invoices' && (
               <DataTable<SystemInvoice> 
                  columns={['Invoice #', 'User ID', 'Client', 'Amount', 'Date', 'Data (JSON)']}
                  data={invoices}
                  renderRow={(inv) => (
                     <>
                        <td className="font-mono font-bold text-slate-700">{inv.invoice_no}</td>
                        <td className="font-mono text-[10px] text-slate-400">{inv.user_id.slice(0,8)}...</td>
                        <td>{inv.client_name}</td>
                        <td className="font-bold text-emerald-600">{inv.amount}</td>
                        <td className="text-xs">{new Date(inv.created_at).toLocaleDateString()}</td>
                        <td className="text-[10px] max-w-[200px] truncate font-mono text-slate-400">
                           {JSON.stringify(inv.invoice_data)}
                        </td>
                     </>
                  )}
               />
            )}

            {/* --- LEADS TAB --- */}
            {activeTab === 'leads' && (
               <DataTable<Lead> 
                  columns={['ID', 'WhatsApp', 'Category', 'Location', 'IP Address', 'Date']}
                  data={leads}
                  renderRow={(lead) => (
                     <>
                        <td>{lead.id}</td>
                        <td className="font-mono text-green-600">{lead.whatsapp_number}</td>
                        <td><Badge val={lead.business_category} color="blue"/></td>
                        <td>{lead.location || '-'}</td>
                        <td className="font-mono text-xs">{lead.ip_address}</td>
                        <td className="text-xs">{new Date(lead.generated_at).toLocaleString()}</td>
                     </>
                  )}
               />
            )}

            {/* --- AI USAGE TAB --- */}
            {activeTab === 'ai' && (
               <DataTable<AiUsage> 
                  columns={['ID', 'User ID', 'IP Address', 'Location Lookup', 'Count', 'Date']}
                  data={aiUsage}
                  renderRow={(ai) => (
                     <>
                        <td>{ai.id}</td>
                        <td className="font-mono text-[10px]">{ai.user_id || 'GUEST'}</td>
                        <td className="font-mono text-xs text-blue-600">{ai.ip_address}</td>
                        <td>
                           {resolvedLocations[ai.ip_address] ? (
                              <span className="text-xs font-bold text-slate-700">{resolvedLocations[ai.ip_address]}</span>
                           ) : (
                              <button onClick={() => resolveIp(ai.ip_address)} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded border flex items-center gap-1">
                                 <MapPin size={10}/> Check Loc
                              </button>
                           )}
                        </td>
                        <td className="font-bold">{ai.count}</td>
                        <td className="text-xs">{ai.usage_date}</td>
                     </>
                  )}
               />
            )}

            {/* --- PAYMENTS TAB --- */}
            {activeTab === 'payments' && (
               <DataTable<Payment> 
                  columns={['ID', 'User ID', 'Amount', 'Currency', 'Status', 'Package', 'Method', 'Date']}
                  data={payments}
                  renderRow={(pay) => (
                     <>
                        <td>{pay.id}</td>
                        <td className="font-mono text-[10px]">{pay.user_id.slice(0,8)}...</td>
                        <td className="font-bold">{pay.amount}</td>
                        <td className="text-xs">{pay.currency}</td>
                        <td><Badge val={pay.status} color={pay.status === 'completed' ? 'green' : 'red'} /></td>
                        <td>{pay.package_type}</td>
                        <td>{pay.payment_method}</td>
                        <td className="text-xs">{new Date(pay.created_at).toLocaleDateString()}</td>
                     </>
                  )}
               />
            )}

            {/* --- CREDIT LOGS TAB --- */}
            {activeTab === 'credits' && (
               <DataTable<CreditLog> 
                  columns={['ID', 'User ID', 'Action', 'Amount', 'Description', 'IP', 'Date']}
                  data={creditLogs}
                  renderRow={(log) => (
                     <>
                        <td>{log.id}</td>
                        <td className="font-mono text-[10px]">{log.user_id?.slice(0,8) || '-'}</td>
                        <td><Badge val={log.action_type} /></td>
                        <td className={`font-bold ${log.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {log.amount > 0 ? '+' : ''}{log.amount}
                        </td>
                        <td className="text-xs text-slate-600">{log.description}</td>
                        <td className="font-mono text-[10px]">{log.ip_address}</td>
                        <td className="text-xs">{new Date(log.created_at).toLocaleString()}</td>
                     </>
                  )}
               />
            )}

            {/* --- ADS TAB --- */}
            {activeTab === 'ads' && (
               <DataTable<Ad> 
                  columns={['ID', 'Image', 'Redirect URL', 'Position', 'Active', 'Created']}
                  data={ads}
                  renderRow={(ad) => (
                     <>
                        <td>{ad.id}</td>
                        <td>
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={ad.image_url} alt="Ad" className="w-16 h-10 object-cover rounded border" />
                        </td>
                        <td className="text-xs max-w-[200px] truncate">
                           <a href={ad.redirect_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{ad.redirect_url}</a>
                        </td>
                        <td><Badge val={ad.position} color="purple"/></td>
                        <td><Badge val={ad.is_active ? 'YES' : 'NO'} color={ad.is_active ? 'green' : 'red'} /></td>
                        <td className="text-xs">{ad.created_at ? new Date(ad.created_at).toLocaleDateString() : '-'}</td>
                     </>
                  )}
               />
            )}
            
         </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ icon, label, active, open, onClick }: NavItemProps) {
   return (
      <button 
         onClick={onClick}
         className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all text-sm font-medium ${
            active ? 'bg-[#005F99] text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'
         } ${!open && 'justify-center'}`}
      >
         {icon}
         {open && <span>{label}</span>}
      </button>
   );
}

function StatCard({ title, value, icon }: StatCardProps) {
   return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
         <div className="p-3 bg-blue-50 text-[#005F99] rounded-lg">{icon}</div>
         <div>
            <p className="text-xs font-bold text-slate-400 uppercase">{title}</p>
            <p className="text-2xl font-black text-slate-800">{value}</p>
         </div>
      </div>
   );
}

function DataTable<T>({ columns, data, renderRow }: DataTableProps<T>) {
   if (!data || data.length === 0) return (
      <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
         <Database className="mx-auto text-slate-300 mb-4" size={48} />
         <p className="text-slate-500 font-bold">No Records Found</p>
      </div>
   );

   return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 border-b border-slate-200">
                  <tr>
                     {columns.map((c, i) => <th key={i} className="px-6 py-4 whitespace-nowrap">{c}</th>)}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {data.map((item, i) => (
                     <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                        {renderRow(item)}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}

function Badge({ val, color = 'gray' }: BadgeProps) {
   const colors = {
      gray: 'bg-slate-100 text-slate-600',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
   };
   return (
      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${colors[color] || colors.gray}`}>
         {val}
      </span>
   );
}