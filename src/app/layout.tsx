import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// --- VIEWPORT OPTIMIZATION (Mobile-First) ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allows accessibility zooming but maintains layout integrity
  themeColor: "#001829", // Matches your brand technology blue
};

// --- SEO, AEO, & AIEO METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL("https://aquote.axioralabs.com"),
  title: {
    default: "Axiora QuoteEngine | Sri Lanka's Fastest Free Invoice Tool",
    template: "%s | Axiora Labs",
  },
  description: "Free trilingual invoice and quotation generator for Sri Lankan businesses. Create professional PDFs in English, Sinhala, and Tamil using AI-powered NLP technology.",
  keywords: [
    "free invoice generator sri lanka",
    "quotation maker sinhala",
    "tamil billing software",
    "sinhala billing software",
    "axiora labs",
    "ai invoice creator",
    "lkr quotation tool",
    "trilingual business tools",
    "free invoice generator",
  ],
  authors: [{ name: "Axiora Labs", url: "https://www.axioralabs.com" }],
  creator: "Axiora Labs",
  publisher: "Axiora Labs",
  
  // OpenGraph (Social Media SEO)
  openGraph: {
    type: "website",
    locale: "en_LK",
    url: "https://quote.axioralabs.com",
    title: "Axiora QuoteEngine | Smart Invoicing in English, Sinhala & Tamil",
    description: "The AI-driven standard for Sri Lankan merchants. Generate invoices via natural language.",
    siteName: "Axiora QuoteEngine",
    images: [
      {
        url: "/og-image.png", // Ensure you place an OG image in your public folder
        width: 1200,
        height: 630,
        alt: "Axiora QuoteEngine Interface Preview",
      },
    ],
  },

  // Twitter SEO
  twitter: {
    card: "summary_large_image",
    title: "Axiora QuoteEngine | Trilingual Invoicing",
    description: "Generate professional quotes in seconds with AI.",
    images: ["/og-image.png"],
  },

  // Multilingual & Subdomain Mapping (AIEO/AEO)
  alternates: {
    canonical: "https://quote.axioralabs.com",
    languages: {
      "en-LK": "https://quote.axioralabs.com",
      "si-LK": "https://quote.axioralabs.com/si",
      "ta-LK": "https://quote.axioralabs.com/ta",
    },
  },

  // Search Engine Robot Control
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Verification for Google Search Console */}
        <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
      </head>
      <body className={`${inter.className} antialiased selection:bg-[#00B3B3] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}