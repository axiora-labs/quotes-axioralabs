"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle, Zap, Menu, X, ArrowRight, Play, Cpu, Server, Database, 
  Linkedin, Instagram, LogIn, UserPlus, ExternalLink, MessageCircle, 
  TrendingUp, GraduationCap, Globe, ArrowUpRight, Code
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
      "department": [
        { "@type": "Organization", "name": "Axiora Digital", "url": "https://www.axioradigital.com" },
        { "@type": "Organization", "name": "Axiora Academy", "url": "https://www.axiora.academy" }
      ]
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      <div className="relative bg-[#001829] border border-[#00B3B3]/30 w-full max-w-lg rounded-2xl p-8 shadow-[0_0_50px_rgba(0,179,179,0.15)] animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B3B3]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

        <button onClick={onClose} aria-label="Close Modal" className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2">
          <X size={24} />
        </button>

        <div className="relative z-10">
          <div className="w-12 h-12 bg-[#005F99]/20 rounded-xl flex items-center justify-center mb-6 border border-[#005F99]/50">
            <Zap className="text-[#00B3B3]" size={24} />
          </div>

          <h3 id="modal-title" className="text-2xl font-bold text-white mb-2">Upgrade to Enterprise</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            To unlock unlimited AI usage, custom branding, and dedicated support, please follow the steps below.
          </p>

          <div className="space-y-6">
            <div className="flex gap-4 animate-in slide-in-from-left-4 fade-in duration-500 delay-100">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">1</div>
              <div>
                <h4 className="text-white font-bold text-sm">Create a Standard Account</h4>
                <p className="text-slate-400 text-xs mt-1">You must have an active free account before we can upgrade you.</p>
                <Link href="/auth" onClick={onClose} className="inline-block mt-2 text-[#00B3B3] text-xs font-bold hover:underline focus:outline-none focus:ring-2 focus:ring-[#00B3B3] rounded">
                  Create Account →
                </Link>
              </div>
            </div>

            <div className="h-px bg-white/10 ml-4"></div>

            <div className="flex gap-4 animate-in slide-in-from-left-4 fade-in duration-500 delay-200">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm">2</div>
              <div>
                <h4 className="text-white font-bold text-sm">Contact Sales via WhatsApp</h4>
                <p className="text-slate-400 text-xs mt-1">Send us a message to process your Bank Transfer payment.</p>
                
                <a 
                  href="https://wa.me/94718869555" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Contact Sales on WhatsApp"
                  className="mt-3 flex items-center gap-2 bg-[#25D366] text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#20bd5a] transition-colors w-fit shadow-lg shadow-green-900/20"
                >
                  <MessageCircle size={16} /> +94 71 886 9555
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
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="relative w-36 h-10">
               <Image 
                 src="/axiora-logo.png" 
                 alt="Axiora Labs Logo" 
                 fill 
                 className="object-contain object-left"
                 priority
               />
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
            <div className="flex gap-6">
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-[#005F99] font-semibold text-sm transition-colors">Features</button>
              <button onClick={() => scrollToSection('ecosystem')} className="text-slate-600 hover:text-[#005F99] font-semibold text-sm transition-colors">Ecosystem</button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-600 hover:text-[#005F99] font-semibold text-sm transition-colors">Pricing</button>
            </div>

            <div className="h-5 w-px bg-slate-200" aria-hidden="true"></div>

            <div className="flex items-center gap-4">
              <Link href="/auth" className="text-slate-700 hover:text-[#005F99] font-bold text-sm transition-colors">Login</Link>
              <Link href="/auth" className="text-slate-700 hover:text-[#005F99] font-bold text-sm transition-colors">Sign Up</Link>
              <Link href="/generator" className="bg-[#005F99] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#004470] transition-all shadow-lg shadow-blue-200 text-sm flex items-center gap-2 transform hover:-translate-y-0.5">
                Launch App <ArrowRight size={16} />
              </Link>
            </div>
          </nav>

          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-[#005F99] p-2"
            aria-label={isOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <nav className="absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 shadow-xl flex flex-col space-y-4 md:hidden animate-slide-up" aria-label="Mobile Navigation">
          <button onClick={() => scrollToSection('features')} className="text-lg font-bold text-slate-700 text-left w-full py-2">Features</button>
          <button onClick={() => scrollToSection('ecosystem')} className="text-lg font-bold text-slate-700 text-left w-full py-2">Ecosystem</button>
          <button onClick={() => scrollToSection('pricing')} className="text-lg font-bold text-slate-700 text-left w-full py-2">Pricing</button>
          <div className="h-px w-full bg-slate-100 my-2"></div>
          <Link href="/auth" className="flex items-center gap-2 text-lg font-bold text-[#005F99] py-2"><LogIn size={20} /> Login</Link>
          <Link href="/auth" className="flex items-center gap-2 text-lg font-bold text-[#005F99] py-2"><UserPlus size={20} /> Create Account</Link>
          <Link href="/generator" className="w-full text-center bg-[#005F99] text-white py-3.5 rounded-xl font-bold text-lg mt-2 shadow-lg">Launch App</Link>
        </nav>
      )}
    </header>
  );
};

// --- COMPONENT: INTERACTIVE DEMO ---
const InteractiveProcessDemo = () => {
  const [step, setStep] = useState(0);

  const runSimulation = () => {
    if (step !== 0) return;
    setStep(1);
    setTimeout(() => setStep(2), 1500); 
    setTimeout(() => setStep(3), 3500); 
    setTimeout(() => setStep(0), 6000); 
  };

  return (
    <div className="relative group perspective-1000" role="img" aria-label="Interactive demo showing invoice generation process">
      <div className="absolute -inset-1 bg-gradient-to-r from-[#005F99] to-[#00B3B3] rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden min-h-[400px] flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center gap-3">
           <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-300"></div><div className="w-3 h-3 rounded-full bg-slate-300"></div><div className="w-3 h-3 rounded-full bg-slate-300"></div></div>
           <div className="flex-1 text-center"><span className="bg-white px-3 py-1 rounded-md text-[10px] font-mono text-slate-400 border border-slate-200">ai-engine.axioralabs.com</span></div>
        </div>
        <div className="p-8 flex-1 flex flex-col items-center justify-center space-y-8 relative">
          <div className={`w-full transition-all duration-500 ${step === 2 ? 'opacity-50 scale-90 blur-[2px]' : 'opacity-100'}`}>
            <label className="text-xs font-bold text-[#005F99] uppercase tracking-wider mb-2 block">1. User Input</label>
            <div className="relative">
              <input readOnly value={step === 0 ? "" : "Invoice for 50 bags of Tokyo Cement at 2450..."} placeholder="Type your request here..." className="w-full bg-slate-50 border border-slate-300 text-slate-800 p-4 rounded-xl shadow-inner focus:ring-2 focus:ring-[#00B3B3] outline-none font-medium text-sm transition-all" aria-label="Demo Input" />
              {step === 0 && (
                <button onClick={runSimulation} className="absolute right-2 top-2 bottom-2 bg-[#005F99] text-white px-4 rounded-lg font-bold text-xs hover:bg-[#004470] transition-colors flex items-center gap-2 animate-pulse"><Play size={14} fill="currentColor" /> RUN DEMO</button>
              )}
            </div>
          </div>
          {step === 2 && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
               <div className="relative mb-4"><div className="absolute inset-0 bg-[#00B3B3] rounded-full blur-xl opacity-30 animate-pulse"></div><Cpu size={64} className="text-[#005F99] relative z-10 animate-bounce" /></div>
               <h3 className="text-xl font-bold text-[#005F99]">Axiora AI Engine</h3>
               <p className="text-slate-500 text-sm mt-2">Processing Natural Language...</p>
               <div className="w-48 h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden"><div className="h-full bg-gradient-to-r from-[#005F99] to-[#00B3B3] w-full animate-[loading_1.5s_ease-in-out]"></div></div>
            </div>
          )}
          <div className={`w-full transition-all duration-500 transform ${step === 3 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-50'}`}>
            <label className="text-xs font-bold text-[#00B3B3] uppercase tracking-wider mb-2 block flex justify-between"><span>2. Structured Output</span>{step === 3 && <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> Ready</span>}</label>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200"><tr><th className="p-3">Description</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Total</th></tr></thead>
                <tbody><tr className={step === 3 ? "bg-blue-50/30 transition-colors duration-1000" : ""}><td className="p-3 font-medium text-slate-800">Tokyo Cement (50kg)</td><td className="p-3 text-center text-slate-600">50</td><td className="p-3 text-right text-slate-600">2,450</td><td className="p-3 text-right font-bold text-slate-800">122,500</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ShopLogo = ({ name, color }: { name: string, color: string }) => (
  <div className="flex items-center gap-2 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer transform hover:scale-105" title={name}>
    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white font-bold`}>{name[0]}</div>
    <span className="font-bold text-slate-700 text-sm">{name}</span>
  </div>
);

// --- MAIN PAGE ---

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  return (
    <main className="bg-white">
      {/* Inject Structured Data for SEO/AIEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <Navbar />
      <EnterpriseDetailsModal isOpen={isEnterpriseModalOpen} onClose={() => setIsEnterpriseModalOpen(false)} />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50/50">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-7xl mx-auto px-4 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          <div className="text-center lg:text-left space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#005F99] text-xs font-bold uppercase tracking-wider">
               <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B3B3] opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-[#005F99]"></span></span>
               Axiora Labs v2.0 Live
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#333333] tracking-tight leading-[1.1]">
              Invoicing <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#005F99] via-[#00B3B3] to-[#005F99] animate-gradient bg-300%">Reimagined.</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience the power of NLP. Type casually in English, Sinhala, or Tamil, and watch our <b>Axiora AI</b> Engine build professional invoices instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
              <Link href="/generator" className="flex items-center justify-center gap-3 bg-[#005F99] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#004470] transition-all shadow-xl shadow-blue-200 hover:-translate-y-1">
                <Zap size={20} className="text-[#00B3B3]" /> Start Generating
              </Link>
              <button onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center gap-3 px-8 py-4 rounded-full font-bold text-slate-600 hover:text-[#005F99] hover:bg-white border border-transparent hover:border-slate-200 transition-all">View Live Demo</button>
            </div>
            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 border-t border-slate-200/50 mt-8">
               <div className="text-left"><p className="text-2xl font-black text-[#005F99]">100+</p><p className="text-xs text-slate-500 uppercase tracking-wide">Active Shops</p></div>
               <div className="h-8 w-px bg-slate-200"></div>
               <div className="text-left"><p className="text-2xl font-black text-[#005F99]">10k+</p><p className="text-xs text-slate-500 uppercase tracking-wide">Invoices Generated</p></div>
            </div>
          </div>
          <div className="relative animate-slide-up animation-delay-2000" id="demo">
             <InteractiveProcessDemo />
          </div>
        </div>
      </section>

      {/* TRUSTED BY SECTION */}
      <section id="trusted" className="py-12 border-b border-slate-100 bg-white" aria-label="Trusted by Companies">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by 100+ Innovative Sri Lankan Businesses</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
             <ShopLogo name="Kandy Hardware" color="bg-red-500" />
             <ShopLogo name="City Mobiles" color="bg-blue-500" />
             <ShopLogo name="Green Grocers" color="bg-green-500" />
             <ShopLogo name="Lanka Tiles" color="bg-orange-500" />
             <ShopLogo name="Tech Zone" color="bg-purple-500" />
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-[#333333] mb-4">Why Axiora is the <span className="text-[#00B3B3]">Standard.</span></h2>
            <p className="text-slate-600">We didn't just build an invoice tool. We built a productivity engine for the modern Sri Lankan merchant.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Database, title: "Smart History", desc: "Never lose a customer. Auto-save every invoice and client detail to your secure cloud database." },
              { icon: Server, title: "Instant PDF", desc: "Generate lightweight, WhatsApp-optimized PDFs that look professional on any mobile screen." },
              { icon: Cpu, title: "Trilingual AI", desc: "Our engine understands 'Cement', 'සිමෙන්ති', and 'சிமெண்ட்' seamlessly in the same sentence." }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-[#00B3B3]/30 hover:shadow-lg transition-all group">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-[#005F99] mb-6 group-hover:bg-[#005F99] group-hover:text-white transition-colors">
                  <feature.icon size={28} />
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- AXIORA ECOSYSTEM (AMAZING DESIGN UPDATE) --- */}
      <section id="ecosystem" className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#005F99 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-white to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-500 text-xs font-bold uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#005F99] animate-pulse"></span> The Network
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-[#333333] mb-6">
              One Vision. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005F99] to-[#00B3B3]">Three Dimensions.</span>
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
              We have built a vertically integrated ecosystem to handle every aspect of modern business: <b className="text-slate-700">Creation, Growth, and Knowledge.</b>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* 1. Axiora Labs (Software) */}
            <a 
              href="https://www.axioralabs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative h-[420px] bg-white rounded-[2rem] border border-slate-200 p-2 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,95,153,0.3)] hover:-translate-y-2 flex flex-col"
            >
               {/* Image/Banner Area */}
               <div className="relative h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden mb-2 group-hover:bg-[#005F99]/5 transition-colors">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative w-40 h-16 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                       <Image src="/axiora-logo.png" alt="Axiora Labs" fill className="object-contain" />
                     </div>
                  </div>
               </div>

               {/* Content Area */}
               <div className="flex-1 p-6 flex flex-col relative">
                  <div className="absolute top-0 right-6 -translate-y-1/2 w-12 h-12 bg-[#005F99] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                     <Code size={24} />
                  </div>
                  
                  <span className="text-[#005F99] font-bold text-xs uppercase tracking-widest mb-3">Software Division</span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#005F99] transition-colors">Axiora Labs</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    We build high-performance SaaS platforms and bespoke software solutions that power the future of business.
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                     <span className="text-slate-400 text-xs font-medium group-hover:text-[#005F99] transition-colors">axioralabs.com</span>
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#005F99] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                        <ArrowUpRight size={16} />
                     </div>
                  </div>
               </div>
            </a>

            {/* 2. Axiora Digital (Marketing) */}
            <a 
              href="https://www.axioradigital.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative h-[420px] bg-white rounded-[2rem] border border-slate-200 p-2 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,179,179,0.3)] hover:-translate-y-2 flex flex-col"
            >
               <div className="relative h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden mb-2 group-hover:bg-[#00B3B3]/5 transition-colors">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-100/50 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative w-40 h-16 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110">
                       <Image src="/1.png" alt="Axiora Digital" fill className="object-contain" />
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-6 flex flex-col relative">
                  <div className="absolute top-0 right-6 -translate-y-1/2 w-12 h-12 bg-[#00B3B3] rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-900/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                     <TrendingUp size={24} />
                  </div>
                  
                  <span className="text-[#00B3B3] font-bold text-xs uppercase tracking-widest mb-3">Marketing Division</span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-[#00B3B3] transition-colors">Axiora Digital</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Performance marketing driven by data. We turn clicks into customers using AI automation and tech-first strategies.
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                     <span className="text-slate-400 text-xs font-medium group-hover:text-[#00B3B3] transition-colors">axioradigital.com</span>
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[#00B3B3] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                        <ArrowUpRight size={16} />
                     </div>
                  </div>
               </div>
            </a>

            {/* 3. Axiora Academy (Education) */}
            <a 
              href="https://www.axiora.academy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group relative h-[420px] bg-white rounded-[2rem] border border-slate-200 p-2 transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(234,179,8,0.3)] hover:-translate-y-2 flex flex-col"
            >
               <div className="relative h-48 bg-slate-100 rounded-[1.5rem] overflow-hidden mb-2 group-hover:bg-yellow-500/5 transition-colors">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-100/50 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="relative w-20 h-20 grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110 rounded-xl overflow-hidden shadow-sm">
                       <Image src="/bg white.png" alt="Axiora Academy" fill className="object-cover" />
                     </div>
                  </div>
               </div>

               <div className="flex-1 p-6 flex flex-col relative">
                  <div className="absolute top-0 right-6 -translate-y-1/2 w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-yellow-600/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                     <GraduationCap size={24} />
                  </div>
                  
                  <span className="text-yellow-600 font-bold text-xs uppercase tracking-widest mb-3">Education Division</span>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-yellow-600 transition-colors">Axiora Academy</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Empowering the next generation. We bridge the gap between theory and industry with practical tech & business education.
                  </p>

                  <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between">
                     <span className="text-slate-400 text-xs font-medium group-hover:text-yellow-600 transition-colors">axiora.academy</span>
                     <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                        <ArrowUpRight size={16} />
                     </div>
                  </div>
               </div>
            </a>

          </div>
        </div>
      </section>

      {/* --- AXIORA DIGITAL HIGHLIGHT (UPDATED DESIGN) --- */}
      <section className="bg-[#000d14] py-24 relative overflow-hidden">
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a2a36_1px,transparent_1px),linear-gradient(to_bottom,#0a2a36_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>
        
        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00B3B3]/10 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#005F99]/10 rounded-full blur-[128px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center relative z-10">
           
           {/* Text Content */}
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#00B3B3]/30 bg-[#00B3B3]/5 rounded-full text-[#00B3B3] text-xs font-bold uppercase tracking-wider mb-6 shadow-[0_0_15px_rgba(0,179,179,0.2)]">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#00B3B3] animate-pulse"></span> Now Launching
              </div>
              
              <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
                Axiora Digital<span className="text-[#00B3B3]">.</span>
              </h2>
              
              <h3 className="text-xl text-slate-300 font-light mb-8 border-l-4 border-[#00B3B3] pl-6 italic">
                "AI-Driven Growth, Tech-First Marketing"
              </h3>

              <p className="text-slate-400 leading-loose mb-10 text-lg">
                Axiora Digital Marketing is the performance-driven marketing arm of the Axiora ecosystem. While traditional agencies focus on "likes" and "templates," we view digital marketing as a software problem to be solved with <span className="text-white font-bold">data, speed, and automation.</span>
              </p>

              <a 
                href="https://www.axioradigital.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-white text-[#001829] px-8 py-4 rounded-full font-bold hover:bg-[#00B3B3] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,179,179,0.4)]"
              >
                Visit axioradigital.com <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
           </div>

           {/* Visual HUD Mockup */}
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#005F99] to-[#00B3B3] rounded-2xl opacity-20 blur-xl group-hover:opacity-40 transition duration-1000"></div>
              
              <div className="bg-[#001520] border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
                 {/* Decorative Header */}
                 <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                    <div className="flex gap-2">
                       <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                       <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                       <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                    </div>
                    <div className="text-[10px] font-mono text-[#00B3B3]">SYSTEM_STATUS: OPTIMAL</div>
                 </div>

                 {/* Stats Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-[#00B3B3]/50 transition-colors group/card">
                       <TrendingUp className="text-[#00B3B3] mb-3 group-hover/card:scale-110 transition-transform" size={28} />
                       <h4 className="text-white font-bold text-2xl">340%</h4>
                       <p className="text-slate-500 text-xs mt-1 uppercase tracking-wide">ROI Growth</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/5 hover:border-[#00B3B3]/50 transition-colors group/card">
                       <Globe className="text-[#005F99] mb-3 group-hover/card:scale-110 transition-transform" size={28} />
                       <h4 className="text-white font-bold text-2xl">Global</h4>
                       <p className="text-slate-500 text-xs mt-1 uppercase tracking-wide">Reach</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-xl border border-white/5 col-span-2 flex items-center justify-between hover:border-[#00B3B3]/50 transition-colors">
                       <div>
                          <h4 className="text-white font-bold text-lg">Automated Campaigns</h4>
                          <p className="text-slate-500 text-xs mt-1">AI-Optimized Ad Spend</p>
                       </div>
                       <div className="w-12 h-12 bg-[#00B3B3]/20 rounded-full flex items-center justify-center text-[#00B3B3] animate-pulse">
                          <Zap size={20} />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
           <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-4xl font-black text-[#333333]">Fair Pricing</h2>
                <p className="text-slate-500 mt-2">Choose the plan that fits your volume.</p>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl">
                 <button onClick={() => setBillingCycle('monthly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-[#005F99]' : 'text-slate-500 hover:text-slate-800'}`}>Monthly</button>
                 <button onClick={() => setBillingCycle('yearly')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-[#005F99]' : 'text-slate-500 hover:text-slate-800'}`}>Yearly <span className="text-xs text-green-600 ml-1">(-10%)</span></button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Card */}
              <div className="p-8 border border-slate-200 rounded-3xl hover:border-slate-300 transition-all">
                 <h3 className="font-bold text-lg text-slate-500">Guest</h3>
                 <div className="my-4"><span className="text-4xl font-black text-slate-800">Free</span></div>
                 <p className="text-sm text-slate-500 mb-8">For quick, urgent invoices.</p>
                 <ul className="space-y-4 mb-8">
                    <li className="flex gap-3 text-sm text-slate-700"><CheckCircle size={18} className="text-slate-300"/> 2 AI Quotes / Day</li>
                    <li className="flex gap-3 text-sm text-slate-700"><CheckCircle size={18} className="text-slate-300"/> Standard PDF</li>
                 </ul>
                 <Link href="/generator" className="block w-full py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 hover:bg-slate-50">Try Now</Link>
              </div>

              {/* Verified Card */}
              <div className="p-8 border-2 border-[#00B3B3] bg-[#00B3B3]/5 rounded-3xl relative shadow-xl">
                 <div className="absolute top-0 right-0 bg-[#00B3B3] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl">POPULAR</div>
                 <h3 className="font-bold text-lg text-[#005F99]">Verified</h3>
                 <div className="my-4"><span className="text-4xl font-black text-[#005F99]">Free</span></div>
                 <p className="text-sm text-[#005F99]/80 mb-8">Login to save your brand.</p>
                 <ul className="space-y-4 mb-8">
                    <li className="flex gap-3 text-sm text-slate-800 font-medium"><CheckCircle size={18} className="text-[#00B3B3]"/> 10 AI Quotes / Day</li>
                    <li className="flex gap-3 text-sm text-slate-800 font-medium"><CheckCircle size={18} className="text-[#00B3B3]"/> Auto-fill Logo & Data</li>
                    <li className="flex gap-3 text-sm text-slate-800 font-medium"><CheckCircle size={18} className="text-[#00B3B3]"/> Cloud History</li>
                 </ul>
                 <Link href="/auth" className="block w-full py-3 bg-[#005F99] text-white rounded-xl text-center font-bold hover:bg-[#004470] shadow-lg">Get Started</Link>
              </div>

              {/* Enterprise Card */}
              <div className="p-8 border border-slate-200 rounded-3xl hover:border-slate-300 transition-all">
                 <h3 className="font-bold text-lg text-slate-800">Enterprise</h3>
                 <div className="my-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-800">
                      {billingCycle === 'monthly' ? "1,900" : "1,710"}
                    </span>
                    <span className="text-sm font-bold text-slate-400">LKR/mo</span>
                 </div>
                 <p className="text-sm text-slate-500 mb-8">
                   {billingCycle === 'monthly' ? 'Billed monthly' : 'Billed yearly (20,520 LKR)'}
                 </p>
                 <ul className="space-y-4 mb-8">
                    <li className="flex gap-3 text-sm text-slate-700"><CheckCircle size={18} className="text-[#005F99]"/> Unlimited Axiora AI</li>
                    <li className="flex gap-3 text-sm text-slate-700"><CheckCircle size={18} className="text-[#005F99]"/> Analytics Dashboard</li>
                    <li className="flex gap-3 text-sm text-slate-700"><CheckCircle size={18} className="text-[#005F99]"/> Multiple Business Profiles</li>
                 </ul>
                 
                 <button 
                   onClick={() => setIsEnterpriseModalOpen(true)}
                   className="block w-full py-3 border border-slate-200 rounded-xl text-center font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                 >
                   View More Details
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* --- AEO OPTIMIZED FAQ SECTION --- */}
      <section id="faq" className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* AEO: JSON-LD Schema for AI/Search Engines */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                  {
                    "@type": "Question",
                    "name": "Is the Axiora Smart Quotation Generator free to use?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, the Axiora Smart Quotation Generator is completely free to use immediately after you successfully register a verified account."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Which languages does the Axiora AI support?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our AI engine is fully optimized for all three major Sri Lankan languages: English, Sinhala, and Tamil. You can type naturally in any of these languages to generate invoices."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "Is there a daily limit on AI quotes?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Yes, free accounts have a daily limit for AI-generated quotes. To go beyond this limit and enjoy an unlimited experience, you must upgrade to a paid Enterprise plan."
                    }
                  },
                  {
                    "@type": "Question",
                    "name": "How quickly can I get support?",
                    "acceptedAnswer": {
                      "@type": "Answer",
                      "text": "Our customer center is dedicated to providing answers as soon as possible (ASAP). We prioritize rapid response times via WhatsApp and email to ensure your business keeps running smoothly."
                    }
                  }
                ]
              })
            }}
          />

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#333333] mb-4">Frequently Asked <span className="text-[#005F99]">Questions</span></h2>
            <p className="text-slate-500">Everything you need to know about Axiora.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Q1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-start gap-2">
                 <span className="text-[#00B3B3] mt-1">?</span> Is it completely free?
               </h3>
               <p className="text-slate-600 text-sm leading-relaxed">
                 Yes! Axiora Smart Quotation generator is <b>completely free</b> for use after a successful registration. You can start creating professional invoices immediately without adding a credit card.
               </p>
            </div>

            {/* Q2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-start gap-2">
                 <span className="text-[#00B3B3] mt-1">?</span> Does it work in Sinhala/Tamil?
               </h3>
               <p className="text-slate-600 text-sm leading-relaxed">
                 Absolutely. Our AI is trained to work seamlessly with <b>all three Sri Lankan languages</b> (English, Sinhala, and Tamil). It understands mixed-language input perfectly.
               </p>
            </div>

            {/* Q3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-start gap-2">
                 <span className="text-[#00B3B3] mt-1">?</span> Can I get unlimited AI quotes?
               </h3>
               <p className="text-slate-600 text-sm leading-relaxed">
                 If you want to go beyond the daily limit of AI quotes and use the <b>unlimited experience</b>, you will need to upgrade to our paid plan. Free users have a generous daily cap.
               </p>
            </div>

            {/* Q4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
               <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-start gap-2">
                 <span className="text-[#00B3B3] mt-1">?</span> How is the customer support?
               </h3>
               <p className="text-slate-600 text-sm leading-relaxed">
                 We take support seriously. Our customer center will provide you with an answer <b>ASAP</b>. You can contact us directly via WhatsApp for the fastest service.
               </p>
            </div>

          </div>
        </div>
      </section>

      {/* BIG FOOTER */}
      <footer className="bg-[#001829] text-white pt-20 pb-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              
              <div className="col-span-1 md:col-span-1">
                <div className="relative w-40 h-12 mb-6">
                   <Image 
                     src="/Axiora Labs Logo.png" 
                     alt="Axiora Labs" 
                     fill 
                     className="object-contain object-left"
                   />
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We are a Sri Lankan software house dedicated to simplifying business logic through intelligent design and cutting-edge technology.
                </p>
                <div className="mt-6 flex gap-4 text-slate-400">
                  <a href="#" aria-label="LinkedIn" className="hover:text-[#00B3B3] transition-colors"><Linkedin size={24} /></a>
                  <a href="#" aria-label="Instagram" className="hover:text-[#00B3B3] transition-colors"><Instagram size={24} /></a>
                  <a href="#" aria-label="TikTok" className="hover:text-[#00B3B3] transition-colors"><TikTokIcon size={24} /></a>
                </div>
              </div>

              <div>
                 <h4 className="font-bold text-lg mb-6 text-[#00B3B3]">Product</h4>
                 <ul className="space-y-4 text-sm text-slate-400">
                    <li><Link href="/generator" className="hover:text-white transition-colors">Invoice Generator</Link></li>
                    <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Features</button></li>
                    <li><button onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Pricing</button></li>
                 </ul>
              </div>

              <div>
                 <h4 className="font-bold text-lg mb-6 text-[#00B3B3]">Company</h4>
                 <ul className="space-y-4 text-sm text-slate-400">
                    <li><Link href="#" className="hover:text-white transition-colors">About Axiora</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                    <li><Link href="mailto:hello@axioralabs.com" className="hover:text-white transition-colors">Contact Us</Link></li>
                    <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                 </ul>
              </div>

              <div>
                 <h4 className="font-bold text-lg mb-6 text-[#00B3B3]">Get in Touch</h4>
                 <ul className="space-y-4 text-sm text-slate-400">
                    <li className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> hello@axioralabs.com</li>
                    <li>+94 77 401 6146</li>
                    <li>Colombo, Sri Lanka</li>
                 </ul>
                 <div className="mt-6">
                    <p className="text-xs text-slate-500 mb-2">Subscribe to our newsletter</p>
                    <div className="flex bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                       <input className="bg-transparent px-3 py-2 text-sm outline-none w-full" placeholder="Email address" aria-label="Email address for newsletter" />
                       <button className="bg-[#00B3B3] px-3 py-2 text-xs font-bold hover:bg-[#009999]">→</button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-white/10 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-xs text-slate-600">
              <p>© {new Date().getFullYear()} Axiora Labs. Built with ❤️ in Sri Lanka.</p>
              <div className="flex gap-4 mt-4 md:mt-0">
                 <span>Status: All Systems Operational</span>
              </div>
           </div>
        </div>
      </footer>
    </main>
  );
}