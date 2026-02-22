"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle, Zap, Menu, X, ArrowRight, Play, Cpu, Server, Database, 
  Linkedin, Instagram, LogIn, UserPlus, Sparkles, MessageCircle, 
  TrendingUp, GraduationCap, Globe, ArrowUpRight, Code, FileText, Check
} from 'lucide-react';

// --- SEO, AEO & AIEO: STRUCTURED DATA (JSON-LD) ---
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.axioralabs.com/#organization",
      "name": "Axiora Labs",
      "url": "https://www.axioralabs.com",
      "logo": "https://www.axioralabs.com/axiora-logo.png",
      "sameAs": ["https://www.linkedin.com/company/axioralabs"],
      "description": "Sri Lankan software house dedicated to intelligent business logic and AI technology.",
    },
    {
      "@type": "SoftwareApplication",
      "name": "Axiora QuoteEngine",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "Trilingual AI-powered invoice and quotation generator for Sri Lanka.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "LKR" }
    }
  ]
};

// --- ICONS ---
const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

// --- COMPONENT: ENTERPRISE MODAL ---
const EnterpriseDetailsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white border border-slate-200 w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors p-2 bg-slate-50 rounded-full">
          <X size={20} />
        </button>

        <div className="relative z-10">
          <div className="w-12 h-12 bg-[#005F99]/10 rounded-2xl flex items-center justify-center mb-6">
            <Zap className="text-[#005F99]" size={24} />
          </div>

          <h3 className="text-2xl font-black text-slate-900 mb-2">Upgrade to Enterprise</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Unlock unlimited AI usage, custom branding, and priority support. Follow these steps to activate your workspace.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">1</div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm">Create a Free Account</h4>
                <p className="text-slate-500 text-xs mt-1">We need an active account to apply the upgrade to.</p>
                <Link href="/auth" onClick={onClose} className="inline-block mt-2 text-[#005F99] text-xs font-bold hover:underline">
                  Create Account →
                </Link>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 ml-4"></div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">2</div>
              <div>
                <h4 className="text-slate-900 font-bold text-sm">Contact Sales</h4>
                <p className="text-slate-500 text-xs mt-1">Message us to process your bank transfer securely.</p>
                <a 
                  href="https://wa.me/94718869555" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#20bd5a] transition-all w-fit shadow-md shadow-green-500/20"
                >
                  <MessageCircle size={18} /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: NAVBAR ---
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="font-black text-2xl tracking-tighter text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#005F99] rounded-lg flex items-center justify-center text-white">
                <FileText size={18} />
              </div>
              Axiora
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 bg-white/50 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-200/50 shadow-sm">
            <button onClick={() => scrollToSection('how-it-works')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">How it works</button>
            <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('ecosystem')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Company</button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth" className="text-slate-600 hover:text-slate-900 font-bold text-sm transition-colors">Log in</Link>
            <Link href="/generator" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-slate-800 transition-all text-sm flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5">
              Start Free <ArrowRight size={16} />
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-900 p-2">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 shadow-2xl flex flex-col space-y-4 md:hidden">
          <button onClick={() => scrollToSection('features')} className="text-lg font-bold text-slate-700 text-left w-full py-2">Features</button>
          <button onClick={() => scrollToSection('pricing')} className="text-lg font-bold text-slate-700 text-left w-full py-2">Pricing</button>
          <button onClick={() => scrollToSection('ecosystem')} className="text-lg font-bold text-slate-700 text-left w-full py-2">Company</button>
          <div className="h-px w-full bg-slate-100 my-2"></div>
          <Link href="/auth" className="text-lg font-bold text-slate-600 py-2">Log in</Link>
          <Link href="/generator" className="w-full text-center bg-slate-900 text-white py-4 rounded-xl font-bold text-lg mt-2">Start for Free</Link>
        </div>
      )}
    </header>
  );
};

// --- COMPONENT: SAAS DEMO UI ---
const InteractiveDemo = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto perspective-1000">
      {/* Decorative background glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#005F99]/20 to-[#00B3B3]/20 rounded-[3rem] blur-2xl -z-10"></div>
      
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col h-[420px]">
        {/* Mock macOS Header */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"></div><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div><div className="w-2.5 h-2.5 rounded-full bg-green-400"></div></div>
          <div className="flex-1 text-center"><span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">New Invoice</span></div>
        </div>

        <div className="p-6 flex flex-col h-full relative bg-slate-50/50">
          
          {/* Step 1: Input */}
          <div className={`transition-all duration-500 ease-out absolute left-6 right-6 top-6 ${step > 0 ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Just type what you sold:</p>
            <div className="bg-white border border-[#005F99]/20 rounded-xl p-4 shadow-sm ring-4 ring-[#005F99]/5">
              <p className="text-slate-800 text-sm font-medium leading-relaxed">
                "Sold 50 bags of Tokyo Cement at 2450 each to Kamal. Add a 5% discount."
              </p>
              <div className="mt-4 flex justify-end">
                <div className="bg-[#005F99] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1">
                  <Zap size={12} /> Generating...
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Processing */}
          <div className={`transition-all duration-500 absolute inset-0 flex flex-col items-center justify-center ${step === 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
             <Cpu size={48} className="text-[#005F99] animate-bounce mb-4" />
             <p className="text-slate-900 font-bold">AI is formatting...</p>
             <p className="text-slate-500 text-sm mt-1">Understanding Sinhala & English context</p>
          </div>

          {/* Step 3: Result */}
          <div className={`transition-all duration-500 absolute left-6 right-6 top-6 bottom-6 bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">INVOICE</h3>
                <p className="text-slate-400 text-xs">To: Kamal</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#005F99]">Rs. 116,375.00</p>
                <p className="text-slate-400 text-xs">Total Due</p>
              </div>
            </div>
            
            <table className="w-full text-xs">
              <thead className="text-slate-400 border-b border-slate-100">
                <tr><th className="text-left pb-2 font-medium">Item</th><th className="text-right pb-2 font-medium">Qty</th><th className="text-right pb-2 font-medium">Total</th></tr>
              </thead>
              <tbody className="text-slate-700">
                <tr><td className="py-3 font-medium">Tokyo Cement</td><td className="text-right py-3">50</td><td className="text-right py-3">122,500</td></tr>
                <tr><td className="py-2 text-red-500">Discount (5%)</td><td className="text-right py-2"></td><td className="text-right py-2 text-red-500">-6,125</td></tr>
              </tbody>
            </table>

            <div className="mt-auto pt-4 flex gap-2">
              <div className="flex-1 bg-green-500 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1">
                WhatsApp PDF
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  return (
    <main className="bg-white min-h-screen selection:bg-[#005F99] selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar />
      <EnterpriseDetailsModal isOpen={isEnterpriseModalOpen} onClose={() => setIsEnterpriseModalOpen(false)} />

      {/* --- DRUNK GRANDMA HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Clean minimal background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,95,153,0.08),transparent)] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0 z-10">
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
              Type a sentence. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005F99] to-[#00B3B3]">Get a perfect invoice.</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              Stop wasting time on excel templates. Type what you sold in <b>English, Sinhala, or Tamil.</b> Our AI instantly creates a professional, WhatsApp-ready PDF invoice.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/generator" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1">
                Start Generating for Free
              </Link>
              <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 rounded-full font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all">
                See how it works
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> No credit card required</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Free forever plan</div>
            </div>
          </div>

          <div className="relative z-10 w-full">
            <InteractiveDemo />
          </div>

        </div>
      </section>

      {/* --- SOCIAL PROOF --- */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by 100+ Sri Lankan Businesses</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
            {/* Abstract shop representations for aesthetic */}
            {['Hardware Stores', 'Tech Shops', 'Freelancers', 'Agencies', 'Wholesalers'].map((n) => (
              <span key={n} className="text-lg font-black text-slate-800">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (DRUNK GRANDMA FRIENDLY) --- */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Invoicing shouldn't be hard.</h2>
            <p className="text-lg text-slate-500">We built Axiora for busy shop owners. No complex forms. Just type.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center relative mt-8 md:mt-0">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-900 absolute -top-8 left-1/2 -translate-x-1/2 shadow-sm">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 mt-6">Type Your Sale</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Open the app and type naturally. "10 laptops at 150k each". Works in Sinhala, Tamil, and English.</p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center relative mt-8 md:mt-0">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-black text-slate-900 absolute -top-8 left-1/2 -translate-x-1/2 shadow-sm">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 mt-6">AI Does The Work</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Our AI engine instantly calculates totals, extracts items, and formats everything into a beautiful table.</p>
            </div>
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 text-center relative mt-8 md:mt-0">
              <div className="w-16 h-16 bg-[#005F99] border border-[#004470] rounded-2xl flex items-center justify-center text-2xl font-black text-white absolute -top-8 left-1/2 -translate-x-1/2 shadow-lg shadow-blue-900/20">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 mt-6">Send via WhatsApp</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Download a lightweight, mobile-optimized PDF instantly. Send it to your customer before they leave the shop.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-slate-900 text-white selection:bg-[#00B3B3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Everything you need.<br/>Nothing you don't.</h2>
              <p className="text-slate-400 text-lg">Powerful features wrapped in an incredibly simple interface.</p>
            </div>
            <Link href="/generator" className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-slate-100 transition-colors">
              Try it now
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 hover:bg-slate-800 transition-colors">
              <Database className="text-[#00B3B3] mb-6" size={32} />
              <h3 className="text-xl font-bold mb-2">Smart History</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Never lose a customer record. Auto-save every invoice and client detail to your secure cloud database.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 hover:bg-slate-800 transition-colors">
              <Zap className="text-[#00B3B3] mb-6" size={32} />
              <h3 className="text-xl font-bold mb-2">Auto-fill Branding</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Upload your logo once. We'll automatically apply your brand colors and details to every invoice generated.</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 hover:bg-slate-800 transition-colors md:col-span-2 lg:col-span-1">
              <Globe className="text-[#00B3B3] mb-6" size={32} />
              <h3 className="text-xl font-bold mb-2">Trilingual Engine</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Our AI understands "Cement", "සිමෙන්ති", and "சிமெண்ட்" seamlessly in the exact same sentence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SAAS PRICING --- */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Simple, transparent pricing.</h2>
            
            <div className="inline-flex items-center p-1 bg-slate-200/60 rounded-xl">
               <button onClick={() => setBillingCycle('monthly')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Monthly</button>
               <button onClick={() => setBillingCycle('yearly')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Yearly <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full ml-1">-10%</span></button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Guest */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="font-bold text-slate-500 text-lg mb-4">Guest</h3>
              <div className="mb-6"><span className="text-4xl font-black text-slate-900">Free</span></div>
              <p className="text-sm text-slate-500 mb-8 h-10">For quick, urgent invoices without saving data.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-sm text-slate-700"><Check size={18} className="text-slate-400"/> 2 AI Quotes / Day</li>
                <li className="flex gap-3 text-sm text-slate-700"><Check size={18} className="text-slate-400"/> Standard PDF</li>
                <li className="flex gap-3 text-sm text-slate-400"><X size={18} className="text-slate-300"/> No cloud history</li>
              </ul>
              <Link href="/generator" className="block w-full py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 hover:bg-slate-50 transition-colors">Generate as Guest</Link>
            </div>

            {/* Verified (Main CTA) */}
            <div className="bg-slate-900 border-2 border-slate-900 rounded-3xl p-8 shadow-2xl relative md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00B3B3] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Most Popular</div>
              <h3 className="font-bold text-slate-300 text-lg mb-4">Verified Account</h3>
              <div className="mb-6"><span className="text-4xl font-black text-white">Free</span></div>
              <p className="text-sm text-slate-400 mb-8 h-10">Create an account to save your branding and history.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-[#00B3B3]"/> 10 AI Quotes / Day</li>
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-[#00B3B3]"/> Auto-fill Logo & Data</li>
                <li className="flex gap-3 text-sm text-white"><Check size={18} className="text-[#00B3B3]"/> Secure Cloud History</li>
              </ul>
              <Link href="/auth" className="block w-full py-3 bg-[#00B3B3] text-slate-900 rounded-xl text-center font-bold hover:bg-[#009999] transition-colors shadow-lg">Sign Up Free</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="font-bold text-[#005F99] text-lg mb-4">Enterprise</h3>
              <div className="mb-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900">{billingCycle === 'monthly' ? "1,900" : "1,710"}</span>
                <span className="text-sm font-bold text-slate-500">LKR/mo</span>
              </div>
              <p className="text-sm text-slate-500 mb-8 h-10">{billingCycle === 'monthly' ? 'Billed monthly' : 'Billed 20,520 LKR yearly'}</p>
              <ul className="space-y-4 mb-8">
                <li className="flex gap-3 text-sm text-slate-700"><Check size={18} className="text-[#005F99]"/> Unlimited AI Usage</li>
                <li className="flex gap-3 text-sm text-slate-700"><Check size={18} className="text-[#005F99]"/> Analytics Dashboard</li>
                <li className="flex gap-3 text-sm text-slate-700"><Check size={18} className="text-[#005F99]"/> Multi-Business Profiles</li>
              </ul>
              <button onClick={() => setIsEnterpriseModalOpen(true)} className="block w-full py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 hover:bg-slate-50 transition-colors">Contact Sales</button>
            </div>

          </div>
        </div>
      </section>

      {/* --- BENTO GRID ECOSYSTEM (Premium SaaS Bento) --- */}
      <section id="ecosystem" className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Subtle background grid to make the section pop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
              <Sparkles size={12} className="text-[#005F99]" /> Beyond Software
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">The Axiora Ecosystem</h2>
            <p className="text-lg text-slate-500 max-w-2xl">Software is just the engine. We build the complete vehicle for your business growth.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            
            {/* 1. Axiora Labs (Software) - Large Span */}
            <a 
              href="https://www.axioralabs.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative block bg-white border border-slate-200 rounded-[2rem] p-8 md:col-span-2 overflow-hidden hover:border-[#005F99]/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,95,153,0.15)] hover:-translate-y-1"
            >
              {/* Abstract Background Graphic */}
              <div className="absolute right-0 bottom-0 w-2/3 h-full bg-gradient-to-tl from-blue-50/50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#005F99]/5 rounded-full blur-3xl group-hover:bg-[#005F99]/10 transition-colors duration-500"></div>
              
              {/* Floating Code UI Mockup */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 w-48 h-32 bg-slate-900/5 backdrop-blur-sm border border-slate-900/10 rounded-xl p-4 opacity-0 translate-x-8 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-100 hidden md:block">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-3/4 bg-slate-300/50 rounded-full"></div>
                  <div className="h-1.5 w-1/2 bg-[#005F99]/40 rounded-full"></div>
                  <div className="h-1.5 w-5/6 bg-slate-300/50 rounded-full"></div>
                </div>
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-auto pb-12">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-[#005F99] group-hover:bg-[#005F99] group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Code size={24} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#005F99] group-hover:text-white transition-all duration-300 transform group-hover:rotate-45">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Axiora Labs</h3>
                  <p className="text-slate-500 text-lg max-w-md leading-relaxed group-hover:text-slate-600 transition-colors">
                    Custom SaaS & Bespoke Software. We engineer high-performance platforms for modern Sri Lankan enterprises.
                  </p>
                </div>
              </div>
            </a>

            {/* 2. Axiora Academy (Education) - Tall/Square */}
            <a 
              href="https://www.axiora.academy" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative block bg-white border border-slate-200 rounded-[2rem] p-8 overflow-hidden hover:border-yellow-500/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.15)] hover:-translate-y-1"
            >
              {/* Abstract Background Graphic */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl group-hover:bg-yellow-400/20 transition-colors duration-500"></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-auto pb-12">
                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                    <GraduationCap size={24} />
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300 transform group-hover:rotate-45">
                    <ArrowUpRight size={20} />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Academy</h3>
                  <p className="text-slate-500 leading-relaxed group-hover:text-slate-600 transition-colors">
                    Bridging the gap between theory and industry with practical tech & business education.
                  </p>
                </div>
              </div>
            </a>

            {/* 3. Axiora Digital (Highlight) - Full Width Dark Mode */}
            <a 
              href="https://www.axioradigital.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative block bg-[#000d14] border border-slate-800 rounded-[2rem] p-8 md:p-10 md:col-span-3 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-15px_rgba(0,179,179,0.3)] hover:-translate-y-1"
            >
              {/* Dynamic Dark Mode Background Effects */}
              <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-[#00B3B3]/10 rounded-full blur-[100px] group-hover:bg-[#00B3B3]/20 transition-colors duration-700 pointer-events-none"></div>
              
              {/* Abstract Growth Chart Line (SVG) */}
              <div className="absolute bottom-0 right-0 w-2/3 h-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none translate-y-4 group-hover:translate-y-0">
                <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full text-[#00B3B3]">
                  <path d="M0,50 L20,30 L40,40 L70,10 L100,20 L100,50 Z" fill="currentColor" fillOpacity="0.1" />
                  <path d="M0,50 L20,30 L40,40 L70,10 L100,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#00B3B3]/10 border border-[#00B3B3]/20 rounded-full text-[#00B3B3] text-xs font-bold uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B3B3] animate-pulse"></span> Performance Marketing
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Axiora Digital</h3>
                  <p className="text-slate-400 text-lg leading-relaxed md:max-w-2xl group-hover:text-slate-300 transition-colors">
                    We treat marketing as a software problem. No vanity metrics. Just data, speed, and AI-driven automation designed to scale your sales exponentially.
                  </p>
                </div>

                <div className="flex-shrink-0 flex items-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-full font-bold group-hover:bg-[#00B3B3] group-hover:text-white transition-all duration-300 shadow-lg mt-4 md:mt-0">
                  Visit Agency <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </a>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              
              <div className="col-span-1 md:col-span-1">
                <div className="font-black text-2xl tracking-tighter text-slate-900 flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-[#005F99] rounded-lg flex items-center justify-center text-white">
                    <FileText size={18} />
                  </div>
                  Axiora Labs
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Simplifying business logic through intelligent design and cutting-edge technology for Sri Lanka.
                </p>
                <div className="mt-6 flex gap-4 text-slate-400">
                  <a href="https://www.linkedin.com/company/axiora-labs" className="hover:text-slate-900 transition-colors"><Linkedin size={20} /></a>
                  <a href="https://www.instagram.com/axioralabs/" className="hover:text-slate-900 transition-colors"><Instagram size={20} /></a>
                  <a href="https://www.tiktok.com/@axiora.labs" className="hover:text-slate-900 transition-colors"><TikTokIcon size={20} /></a>
                </div>
              </div>

              <div>
                 <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                 <ul className="space-y-4 text-sm text-slate-500">
                    <li><Link href="/generator" className="hover:text-slate-900 transition-colors">Start Generating</Link></li>
                    <li><button onClick={() => document.getElementById('features')?.scrollIntoView()} className="hover:text-slate-900 transition-colors">Features</button></li>
                    <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView()} className="hover:text-slate-900 transition-colors">Pricing</button></li>
                 </ul>
              </div>

              <div>
                 <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                 <ul className="space-y-4 text-sm text-slate-500">
                    <li><a href="https://www.axioralabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">About Us</a></li>
                    <li><a href="https://www.digital.axioralabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">Axiora Digital</a></li>
                    <li><Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                 </ul>
              </div>

              <div>
                 <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
                 <ul className="space-y-4 text-sm text-slate-500">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> hello@axioralabs.com</li>
                    <li>+94 77 401 6146</li>
                    <li>Colombo, Sri Lanka</li>
                 </ul>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
              <p>© {new Date().getFullYear()} Axiora Labs. Built in Sri Lanka.</p>
           </div>
        </div>
      </footer>
    </main>
  );
}