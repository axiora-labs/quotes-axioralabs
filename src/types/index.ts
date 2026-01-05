// ==========================================
// 1. CORE FINANCIAL TYPES
// ==========================================

export type AmountType = 'FIXED' | 'PERCENTAGE';

export interface InvoiceItem {
  id: number;
  desc: string;
  qty: number;
  price: number;
  discount: number;
  discountType: AmountType; // New: Determines if discount is e.g. 500 LKR or 10%
}

export interface ExtraFee {
  id: string;
  label: string; // e.g. "VAT", "Shipping", "Service Charge"
  value: number;
  type: AmountType;
}

// ==========================================
// 2. SETTINGS & ENTITIES
// ==========================================

export interface InvoiceSettings {
  currency: string; // e.g. "LKR", "USD"
  color: string;    // Hex code, e.g. "#005F99"
  docType: 'INVOICE' | 'QUOTATION';
  
  // Legacy fields (optional, kept for backward compatibility if needed)
  taxLabel?: string; 
  taxRate?: number;
  ssclRate?: number;
}

export interface BusinessDetails {
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string; // New: For displaying the logo in the Editor and PDF
}

export interface ClientDetails {
  name: string;
  address: string;
  phone: string;
}

// ==========================================
// 3. AGGREGATE DATA (For PDF & Saving)
// ==========================================

export interface InvoiceData {
  // Entities
  items: InvoiceItem[];
  extraFees: ExtraFee[]; // Dynamic array of taxes/fees/shipping
  settings: InvoiceSettings;
  sender: BusinessDetails;
  client: ClientDetails;

  // Metadata
  invoiceNo: string;
  date: string;       // YYYY-MM-DD
  dueDate: string;    // YYYY-MM-DD (or "Valid Until" for Quotes)
  notes: string;
  terms: string;

  // Calculations
  subtotal: number;
  globalDiscount: number;
  globalDiscountType: AmountType; // Bill-level discount type
  grandTotal: number;
  
  // Optional Legacy fields for PDF generator fallback
  ssclAmount?: number;
  taxAmount?: number;
}

// ==========================================
// 4. AI & API TYPES
// ==========================================

export interface AiResponseItem {
  desc: string;
  qty?: number;
  price?: number;
}

export interface AiApiResponse {
  items?: AiResponseItem[];
  client?: Partial<ClientDetails>;
  sender?: Partial<BusinessDetails>;
  docType?: 'INVOICE' | 'QUOTATION';
  notes?: string;
  error?: string;
}

export interface IpData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
}

// ==========================================
// 5. DATABASE TYPES (Supabase)
// ==========================================

export interface UserProfile {
  id: string;
  business_name: string | null;
  phone: string | null;
  role: 'user' | 'admin';
  email?: string;
  address?: string;
  logo_url?: string;
  created_at?: string;
}

export interface Lead {
  id: number;
  whatsapp_number: string;
  location: string | null;
  business_category: string | null;
  generated_at: string;
}

export interface AiUsage {
  id: number;
  ip_address: string;
  usage_date: string;
  count: number;
}

// ==========================================
// 6. UTILITY & LOCALIZATION
// ==========================================

export interface Dictionary {
  title: string;
  magicPlaceholder: string;
  generate: string;
  desc: string;
  qty: string;
  price: string;
  total: string;
  discount: string;
  grandTotal: string;
  download: string;
  loginPrompt: string;
  adLabel: string;
  leadTitle: string;
  leadDesc: string;
}

export interface UserStats {
  ai_credits_used: number;
  ai_credit_limit: number;
  quotations_used: number;
  quotation_limit: number;
  is_paid_member: boolean;
}