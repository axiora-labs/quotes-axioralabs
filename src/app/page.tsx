"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  CheckCircle, Menu, X, ArrowRight, Terminal, 
  Github, Linkedin, Instagram, Sparkles, MessageCircle, 
  Globe, FileText, Check, Code2, Heart, Zap, Calendar,
  Store, Smartphone, Truck, ShoppingBag, Wrench, Laptop,
  GitBranch, GitPullRequest, Star, Users, Coffee, Mail, Phone,
  BarChart3, CircleCheck, Filter, Wallet, Download, Type
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
      "sameAs": [
        "https://www.linkedin.com/company/axioralabs",
        "https://github.com/axiora-labs/quotes-axioralabs"
      ],
      "description": "Open source software house dedicated to intelligent business logic and smart tools for the world.",
    },
    {
      "@type": "SoftwareApplication",
      "name": "Axiora QuoteEngine",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "description": "100% free, open source, multi-language invoice and quotation generator with financial analytics for businesses worldwide. No tracking, no data gathering.",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    }
  ]
};

// --- ICONS ---
const TikTokIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

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
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60' : 'bg-transparent'} py-3`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <Image src="/axiora-logo.png" alt="Axiora Labs" width={32} height={32} className="rounded-lg" />
            <div className="font-bold text-lg tracking-tight text-slate-900">
              Axiora <span className="text-slate-400 font-normal">/</span> <span className="text-slate-600">QuoteEngine</span>
            </div>
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Open Source
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-1">
            <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors px-3 py-2 rounded-md hover:bg-slate-100">Features</button>
            <button onClick={() => scrollToSection('dashboard')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors px-3 py-2 rounded-md hover:bg-slate-100">Dashboard</button>
            <button onClick={() => scrollToSection('use-cases')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors px-3 py-2 rounded-md hover:bg-slate-100">Use Cases</button>
            <button onClick={() => scrollToSection('community')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors px-3 py-2 rounded-md hover:bg-slate-100">Community</button>
            <button onClick={() => scrollToSection('contribute')} className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors px-3 py-2 rounded-md hover:bg-slate-100">Contribute</button>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <a 
              href="https://github.com/axiora-labs/quotes-axioralabs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm transition-colors px-3 py-2 rounded-md hover:bg-slate-100 border border-slate-200"
            >
              <Github size={16} />
              Star
            </a>
            <Link href="/generator" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium hover:bg-slate-800 transition-all text-sm flex items-center gap-1.5">
              Launch App <ArrowRight size={14} />
            </Link>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-slate-900 p-2">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 p-6 shadow-xl flex flex-col space-y-2 md:hidden">
          <button onClick={() => scrollToSection('features')} className="text-base font-medium text-slate-700 text-left w-full py-2.5 px-3 hover:bg-slate-50 rounded-md">Features</button>
          <button onClick={() => scrollToSection('dashboard')} className="text-base font-medium text-slate-700 text-left w-full py-2.5 px-3 hover:bg-slate-50 rounded-md">Dashboard</button>
          <button onClick={() => scrollToSection('use-cases')} className="text-base font-medium text-slate-700 text-left w-full py-2.5 px-3 hover:bg-slate-50 rounded-md">Use Cases</button>
          <button onClick={() => scrollToSection('community')} className="text-base font-medium text-slate-700 text-left w-full py-2.5 px-3 hover:bg-slate-50 rounded-md">Community</button>
          <button onClick={() => scrollToSection('contribute')} className="text-base font-medium text-slate-700 text-left w-full py-2.5 px-3 hover:bg-slate-50 rounded-md">Contribute</button>
          <div className="h-px w-full bg-slate-100 my-2"></div>
          <Link href="/generator" className="w-full text-center bg-slate-900 text-white py-3 rounded-md font-medium text-base mt-2">Launch App</Link>
        </div>
      )}
    </header>
  );
};

// --- COMPONENT: TERMINAL DEMO ---
const TerminalDemo = () => {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl -z-10 opacity-60"></div>
      
      <div className="bg-[#0a0a0a] border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-[#1a1a1a] border-b border-slate-800 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
          </div>
          <div className="flex-1 text-center">
            <span className="text-[11px] font-mono text-slate-500">axiora ~ quote-engine</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-sm min-h-[340px] bg-[#0a0a0a] relative">
          <div className="space-y-3">
            {/* Line 1 */}
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 select-none">❯</span>
              <div className="flex-1">
                <span className="text-slate-300">create_invoice</span>
                <span className="text-slate-500"> --client </span>
                <span className="text-amber-300">"Global Business"</span>
              </div>
            </div>

            {/* Line 2 */}
            <div className={`flex items-start gap-2 transition-opacity duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-slate-500 select-none">│</span>
              <span className="text-slate-400">Processing 50 items × $2,450...</span>
            </div>

            {/* Line 3 */}
            <div className={`flex items-start gap-2 transition-opacity duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-slate-500 select-none">│</span>
              <span className="text-slate-400">Applying 5% discount...</span>
            </div>

            {/* Line 4 */}
            <div className={`flex items-start gap-2 transition-opacity duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-slate-500 select-none">│</span>
              <span className="text-emerald-400">✓ Generated invoice.pdf</span>
              <span className="text-slate-500 ml-2">($116,375.00)</span>
            </div>

            {/* Line 5 */}
            <div className={`flex items-start gap-2 transition-opacity duration-500 ${step >= 4 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-emerald-400 select-none">❯</span>
              <span className="text-slate-300">send_whatsapp</span>
              <span className="text-slate-500"> --to </span>
              <span className="text-amber-300">+1 234 567 8900</span>
              <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse"></span>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between pt-4 border-t border-slate-800/50">
            <div className="flex items-center gap-3 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>Ready</span>
              <span>UTF-8</span>
              <span>Global</span>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: DASHBOARD PREVIEW MOCKUP ---
const DashboardPreview = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-3xl blur-3xl -z-10 opacity-80"></div>
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white border border-slate-200 rounded-md px-4 py-1 text-[11px] font-mono text-slate-500 flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-slate-200"></div>
              axioralabs.com/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-6 bg-slate-50">
          {/* Welcome bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="h-5 w-48 bg-slate-900 rounded-md"></div>
              <div className="h-3 w-64 bg-slate-300 rounded mt-2"></div>
            </div>
            <div className="h-9 w-32 bg-slate-900 rounded-md"></div>
          </div>

          {/* Chart card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-slate-400" />
                <div className="h-4 w-32 bg-slate-800 rounded"></div>
              </div>
              <div className="h-6 w-40 bg-emerald-50 border border-emerald-200 rounded-md"></div>
            </div>
            
            {/* Chart bars */}
            <div className="h-32 flex items-end justify-between gap-3 px-2">
              {[40, 65, 45, 80, 55, 90].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className={`w-full rounded-t-md ${i === 5 ? 'bg-slate-900' : 'bg-slate-200'}`}
                    style={{ height: `${height}%` }}
                  ></div>
                  <div className="h-2 w-8 bg-slate-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-slate-300 rounded"></div>
                <Wallet size={14} className="text-emerald-500" />
              </div>
              <div className="h-6 w-28 bg-slate-900 rounded"></div>
              <div className="h-2 w-20 bg-emerald-100 rounded mt-2"></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-slate-300 rounded"></div>
                <Calendar size={14} className="text-amber-500" />
              </div>
              <div className="h-6 w-28 bg-slate-900 rounded"></div>
              <div className="h-2 w-20 bg-amber-100 rounded mt-2"></div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-3 w-24 bg-slate-300 rounded"></div>
                <FileText size={14} className="text-slate-400" />
              </div>
              <div className="h-6 w-16 bg-slate-900 rounded"></div>
              <div className="h-2 w-20 bg-slate-100 rounded mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <main className="bg-white min-h-screen selection:bg-slate-900 selection:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
        {/* Radial fade */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          
          {/* Top badge row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <a 
              href="https://github.com/axiora-labs/quotes-axioralabs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700 hover:border-slate-300 transition-all"
            >
              <Github size={14} />
              <span className="font-bold">v2.4.1</span>
              <span className="text-slate-400">•</span>
              <span>MIT License</span>
            </a>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              100% Free • No Paywalls • Zero Tracking
            </div>
          </div>

          {/* Hero content */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-6">
              The open source invoice<br/>
              <span className="text-slate-400">built for the world.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-2xl mx-auto">
              A completely free, privacy-first invoicing tool with <b className="text-slate-900">financial analytics</b> for businesses and freelancers anywhere. 
              Works in <b className="text-slate-900">any language</b>. No signup required. No tracking. No data gathering.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/generator" className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-md font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group">
                Launch the App 
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a 
                href="https://github.com/axiora-labs/quotes-axioralabs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white border border-slate-300 text-slate-900 px-6 py-3 rounded-md font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Github size={16} /> View on GitHub
              </a>
            </div>
            
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> No signup to create</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Zero tracking & data gathering</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> MIT Licensed</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500" /> Global access</div>
            </div>
          </div>

          {/* Terminal Demo */}
          <TerminalDemo />
        </div>
      </section>

      {/* --- STATS BAR --- */}
      <section className="border-y border-slate-200 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Invoices Generated', value: '12,400+', icon: FileText },
            { label: 'Active Users', value: '100+', icon: Users },
            { label: 'GitHub Stars', value: '0', icon: Star },
            { label: 'Est.', value: '2026', icon: Calendar },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <stat.icon size={20} className="text-slate-400 mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-600 text-xs font-medium uppercase tracking-wider mb-4">
              <Code2 size={12} /> Generator Features
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Everything you need.<br/>
              <span className="text-slate-400">Nothing you don't.</span>
            </h2>
            <p className="text-lg text-slate-600">A minimal, opinionated toolkit designed for speed. No bloat, no ads, no upsells.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden">
            {[
              {
                icon: Zap,
                title: "Instant Generation",
                desc: "Type naturally. Get a professional invoice in seconds. No complex forms, no friction."
              },
              {
                icon: Globe,
                title: "Universal Language Support",
                desc: "Works in English, Sinhala, Tamil, and literally any other language you need. Truly global."
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Ready PDFs",
                desc: "Lightweight PDFs optimized for mobile. Send to customers before they leave the shop."
              },
              {
                icon: Terminal,
                title: "Rich Text Editor",
                desc: "Format notes and terms with bold, italic, underline, alignment, and bullet lists — just like Word."
              },
              {
                icon: Type,
                title: "Custom Typography & Design",
                desc: "Choose from 5 font families, adjust sizes, heading styles, layout density, and accent colors."
              },
              {
                icon: Download,
                title: "PDF Export Quality",
                desc: "Choose High (300 DPI print), Medium (standard), or Low (web) — optimize for any use case."
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 hover:bg-slate-50/50 transition-colors group">
                <feature.icon size={24} className="text-slate-700 mb-4 group-hover:text-slate-900 transition-colors" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- DASHBOARD SECTION (NEW) --- */}
      <section id="dashboard" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-md text-slate-600 text-xs font-medium uppercase tracking-wider mb-4">
              <BarChart3 size={12} /> Business Dashboard
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Not just an invoice generator.<br/>
              <span className="text-slate-400">A business intelligence tool.</span>
            </h2>
            <p className="text-lg text-slate-600">Sign up for free to unlock a powerful dashboard with charts, metrics, and status tracking.</p>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mb-16">
            <DashboardPreview />
          </div>

          {/* Dashboard Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Financial Analytics",
                desc: "6-month revenue chart showing your paid earnings over time. Spot trends instantly."
              },
              {
                icon: CircleCheck,
                title: "Status Tracking",
                desc: "Mark invoices as Draft, Pending, Paid, or Cancelled. Track payment status in one click."
              },
              {
                icon: Wallet,
                title: "Revenue Metrics",
                desc: "See your total paid revenue, pending amounts, and unique clients at a glance."
              },
              {
                icon: Filter,
                title: "Smart Date Filters",
                desc: "Filter invoices by month and year. Stats update dynamically based on your selection."
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white mb-4 group-hover:scale-105 transition-transform">
                  <feature.icon size={18} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- USE CASES --- */}
      <section id="use-cases" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-600 text-xs font-medium uppercase tracking-wider mb-4">
              <Users size={12} /> Use Cases
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
              Built for every kind<br/>of business.
            </h2>
            <p className="text-lg text-slate-600">From the corner hardware shop to the freelance developer — QuoteEngine adapts to you, anywhere in the world.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Store, title: "Hardware & Building", desc: "Bulk items like cement, paint, tools. Complex discounts, fast checkout." },
              { icon: Smartphone, title: "Tech & Mobile Shops", desc: "Phones, accessories, repair services. Track serial numbers and warranties." },
              { icon: Truck, title: "Wholesalers & Distributors", desc: "Large orders, multiple customer tiers, bulk pricing made simple." },
              { icon: ShoppingBag, title: "Retail & Grocery", desc: "Speed up checkout. Create and WhatsApp receipts in seconds." },
              { icon: Wrench, title: "Service Providers", desc: "Salons, technicians, mechanics — bill for labor and parts together." },
              { icon: Laptop, title: "Freelancers & Agencies", desc: "Branded quotes and invoices for design, dev, and consulting work." },
            ].map((useCase, i) => (
              <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors border border-slate-200">
                    <useCase.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">{useCase.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{useCase.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COMMUNITY / OPEN SOURCE --- */}
      <section id="community" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-medium uppercase tracking-wider mb-4">
                <GitBranch size={12} /> Community
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
                Made in the open.<br/>
                <span className="text-slate-400">Built by the community.</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                QuoteEngine is an open source project by <a href="https://www.axioralabs.com" target="_blank" rel="noopener noreferrer" className="text-slate-900 font-medium hover:underline">Axiora Labs</a>. 
                We believe great business tools should be free, transparent, and owned by the people who use them.
              </p>
              
              <div className="space-y-4">
                {[
                  { label: "MIT License", desc: "Use it, fork it, modify it. For personal or commercial use." },
                  { label: "No Tracking & No Data Gathering", desc: "We don't sell your data. We don't even look at it. Your privacy is absolute." },
                  { label: "Privacy First", desc: "Generate invoices as a guest — no account, no cookies, no strings attached." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900">{item.label}</div>
                      <div className="text-sm text-slate-600">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Code snippet card */}
            <div className="bg-[#0a0a0a] rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/60"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
                </div>
                <span className="text-xs font-mono text-slate-500 ml-2">README.md</span>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="text-slate-500"># Why we built this</div>
                <div className="text-slate-300 mt-3">
                  Small businesses around the world shouldn't have<br/>
                  to pay for basic tools.
                </div>
                <div className="text-slate-300 mt-3">
                  QuoteEngine is our way of giving back — <br/>
                  a <span className="text-emerald-400">free forever</span> tool for every shop,<br/>
                  every freelancer, every dream.
                </div>
                <div className="text-slate-500 mt-6">## Get Started</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-emerald-400">$</span>
                  <span className="text-slate-300">open</span>
                  <a href="/generator" className="text-amber-300 hover:underline">axioralabs.com/generator</a>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-emerald-400">$</span>
                  <span className="text-slate-300">star</span>
                  <a href="https://github.com/axiora-labs/quotes-axioralabs" className="text-amber-300 hover:underline">github.com/axiora-labs/quotes-axioralabs</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CONTRIBUTE / IDEAS --- */}
      <section id="contribute" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-slate-600 text-xs font-medium uppercase tracking-wider mb-4">
            <GitPullRequest size={12} /> Contribute
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Have an idea?<br/>
            <span className="text-slate-400">Let's build a smarter future together.</span>
          </h2>
          <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            We're always open to new ideas, features, and collaborations. Whether you want to 
            contribute code, report a bug, suggest a feature, or just say hi — we'd love to hear from you.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
            <a 
              href="https://wa.me/94718869555" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-100 transition-colors">
                <MessageCircle size={18} />
              </div>
              <div className="font-semibold text-slate-900 mb-1">WhatsApp</div>
              <div className="text-sm text-slate-600 font-mono">+94 71 886 9555</div>
              <div className="text-xs text-slate-500 mt-2">Fast replies, casual chats</div>
            </a>
            
            <a 
              href="mailto:hello@axioralabs.com" 
              className="bg-slate-50 border border-slate-200 rounded-xl p-6 hover:border-slate-300 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-100 transition-colors">
                <Mail size={18} />
              </div>
              <div className="font-semibold text-slate-900 mb-1">Email Us</div>
              <div className="text-sm text-slate-600 font-mono">hello@axioralabs.com</div>
              <div className="text-xs text-slate-500 mt-2">Features, feedback, partnerships</div>
            </a>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-3 text-left">
                <Coffee size={20} className="text-amber-600" />
                <div>
                  <div className="font-semibold text-slate-900">Prefer a direct chat?</div>
                  <div className="text-sm text-slate-600">Email ashen@axioralabs.com</div>
                </div>
              </div>
              <a 
                href="mailto:ashen@axioralabs.com" 
                className="text-sm font-medium text-slate-900 hover:text-slate-700 flex items-center gap-1"
              >
                Get in touch <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        ></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Ready to try it?
          </h2>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
            No account. No credit card. No strings attached. Just open the app and start creating.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/generator" className="bg-white text-slate-900 px-8 py-4 rounded-md font-medium hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group">
              Launch the App <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a 
              href="https://github.com/axiora-labs/quotes-axioralabs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-transparent border border-slate-700 text-white px-8 py-4 rounded-md font-medium hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              <Github size={16} /> Star on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
           <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
              
              <div className="md:col-span-5">
                <Image src="/Axiora.png" alt="Axiora Labs" width={140} height={40} className="mb-6" />
                <p className="text-slate-600 text-sm leading-relaxed max-w-md mb-6">
                  An open source initiative by Axiora Labs. Building free, thoughtful tools 
                  for businesses and freelancers worldwide.
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Heart size={14} className="text-red-500" />
                  <span>Made with care for the global community</span>
                </div>
                <div className="mt-6 flex gap-2">
                  <a href="https://github.com/axiora-labs/quotes-axioralabs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"><Github size={16} /></a>
                  <a href="https://www.linkedin.com/company/axiora-labs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"><Linkedin size={16} /></a>
                  <a href="https://www.instagram.com/axioralabs/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"><Instagram size={16} /></a>
                  <a href="https://www.tiktok.com/@axiora.labs" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-md border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors"><TikTokIcon size={16} /></a>
                </div>
              </div>

              <div className="md:col-span-2">
                 <h4 className="font-semibold text-slate-900 text-sm mb-4">Product</h4>
                 <ul className="space-y-3 text-sm text-slate-600">
                    <li><Link href="/generator" className="hover:text-slate-900 transition-colors">Launch App</Link></li>
                    <li><Link href="/auth" className="hover:text-slate-900 transition-colors">Create Account</Link></li>
                    <li><Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link></li>
                 </ul>
              </div>

              <div className="md:col-span-2">
                 <h4 className="font-semibold text-slate-900 text-sm mb-4">Project</h4>
                 <ul className="space-y-3 text-sm text-slate-600">
                    <li><a href="https://github.com/axiora-labs/quotes-axioralabs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">GitHub Repository</a></li>
                    <li><a href="https://www.axioralabs.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">Axiora Labs</a></li>
                    <li><Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
                    <li><Link href="#" className="hover:text-slate-900 transition-colors">MIT License</Link></li>
                 </ul>
              </div>

              <div className="md:col-span-3">
                 <h4 className="font-semibold text-slate-900 text-sm mb-4">Get in touch</h4>
                 <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <Mail size={14} className="flex-shrink-0 mt-0.5" />
                      <div className="font-mono text-xs">
                        <a href="mailto:hello@axioralabs.com" className="hover:text-slate-900">hello@axioralabs.com</a>
                        <br/>
                        <a href="mailto:ashen@axioralabs.com" className="hover:text-slate-900">ashen@axioralabs.com</a>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <Phone size={14} className="flex-shrink-0 mt-0.5" />
                      <a href="https://wa.me/94718869555" className="font-mono text-xs hover:text-slate-900">+94 71 886 9555</a>
                    </li>
                    <li className="text-slate-500 text-xs pt-2 border-t border-slate-100">
                      We welcome ideas, feedback,<br/>and collaboration.
                    </li>
                 </ul>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
              <p>© {new Date().getFullYear()} Axiora Labs. Released under the MIT License.</p>
              <p className="flex items-center gap-2">
                <span>Built with</span>
                <Heart size={12} className="text-red-500" />
                <span>for the open source community</span>
              </p>
           </div>
        </div>
      </footer>
    </main>
  );
}