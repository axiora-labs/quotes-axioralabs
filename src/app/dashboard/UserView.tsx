"use client";

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Loader2, LogOut, Plus, Search, Filter, Edit, Trash2, 
  ChevronDown, Settings, FileText, X, CheckCircle2, 
  AlertTriangle, Calendar, Users, Wallet, Clock,
  BarChart3, TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// --- RECHARTS IMPORTS ---
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- TYPE DEFINITIONS ---
type SortOption = 'newest' | 'oldest' | 'amount_high' | 'amount_low';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled';

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
  status: InvoiceStatus;
}

interface UserViewProps {
  profile: Profile;
}

// --- STATUS STYLES MAPPING ---
const statusStyles: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  cancelled: 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100',
};

// --- CUSTOM CONFIRM MODAL ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmLabel = "Delete",
  loading = false 
}: ConfirmModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white border border-slate-200 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors p-1.5 rounded-md hover:bg-slate-100"><X size={16} /></button>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0"><AlertTriangle size={18} className="text-red-600" /></div>
          <div className="flex-1 pt-0.5"><h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3><p className="text-sm text-slate-600 leading-relaxed">{message}</p></div>
        </div>
        <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}{confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- CUSTOM TOAST ---
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast = ({ 
  message, 
  type = 'success', 
  onClose 
}: ToastProps) => {
  useEffect(() => { const timer = setTimeout(onClose, 4000); return () => clearTimeout(timer); }, [onClose]);
  
  const styles = { 
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900', 
    error: 'bg-red-50 border-red-200 text-red-900', 
    info: 'bg-blue-50 border-blue-200 text-blue-900' 
  };
  const icons = { 
    success: <CheckCircle2 size={16} className="text-emerald-600" />, 
    error: <AlertTriangle size={16} className="text-red-600" />, 
    info: <FileText size={16} className="text-blue-600" /> 
  };

  return (
    <div className="fixed top-20 right-4 z-[110] animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${styles[type]} max-w-sm`}>
        {icons[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-current opacity-60 hover:opacity-100"><X size={14} /></button>
      </div>
    </div>
  );
};

export default function UserView({ profile }: UserViewProps) {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSort, setFilterSort] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Date Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Custom modal states
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Newest First', value: 'newest' }, 
    { label: 'Oldest First', value: 'oldest' },
    { label: 'Highest Amount', value: 'amount_high' }, 
    { label: 'Lowest Amount', value: 'amount_low' },
  ];

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const invoiceRes = await supabase.from('invoices').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
        if (invoiceRes.error) throw invoiceRes.error;
        setInvoices((invoiceRes.data as Invoice[]) || []);
      } catch (error) {
        console.error("UserView Data Error:", error);
        setToast({ message: "Failed to load invoices", type: 'error' });
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

  const handleDelete = async () => {
    if (confirmDelete.id === null) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('invoices').delete().eq('id', confirmDelete.id);
      if (error) throw error;
      setInvoices(prev => prev.filter(inv => inv.id !== confirmDelete.id));
      setToast({ message: "Invoice deleted successfully", type: 'success' });
    } catch (err) { 
      setToast({ message: "Failed to delete invoice.", type: 'error' }); 
    } finally { 
      setDeleting(false); 
      setConfirmDelete({ isOpen: false, id: null }); 
    }
  };

  const handleStatusChange = async (id: number, newStatus: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
    const { error } = await supabase.from('invoices').update({ status: newStatus }).eq('id', id);
    if (error) {
      setToast({ message: "Failed to update status", type: 'error' });
    } else {
      setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
    }
  };

  // --- CHART DATA (Last 6 Months of Paid Revenue) ---
  const chartData = useMemo(() => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = months[d.getMonth()].slice(0, 3);
      const year = d.getFullYear();

      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate.getMonth() === d.getMonth() && 
               invDate.getFullYear() === year && 
               inv.status === 'paid';
      });

      const total = monthInvoices.reduce((acc, inv) => acc + (inv.amount || 0), 0);

      data.push({
        name: `${monthName} '${year.toString().slice(-2)}`,
        earnings: total,
        fullName: `${months[d.getMonth()]} ${year}`
      });
    }
    return data;
  }, [invoices]);

  // --- FILTER LOGIC ---
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter(inv => {
        const matchesSearch = inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (inv.invoice_no && inv.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const invDate = new Date(inv.created_at);
        const matchesMonth = selectedMonth === 'all' || invDate.getMonth() === parseInt(selectedMonth);
        const matchesYear = selectedYear === 'all' || invDate.getFullYear() === parseInt(selectedYear);

        return matchesSearch && matchesMonth && matchesYear;
      })
      .sort((a, b) => {
        switch (filterSort) {
          case 'newest': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'amount_high': return b.amount - a.amount;
          case 'amount_low': return a.amount - b.amount;
          default: return 0;
        }
      });
  }, [invoices, searchQuery, filterSort, selectedMonth, selectedYear]);

  // --- STATS (Dynamically updates based on filters) ---
  const stats = useMemo(() => {
    const paid = filteredInvoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const pending = filteredInvoices.filter(inv => inv.status === 'pending' || inv.status === 'draft').reduce((acc, inv) => acc + (inv.amount || 0), 0);
    const uniqueClients = new Set(filteredInvoices.map(inv => inv.client_name)).size;
    return { paid, pending, uniqueClients, count: filteredInvoices.length };
  }, [filteredInvoices]);

  // Get unique years for filter dropdown
  const availableYears = useMemo(() => {
    const years = new Set(invoices.map(inv => new Date(inv.created_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [invoices]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
         <div className="max-w-7xl mx-auto px-4 h-14 flex justify-between items-center">
             <Link href="/" className="flex items-center gap-2.5">
                <Image src="/axiora-logo.png" alt="Axiora" width={24} height={24} className="rounded-md" />
                <div className="font-semibold text-sm text-slate-900">
                  Axiora <span className="text-slate-400 font-normal">/</span> <span className="text-slate-500">Dashboard</span>
                </div>
             </Link>
             <div className="flex items-center gap-2">
               <Link href="/dashboard/settings" className="text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
                  <Settings size={14}/> <span className="hidden sm:inline">Settings</span>
               </Link>
               <div className="w-px h-5 bg-slate-200 mx-1"></div>
               <button onClick={handleSignOut} className="text-slate-600 hover:text-slate-900 text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors">
                  <LogOut size={14}/> <span className="hidden sm:inline">Sign Out</span>
               </button>
             </div>
         </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* WELCOME HERO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back, {profile.business_name}</h1>
            <p className="text-sm text-slate-500 mt-1">Track your revenue, analyze trends, and manage invoices.</p>
          </div>
          <Link href="/generator" className="w-full md:w-auto bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm">
            <Plus size={16} /> New Invoice
          </Link>
        </div>

        {/* ANALYTICS CHART CARD */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 size={20} className="text-slate-400"/> Earnings Overview
              </h2>
              <p className="text-xs text-slate-500 mt-1">Paid revenue over the last 6 months</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200">
              <TrendingUp size={14} />
              <span>Total (6 Mo): LKR {chartData.reduce((acc, curr) => acc + curr.earnings, 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `${val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}`} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`LKR ${Number(value).toLocaleString()}`, 'Paid Revenue']}
                  labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
                />
                <Bar dataKey="earnings" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.earnings > 0 ? '#0f172a' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DATE FILTERS */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 outline-none focus:border-slate-400 transition-colors"
          >
            <option value="all">All Months</option>
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 outline-none focus:border-slate-400 transition-colors"
          >
            <option value="all">All Years</option>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {(selectedMonth !== 'all' || selectedYear !== 'all') && (
            <button onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }} className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Clear Filters
            </button>
          )}
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue (Paid)</span>
              <Wallet size={16} className="text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">LKR {stats.paid.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">Money in your pocket</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending Amount</span>
              <Clock size={16} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">LKR {stats.pending.toLocaleString()}</div>
            <p className="text-xs text-amber-600 mt-1 font-medium">Waiting for payment</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Invoices</span>
              <FileText size={16} className="text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.count}</div>
            <p className="text-xs text-slate-500 mt-1">{stats.uniqueClients} unique clients</p>
          </div>
        </div>

        {/* TABLE CARD */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search client or invoice #..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:border-slate-400 focus:bg-white transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className="w-full md:w-auto flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md text-xs font-medium hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Filter size={12} /> 
                  {sortOptions.find(o => o.value === filterSort)?.label}
                </span>
                <ChevronDown size={12} />
              </button>
              {showFilters && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-md shadow-lg z-50 overflow-hidden">
                  {sortOptions.map((opt) => (
                    <button 
                      key={opt.value} 
                      onClick={() => {
                        setFilterSort(opt.value); 
                        setShowFilters(false);
                      }} 
                      className={`block w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                        filterSort === opt.value 
                          ? 'bg-slate-900 text-white' 
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/60 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Invoice</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-600">{inv.invoice_no}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 text-sm">{inv.client_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select 
                        value={inv.status || 'pending'} 
                        onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border outline-none cursor-pointer transition-colors ${statusStyles[inv.status || 'pending']}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} />
                        {new Date(inv.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-slate-900 text-sm tabular-nums">
                        LKR {inv.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link 
                          href={`/generator?id=${inv.id}`} 
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Link>
                        <button 
                          onClick={() => setConfirmDelete({ isOpen: true, id: inv.id })} 
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={24} className="text-slate-300" />
                        <p className="text-sm font-medium text-slate-500">
                          {searchQuery ? "No invoices match your search" : "No invoices found for this period"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {filteredInvoices.length} invoices</span>
              <span className="font-mono">Total: LKR {filteredInvoices.reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* FOOTER NOTE */}
        <div className="text-center pt-4 pb-8">
          <p className="text-xs text-slate-400">
            An open source project by <a href="https://www.axioralabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 underline">Axiora Labs</a>
          </p>
        </div>
      </main>

      <ConfirmModal 
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete invoice?"
        message="This action cannot be undone. The invoice and all its data will be permanently removed from your account."
        confirmLabel="Delete Invoice"
        loading={deleting}
      />

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