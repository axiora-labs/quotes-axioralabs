"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Download, Sparkles, User, Settings, 
  RefreshCw, ChevronDown, ChevronUp, Globe, Clock, 
  FileText, CreditCard, Save, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { dictionary, Language } from '@/lib/dictionaries';
import { 
  InvoiceItem, InvoiceData, InvoiceSettings, BusinessDetails, ClientDetails, 
  AiApiResponse, AiResponseItem, ExtraFee, AmountType 
} from '@/types';
import { currencies } from '@/lib/currencies';
import AdBanner from './AdBanner'; 

// --- HELPER: Stealth Analytics Category Detection ---
const detectCategory = (items: InvoiceItem[]): string => {
  const text = items.map(i => i.desc.toLowerCase()).join(' ');
  if (text.match(/cement|paint|roof|tile|pipe|nail|wood|sand|brick|steel|hardware/)) return 'Hardware';
  if (text.match(/rice|sugar|dhal|oil|soap|milk|tea|biscuit|cheese|food|grocery/)) return 'Grocery';
  if (text.match(/phone|screen|battery|charger|laptop|mouse|keyboard|usb|monitor|tech/)) return 'Tech/Mobile';
  if (text.match(/repair|service|labor|install|fix|maintain|web|dev|consult/)) return 'Service';
  if (text.match(/dress|shirt|pant|fabric|cloth|saree|denim|fashion/)) return 'Textile';
  return 'General';
};

interface InvoiceEditorProps {
  lang: Language;
  setLang: (l: Language) => void;
  onDownloadClick: (data: InvoiceData, category: string) => void;
  onSaveClick: (data: InvoiceData, category: string) => void;
  initialData?: InvoiceData | null;
}

export default function InvoiceEditor({ lang, onDownloadClick, onSaveClick, initialData }: InvoiceEditorProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const t = dictionary[lang];
  
  // --- STATE ---
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, desc: '', qty: 1, price: 0, discount: 0, discountType: 'FIXED' }
  ]);
  const [extraFees, setExtraFees] = useState<ExtraFee[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<AmountType>('FIXED');

  const [settings, setSettings] = useState<InvoiceSettings>({
    currency: 'LKR',
    color: '#005F99',
    docType: 'INVOICE',
    taxLabel: 'VAT',
    taxRate: 0,
    ssclRate: 0
  });

  const [sender, setSender] = useState<BusinessDetails>({ name: '', address: '', phone: '', email: '', logoUrl: '' });
  const [client, setClient] = useState<ClientDetails>({ name: '', address: '', phone: '' });
  
  // Metadata
  const [idNumber, setIdNumber] = useState('0000'); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  // AI & UI State
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiCredits, setAiCredits] = useState<number | null>(null);
  const [resetTime, setResetTime] = useState<string>(""); 
  const [showSettings, setShowSettings] = useState(false);

  const displayId = `${settings.docType === 'INVOICE' ? 'INV' : 'QTN'}-${idNumber}`;

  // --- EFFECTS ---
  useEffect(() => {
    if (initialData) {
      // Load existing data
      const timer = setTimeout(() => {
        setItems(initialData.items || []);
        setExtraFees(initialData.extraFees || []);
        setSettings(initialData.settings);
        setSender(initialData.sender);
        setClient(initialData.client);
        
        const idParts = initialData.invoiceNo ? initialData.invoiceNo.split('-') : [];
        if (idParts.length > 1) setIdNumber(idParts[1]);

        setDate(initialData.date);
        setDueDate(initialData.dueDate);
        setNotes(initialData.notes);
        setTerms(initialData.terms);
        setGlobalDiscount(initialData.globalDiscount);
        setGlobalDiscountType(initialData.globalDiscountType);
        
        setShowSettings(true); 
      }, 0);
      return () => clearTimeout(timer);
    } else {
      // New Invoice: Random ID
      const timer = setTimeout(() => {
        setIdNumber(Math.floor(1000 + Math.random() * 9000).toString());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialData]);

  // B. Fetch AI Credits
  useEffect(() => {
    const fetchDefaults = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      try {
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch('/api/ai-check', { cache: 'no-store', headers: headers });
        const data = await res.json();
        setAiCredits(typeof data.credits === 'number' ? data.credits : 0);
        if (data.reset_in) setResetTime(data.reset_in);
      } catch (e) {
        setAiCredits(0);
      }

      if (!initialData && session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setSender(prev => ({
            ...prev,
            name: profile.business_name || '',
            phone: profile.phone || '',
            address: profile.address || '',
            logoUrl: profile.logo_url || '',
            email: session.user.email || '' 
          }));
        }
      }
    };
    fetchDefaults();
  }, [initialData]);

  // ==============================
  // 3. CALCULATIONS
  // ==============================
  
  const calculateItemTotal = (item: InvoiceItem) => {
    const base = item.qty * item.price;
    const discountVal = item.discountType === 'PERCENTAGE' ? base * (item.discount / 100) : item.discount;
    return Math.max(0, base - discountVal);
  };

  const subtotal = items.reduce((acc, i) => acc + calculateItemTotal(i), 0);
  const totalFees = extraFees.reduce((acc, fee) => acc + (fee.type === 'PERCENTAGE' ? subtotal * (fee.value / 100) : fee.value), 0);
  const discountableBase = subtotal + totalFees;
  const globalDiscountAmount = globalDiscountType === 'PERCENTAGE' ? discountableBase * (globalDiscount / 100) : globalDiscount;
  const grandTotal = Math.max(0, discountableBase - globalDiscountAmount);

  // ==============================
  // 4. HANDLERS
  // ==============================

  const handleAI = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const headers: HeadersInit = token 
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } 
        : { 'Content-Type': 'application/json' };

      const res = await fetch('/api/ai-parse', { method: 'POST', headers, body: JSON.stringify({ prompt }) });
      
      if (res.status === 403) {
         alert("Daily AI limit reached.");
         setAiCredits(0);
         setLoading(false);
         return;
      }

      const data: AiApiResponse = await res.json();
      
      // Fixed: Safe check for undefined items
      if (data?.items && data.items.length > 0) {
        setItems(data.items.map((d: AiResponseItem) => ({
          id: Math.random(),
          desc: d.desc,
          qty: d.qty || 1,
          price: d.price || 0,
          discount: 0,
          discountType: 'FIXED' as AmountType
        })));
      }

      if (data.client) { setClient(prev => ({ ...prev, ...data.client })); setShowSettings(true); }
      if (data.sender) setSender(prev => ({ ...prev, ...data.sender }));
      if (data.docType) setSettings(prev => ({ ...prev, docType: data.docType! }));
      if (data.notes) setNotes(prev => prev ? `${prev}\n${data.notes}` : data.notes!);

      setPrompt("");
      setAiCredits(prev => prev !== null ? Math.max(0, prev - 1) : 0);
    } catch (e) {
      console.error(e);
      alert("AI Service busy. Please try again.");
    }
    setLoading(false);
  };

  const gatherData = (): InvoiceData => ({
    items, extraFees, settings, sender, client, invoiceNo: displayId, date, dueDate, notes, terms,
    subtotal, globalDiscount, globalDiscountType, grandTotal
  });

  // Simplified State Helpers
  const updateItem = (id: number, field: any, val: any) => setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  const toggleItemDiscount = (id: number) => setItems(items.map(i => i.id === id ? { ...i, discountType: i.discountType === 'FIXED' ? 'PERCENTAGE' : 'FIXED' } : i));
  const removeItem = (id: number) => setItems(items.length > 1 ? items.filter(i => i.id !== id) : [{ id: Date.now(), desc: '', qty: 1, price: 0, discount: 0, discountType: 'FIXED' }]);
  
  // ==============================
  // 5. RENDER
  // ==============================
  return (
    <div className="space-y-6">
      <AdBanner position="banner" />
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
        {/* TOP BAR */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
            {(['INVOICE', 'QUOTATION'] as const).map(type => (
              <button key={type} onClick={() => setSettings({...settings, docType: type})} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${settings.docType === type ? 'bg-[#005F99] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{type}</button>
            ))}
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition-all ${showSettings ? 'bg-blue-50 border-blue-200 text-[#005F99]' : 'bg-white border-slate-200 text-slate-600'}`}>
            <Settings size={16} /> {showSettings ? "Hide Details" : "Edit Business Details"}
            {showSettings ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>
        </div>

        {/* SETTINGS DRAWER */}
        {showSettings && (
          <div className="p-6 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-2">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#005F99] uppercase tracking-wider flex items-center gap-2"><User size={14} /> My Business (From)</h4>
                {sender.logoUrl && <img src={sender.logoUrl} alt="Logo" className="w-16 h-16 border rounded-lg object-contain bg-white" />}
                <input placeholder="Business Name" className="w-full p-2.5 border rounded-lg text-sm" value={sender.name} onChange={e => setSender({...sender, name: e.target.value})} />
                <textarea placeholder="Address" className="w-full p-2.5 border rounded-lg text-sm h-20 resize-none" value={sender.address} onChange={e => setSender({...sender, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-2">
                    <input placeholder="Phone" className="w-full p-2.5 border rounded-lg text-sm" value={sender.phone} onChange={e => setSender({...sender, phone: e.target.value})} />
                    <input placeholder="Email" className="w-full p-2.5 border rounded-lg text-sm" value={sender.email} onChange={e => setSender({...sender, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#00B3B3] uppercase tracking-wider flex items-center gap-2"><User size={14} /> Customer (To)</h4>
                <input placeholder="Customer Name" className="w-full p-2.5 border rounded-lg text-sm" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
                <textarea placeholder="Address" className="w-full p-2.5 border rounded-lg text-sm h-20 resize-none" value={client.address} onChange={e => setClient({...client, address: e.target.value})} />
                <input placeholder="Phone" className="w-full p-2.5 border rounded-lg text-sm" value={client.phone} onChange={e => setClient({...client, phone: e.target.value})} />
              </div>
            </div>
            
            {/* META */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
               <div>
                 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">ID</label>
                 <div className="flex gap-2"><input value={displayId} readOnly className="w-full p-2 border rounded text-sm bg-slate-100"/><button onClick={() => setIdNumber(Math.floor(1000 + Math.random() * 9000).toString())} className="p-2 border rounded hover:bg-slate-50"><RefreshCw size={16}/></button></div>
               </div>
               <div>
                 <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Currency</label>
                 <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="w-full p-2 border rounded text-sm bg-white">{currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}</select>
               </div>
               <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded text-sm"/></div>
               <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Due Date</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-2 border rounded text-sm"/></div>
            </div>
          </div>
        )}

        {/* AI INPUT */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-[#005F99] uppercase tracking-wider flex items-center gap-2"><Sparkles size={14} className="text-[#00B3B3]" /> Axiora AI Input</label>
            <div className="flex items-center gap-3">
               {resetTime && <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 hidden sm:inline-block">Resets in {resetTime}</span>}
               <div className={`flex items-center gap-2 px-2 py-1 rounded border ${aiCredits !== null && aiCredits > 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}><Clock size={12}/><span className="text-[10px] font-bold">{aiCredits === null ? '...' : `${aiCredits} Credits`}</span></div>
            </div>
          </div>
          <div className="flex gap-3">
            <input value={prompt} onChange={(e) => setPrompt(e.target.value)} disabled={aiCredits === 0 || loading} onKeyDown={(e) => e.key === 'Enter' && handleAI()} placeholder={aiCredits === 0 ? "Limit reached." : "e.g. Invoice for Kamal: 10 Cement bags at 2400 each"} className="flex-1 p-3.5 rounded-xl border border-slate-300 focus:border-[#00B3B3] outline-none font-medium text-slate-700" />
            <button 
              onClick={handleAI} 
              disabled={loading || aiCredits === 0} 
              className="bg-[#005F99] text-white px-6 rounded-xl font-bold flex items-center gap-2 hover:bg-[#004470] shadow-md"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> 
              ) : (
                <>
                  <Sparkles size={18} />
                  <span className="hidden md:inline">Generate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* GRID */}
        <div className="p-6 overflow-x-auto bg-white min-h-[300px]">
          <table className="w-full text-left text-sm min-w-[750px]">
            <thead className="bg-slate-50 text-slate-500 font-bold border-y border-slate-200 uppercase text-xs tracking-wider">
              <tr><th className="py-3 pl-2 w-[35%]">Description</th><th className="py-3 w-[10%] text-center">Qty</th><th className="py-3 w-[15%] text-right">Price</th><th className="py-3 w-[20%] text-right">Discount</th><th className="py-3 w-[15%] text-right pr-2">Total</th><th className="w-[5%]"></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                  <td className="py-2 pl-2"><input className="w-full bg-transparent outline-none font-medium text-slate-700" value={item.desc} onChange={(e) => updateItem(item.id, 'desc', e.target.value)} placeholder="Description" /></td>
                  <td className="py-2"><input type="number" className="w-full bg-transparent outline-none text-center text-slate-600 font-mono" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} /></td>
                  <td className="py-2"><input type="number" className="w-full bg-transparent outline-none text-right text-slate-600 font-mono" value={item.price} onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))} /></td>
                  <td className="py-2"><div className="flex justify-end items-center gap-1"><input type="number" className="w-20 bg-transparent outline-none text-right text-red-500 font-mono placeholder:text-slate-200" value={item.discount} onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))} /><button onClick={() => toggleItemDiscount(item.id)} className="text-[10px] font-bold text-slate-400 hover:text-[#005F99] border rounded px-1 h-6 w-6">{item.discountType === 'PERCENTAGE' ? '%' : settings.currency}</button></div></td>
                  <td className="py-2 text-right font-bold text-[#005F99] pr-2 font-mono">{calculateItemTotal(item).toLocaleString()}</td>
                  <td className="py-2 text-center"><button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setItems([...items, { id: Date.now(), desc: '', qty: 1, price: 0, discount: 0, discountType: 'FIXED' }])} className="mt-4 text-[#00B3B3] text-sm flex items-center gap-1 font-bold hover:text-[#009999] transition-colors py-2 px-3 rounded hover:bg-teal-50"><Plus size={16} /> Add Line Item</button>

          {/* TOTALS */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col lg:flex-row justify-between gap-8">
             <div className="w-full lg:w-1/2 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><FileText size={12}/> Notes</label><textarea className="w-full border rounded-lg p-3 text-xs h-24 resize-none" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
                  <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><FileText size={12}/> Terms</label><textarea className="w-full border rounded-lg p-3 text-xs h-24 resize-none" value={terms} onChange={(e) => setTerms(e.target.value)} /></div>
                </div>
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                   <p className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2"><CreditCard size={12}/> Taxes & Fees</p>
                   {extraFees.map(fee => (
                     <div key={fee.id} className="flex gap-2 mb-2 items-center"><input className="flex-1 bg-white border rounded px-2 py-1.5 text-sm" value={fee.label} onChange={e => setExtraFees(extraFees.map(f => f.id === fee.id ? {...f, label: e.target.value} : f))} /><input className="w-24 bg-white border rounded px-2 py-1.5 text-sm text-right" type="number" value={fee.value} onChange={e => setExtraFees(extraFees.map(f => f.id === fee.id ? {...f, value: Number(e.target.value)} : f))} /><button onClick={() => setExtraFees(extraFees.filter(f => f.id !== fee.id))} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16}/></button></div>
                   ))}
                   <button onClick={() => setExtraFees([...extraFees, { id: Math.random().toString(), label: '', value: 0, type: 'PERCENTAGE' }])} className="text-xs font-bold text-[#005F99] mt-2 flex items-center gap-1 hover:underline"><Plus size={12}/> Add Fee/Tax</button>
                </div>
             </div>
             <div className="w-full lg:w-5/12 space-y-3 bg-slate-50/50 p-6 rounded-2xl h-fit border border-slate-100">
                <div className="flex justify-between text-slate-500 text-sm"><span>Subtotal</span><span className="font-mono font-medium">{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                {extraFees.map(fee => (<div key={fee.id} className="flex justify-between text-slate-600 text-sm"><span>{fee.label}</span><span className="font-mono">{(fee.type === 'PERCENTAGE' ? subtotal * (fee.value / 100) : fee.value).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>))}
                <div className="flex justify-between text-red-500 text-sm items-center py-2 border-t border-dashed border-slate-200 mt-2">
                    <div className="flex flex-col"><span className="font-medium">Global Discount</span></div>
                    <div className="flex items-center gap-1 border-b border-red-200/50 hover:border-red-400 transition-colors"><span>-</span><input type="number" className="w-20 text-right outline-none text-red-600 font-mono bg-transparent font-bold" value={globalDiscount} onChange={(e) => setGlobalDiscount(Number(e.target.value))} placeholder="0" /><button onClick={() => setGlobalDiscountType(globalDiscountType === 'FIXED' ? 'PERCENTAGE' : 'FIXED')} className="text-[10px] border rounded px-1 h-5">{globalDiscountType === 'PERCENTAGE' ? '%' : settings.currency}</button></div>
                </div>
                <div className="flex justify-between font-black text-2xl text-[#005F99] border-t-2 border-dashed border-slate-200 pt-4 mt-2 items-baseline"><span className="text-base font-bold text-slate-400 uppercase tracking-widest">{settings.docType === 'QUOTATION' ? 'Est. Total' : 'Total'}</span><span>{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-xs text-slate-400 font-normal">{settings.currency}</span></span></div>
             </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
             <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div><span>Changes auto-saved locally</span></div>
             <div className="flex gap-3 w-full md:w-auto">
               <button onClick={() => onSaveClick(gatherData(), detectCategory(items))} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"><Save size={18} /> Save Record</button>
               <button onClick={() => onDownloadClick(gatherData(), detectCategory(items))} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#005F99] text-white font-bold rounded-xl hover:bg-[#004470] shadow-lg transition-all hover:-translate-y-1"><Download size={18} /> Download PDF</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}