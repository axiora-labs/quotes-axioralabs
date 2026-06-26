"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Download, User, Settings, 
  RefreshCw, ChevronDown, ChevronUp, 
  FileText, CreditCard, Save, Palette,
  Bold, Italic, Underline, List, AlignLeft, AlignCenter
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { dictionary, Language } from '@/lib/dictionaries';
import { 
  InvoiceItem, InvoiceData, InvoiceSettings, BusinessDetails, ClientDetails, 
  ExtraFee, AmountType 
} from '@/types';
import { currencies } from '@/lib/currencies';

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

// --- RICH TEXT EDITOR COMPONENT (FIXED LISTS & FOCUS) ---
const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const exec = (cmd: string, val?: string) => {
    // Focus the editor FIRST so the cursor/selection is active inside it
    if (ref.current) {
      ref.current.focus();
    }
    document.execCommand(cmd, false, val);
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${isFocused ? 'border-slate-400 ring-4 ring-slate-100' : 'border-slate-200'}`}>
      <div className="flex items-center gap-1 p-2.5 border-b bg-slate-50/80 flex-wrap">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('bold'); }} className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors" title="Bold"><Bold size={16} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('italic'); }} className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors" title="Italic"><Italic size={16} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('underline'); }} className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors" title="Underline"><Underline size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyLeft'); }} className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors" title="Align Left"><AlignLeft size={16} /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('justifyCenter'); }} className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors" title="Align Center"><AlignCenter size={16} /></button>
        <div className="w-px h-5 bg-slate-300 mx-1"></div>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className="p-2 hover:bg-slate-200 rounded-md text-slate-600 transition-colors" title="Bullet List"><List size={16} /></button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        // Added Tailwind arbitrary variants to force list styles to render
        className="p-4 min-h-[160px] text-base outline-none text-slate-800 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1"
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (ref.current) onChange(ref.current.innerHTML);
        }}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
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

  // Design & Export State
  const [design, setDesign] = useState({
    fontFamily: 'Inter, sans-serif',
    fontSize: '14px',
    headingStyle: 'uppercase',
    layoutDensity: 'standard',
    pdfQuality: 'medium'
  });

  const [sender, setSender] = useState<BusinessDetails>({ name: '', address: '', phone: '', email: '', logoUrl: '' });
  const [client, setClient] = useState<ClientDetails>({ name: '', address: '', phone: '' });
  
  // Metadata
  const [idNumber, setIdNumber] = useState('0000'); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");

  // UI State
  const [showSettings, setShowSettings] = useState(false);
  const [showDesign, setShowDesign] = useState(false);

  // FIXED: Removed 'RECEIPT' to match your InvoiceSettings type definition
  const displayId = `${settings.docType === 'INVOICE' ? 'INV' : 'QTN'}-${idNumber}`;

  // --- EFFECTS ---
  useEffect(() => {
    if (initialData) {
      const timer = setTimeout(() => {
        setItems(initialData.items || []);
        setExtraFees(initialData.extraFees || []);
        setSettings(initialData.settings);
        setSender(initialData.sender);
        setClient(initialData.client);
        
        if ((initialData.settings as any).fontFamily) {
          setDesign({
            fontFamily: (initialData.settings as any).fontFamily || 'Inter, sans-serif',
            fontSize: (initialData.settings as any).fontSize || '14px',
            headingStyle: (initialData.settings as any).headingStyle || 'uppercase',
            layoutDensity: (initialData.settings as any).layoutDensity || 'standard',
            pdfQuality: (initialData.settings as any).pdfQuality || 'medium'
          });
        }

        const idParts = initialData.invoiceNo ? initialData.invoiceNo.split('-') : [];
        if (idParts.length > 1) setIdNumber(idParts[1]);

        setDate(initialData.date);
        setDueDate(initialData.dueDate);
        setNotes(initialData.notes || "");
        setTerms(initialData.terms || "");
        setGlobalDiscount(initialData.globalDiscount);
        setGlobalDiscountType(initialData.globalDiscountType);
        
        setShowSettings(true); 
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIdNumber(Math.floor(1000 + Math.random() * 9000).toString());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchDefaults = async () => {
      const { data: { session } } = await supabase.auth.getSession();
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
  // CALCULATIONS
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
  // HANDLERS
  // ==============================

  const gatherData = (): InvoiceData => ({
    items, extraFees, 
    settings: { ...settings, ...design } as any, // Merges pdfQuality into settings
    sender, client, invoiceNo: displayId, date, dueDate, notes, terms,
    subtotal, globalDiscount, globalDiscountType, grandTotal
  });

  const updateItem = (id: number, field: any, val: any) => setItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  const toggleItemDiscount = (id: number) => setItems(items.map(i => i.id === id ? { ...i, discountType: i.discountType === 'FIXED' ? 'PERCENTAGE' : 'FIXED' } : i));
  const removeItem = (id: number) => setItems(items.length > 1 ? items.filter(i => i.id !== id) : [{ id: Date.now(), desc: '', qty: 1, price: 0, discount: 0, discountType: 'FIXED' }]);
  
  // ==============================
  // RENDER
  // ==============================
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
        
        {/* TOP BAR */}
        <div className="bg-white border-b border-slate-200 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* FIXED: Removed 'RECEIPT' to prevent TypeScript error */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            {(['INVOICE', 'QUOTATION'] as const).map(type => (
              <button key={type} onClick={() => setSettings({...settings, docType: type})} className={`px-5 py-2.5 text-sm font-medium rounded-md transition-all ${settings.docType === type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{type}</button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { setShowSettings(!showSettings); setShowDesign(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-all ${showSettings ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <Settings size={16} /> Details {showSettings ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
            <button onClick={() => { setShowDesign(!showDesign); setShowSettings(false); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-all ${showDesign ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
              <Palette size={16} /> Design {showDesign ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
          </div>
        </div>

        {/* SETTINGS DRAWER */}
        {showSettings && (
          <div className="p-8 bg-slate-50/50 border-b border-slate-200 animate-in slide-in-from-top-2">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2"><User size={14} /> My Business (From)</h4>
                {sender.logoUrl && <img src={sender.logoUrl} alt="Logo" className="w-20 h-20 border border-slate-200 rounded-xl object-contain bg-white shadow-sm" />}
                <input placeholder="Business Name" className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors" value={sender.name} onChange={e => setSender({...sender, name: e.target.value})} />
                <textarea placeholder="Address" className="w-full p-3.5 border border-slate-200 rounded-lg text-sm h-24 resize-none bg-white outline-none focus:border-slate-400 transition-colors" value={sender.address} onChange={e => setSender({...sender, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Phone" className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors" value={sender.phone} onChange={e => setSender({...sender, phone: e.target.value})} />
                    <input placeholder="Email" className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors" value={sender.email} onChange={e => setSender({...sender, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-2"><User size={14} /> Customer (To)</h4>
                <input placeholder="Customer Name" className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors" value={client.name} onChange={e => setClient({...client, name: e.target.value})} />
                <textarea placeholder="Address" className="w-full p-3.5 border border-slate-200 rounded-lg text-sm h-24 resize-none bg-white outline-none focus:border-slate-400 transition-colors" value={client.address} onChange={e => setClient({...client, address: e.target.value})} />
                <input placeholder="Phone" className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors" value={client.phone} onChange={e => setClient({...client, phone: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10 pt-8 border-t border-slate-200">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">ID</label>
                 <div className="flex gap-2">
                   <input value={displayId} readOnly className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono"/>
                   <button onClick={() => setIdNumber(Math.floor(1000 + Math.random() * 9000).toString())} className="p-3.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"><RefreshCw size={16}/></button>
                 </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Currency</label>
                 <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors">{currencies.map(c => <option key={c.code} value={c.code}>{c.name} ({c.code})</option>)}</select>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Date</label>
                 <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors"/>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Due Date</label>
                 <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors"/>
               </div>
            </div>
          </div>
        )}

        {/* DESIGN DRAWER */}
        {showDesign && (
          <div className="p-8 bg-slate-50/50 border-b border-slate-200 animate-in slide-in-from-top-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Palette size={14} /> Document Typography & Export
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Font Family</label>
                <select value={design.fontFamily} onChange={e => setDesign({...design, fontFamily: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors">
                  <option value="Inter, sans-serif">Modern (Inter)</option>
                  <option value="Arial, sans-serif">Classic (Arial)</option>
                  <option value="Times New Roman, serif">Traditional (Times)</option>
                  <option value="Georgia, serif">Elegant (Georgia)</option>
                  <option value="Courier New, monospace">Monospace</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Base Size</label>
                <select value={design.fontSize} onChange={e => setDesign({...design, fontSize: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors">
                  <option value="12px">Small (12px)</option>
                  <option value="14px">Medium (14px)</option>
                  <option value="16px">Large (16px)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Headings</label>
                <select value={design.headingStyle} onChange={e => setDesign({...design, headingStyle: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors">
                  <option value="uppercase">Uppercase & Bold</option>
                  <option value="normal">Normal Case</option>
                  <option value="bold">Bold Only</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Density</label>
                <select value={design.layoutDensity} onChange={e => setDesign({...design, layoutDensity: e.target.value})} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors">
                  <option value="compact">Compact</option>
                  <option value="standard">Standard</option>
                  <option value="spacious">Spacious</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-200">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Accent Color</label>
                <div className="flex items-center gap-4">
                  <input type="color" value={settings.color} onChange={e => setSettings({...settings, color: e.target.value})} className="w-12 h-12 rounded-lg border border-slate-200 cursor-pointer p-1" />
                  <span className="text-sm text-slate-600 font-mono">{settings.color}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">PDF Export Quality</label>
                <select value={design.pdfQuality} onChange={e => setDesign({...design, pdfQuality: e.target.value as any})} className="w-full p-3.5 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-slate-400 transition-colors">
                  <option value="high">High (Print Ready / 300 DPI)</option>
                  <option value="medium">Medium (Standard / 150 DPI)</option>
                  <option value="low">Low (Web & Email / 72 DPI)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* GRID & ITEMS */}
        <div className="p-8 overflow-x-auto bg-white min-h-[400px]">
          <table className="w-full text-left min-w-[800px]">
            <thead>
              <tr className="border-b-2 border-slate-200 bg-slate-50/50">
                <th className="py-4 pl-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[40%]">Description</th>
                <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[10%] text-center">Qty</th>
                <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%] text-right">Price</th>
                <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%] text-right">Discount</th>
                <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%] text-right pr-4">Total</th>
                <th className="w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-5 pl-4">
                    <input 
                      className="w-full bg-transparent outline-none text-base text-slate-800 placeholder:text-slate-300 font-medium" 
                      value={item.desc} 
                      onChange={(e) => updateItem(item.id, 'desc', e.target.value)} 
                      placeholder="Item description" 
                    />
                  </td>
                  <td className="py-5">
                    <input type="number" className="w-full bg-transparent outline-none text-center text-base text-slate-600 font-mono" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))} />
                  </td>
                  <td className="py-5">
                    <input type="number" className="w-full bg-transparent outline-none text-right text-base text-slate-600 font-mono" value={item.price} onChange={(e) => updateItem(item.id, 'price', Number(e.target.value))} />
                  </td>
                  <td className="py-5">
                    <div className="flex justify-end items-center gap-2">
                      <input type="number" className="w-24 bg-transparent outline-none text-right text-base text-red-600 font-mono placeholder:text-slate-200" value={item.discount} onChange={(e) => updateItem(item.id, 'discount', Number(e.target.value))} />
                      <button onClick={() => toggleItemDiscount(item.id)} className="text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 rounded-md px-2 h-8 transition-colors">{item.discountType === 'PERCENTAGE' ? '%' : settings.currency}</button>
                    </div>
                  </td>
                  <td className="py-5 text-right font-bold text-slate-900 pr-4 font-mono text-base">{calculateItemTotal(item).toLocaleString()}</td>
                  <td className="py-5 text-center pr-2">
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-md hover:bg-red-50"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setItems([...items, { id: Date.now(), desc: '', qty: 1, price: 0, discount: 0, discountType: 'FIXED' }])} className="mt-6 text-sm font-semibold text-slate-700 flex items-center gap-2 hover:text-slate-900 transition-colors py-3 px-5 rounded-lg hover:bg-slate-100 border border-dashed border-slate-300 w-fit">
            <Plus size={16} /> Add Line Item
          </button>

          {/* TOTALS & NOTES */}
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col lg:flex-row justify-between gap-10 px-2 pb-8">
             <div className="w-full lg:w-1/2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={14}/> Notes</label>
                    <RichTextEditor value={notes} onChange={setNotes} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={14}/> Terms & Conditions</label>
                    <RichTextEditor value={terms} onChange={setTerms} />
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                   <p className="text-xs font-bold text-slate-500 mb-5 uppercase tracking-wider flex items-center gap-2"><CreditCard size={14}/> Taxes & Extra Fees</p>
                   {extraFees.map(fee => (
                     <div key={fee.id} className="flex gap-3 mb-3 items-center">
                       <input className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-slate-400 transition-colors" value={fee.label} onChange={e => setExtraFees(extraFees.map(f => f.id === fee.id ? {...f, label: e.target.value} : f))} placeholder="Fee name" />
                       <input className="w-28 bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm text-right outline-none focus:border-slate-400 transition-colors" type="number" value={fee.value} onChange={e => setExtraFees(extraFees.map(f => f.id === fee.id ? {...f, value: Number(e.target.value)} : f))} />
                       <button onClick={() => setExtraFees(extraFees.filter(f => f.id !== fee.id))} className="text-slate-300 hover:text-red-600 p-2.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18}/></button>
                     </div>
                   ))}
                   <button onClick={() => setExtraFees([...extraFees, { id: Math.random().toString(), label: '', value: 0, type: 'PERCENTAGE' }])} className="text-sm font-semibold text-slate-700 mt-3 flex items-center gap-2 hover:text-slate-900 transition-colors">
                     <Plus size={14}/> Add Fee/Tax
                   </button>
                </div>
             </div>
             
             <div className="w-full lg:w-5/12 space-y-4 bg-slate-50 p-8 rounded-xl border border-slate-200 h-fit">
                <div className="flex justify-between text-slate-600 text-base"><span>Subtotal</span><span className="font-mono font-medium">{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                {extraFees.map(fee => (<div key={fee.id} className="flex justify-between text-slate-600 text-base"><span>{fee.label || 'Fee'}</span><span className="font-mono">{(fee.type === 'PERCENTAGE' ? subtotal * (fee.value / 100) : fee.value).toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>))}
                <div className="flex justify-between text-red-600 text-base items-center py-4 border-t border-dashed border-slate-200 mt-4">
                    <span className="font-medium">Discount</span>
                    <div className="flex items-center gap-2 border-b border-red-200/50 hover:border-red-400 transition-colors">
                      <span>-</span>
                      <input type="number" className="w-24 text-right outline-none text-red-600 font-mono bg-transparent font-bold text-base" value={globalDiscount} onChange={(e) => setGlobalDiscount(Number(e.target.value))} placeholder="0" />
                      <button onClick={() => setGlobalDiscountType(globalDiscountType === 'FIXED' ? 'PERCENTAGE' : 'FIXED')} className="text-xs font-bold border border-slate-200 rounded-md px-2 h-7 transition-colors hover:border-slate-400">{globalDiscountType === 'PERCENTAGE' ? '%' : settings.currency}</button>
                    </div>
                </div>
                <div className="flex justify-between font-bold text-3xl text-slate-900 border-t-2 border-slate-200 pt-6 mt-4 items-baseline">
                   <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">{settings.docType === 'QUOTATION' ? 'Est. Total' : 'Total'}</span>
                   <span className="font-mono">{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2})} <span className="text-sm text-slate-400 font-normal">{settings.currency}</span></span>
                </div>
             </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50/80">
             <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span>Changes auto-saved locally</span>
             </div>
             <div className="flex gap-3 w-full md:w-auto">
               <button onClick={() => onSaveClick(gatherData(), detectCategory(items))} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                 <Save size={18} /> Save Record
               </button>
               <button onClick={() => onDownloadClick(gatherData(), detectCategory(items))} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-md">
                 <Download size={18} /> Download PDF
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}