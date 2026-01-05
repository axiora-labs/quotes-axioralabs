import { Dictionary } from "../types";

export const dictionary: Record<string, Dictionary> = {
  en: {
    title: "Axiora QuoteEngine",
    magicPlaceholder: "e.g. 10 bags of cement at 2400 and 5 pipes...",
    generate: "Generate Magic Quote",
    desc: "Description",
    qty: "Qty",
    price: "Price",
    total: "Total",
    discount: "Discount",
    grandTotal: "Grand Total",
    download: "Download PDF",
    loginPrompt: "Login to save your Business Logo",
    adLabel: "Sponsored",
    leadTitle: "Final Step!",
    leadDesc: "Enter your WhatsApp number to unlock the download.",
  },
  si: {
    title: "Axiora QuoteEngine",
    magicPlaceholder: "උදා: සිමෙන්ති කොට්ට 10ක් 2400 බැගින්...",
    generate: "මැජික් මිල ගණන් සාදන්න",
    desc: "විස්තරය",
    qty: "ප්‍රමාණය",
    price: "මිල (රු)",
    total: "එකතුව",
    discount: "වට්ටම්",
    grandTotal: "මුළු එකතුව",
    download: "PDF බාගත කරන්න",
    loginPrompt: "ලෝගෝව සුරැකීමට ඇතුළු වන්න",
    adLabel: "දැන්වීම්",
    leadTitle: "අවසාන පියවර!",
    leadDesc: "බාගත කිරීම සඳහා ඔබේ WhatsApp අංකය ඇතුලත් කරන්න.",
  },
  ta: {
    title: "Axiora QuoteEngine",
    magicPlaceholder: "உதாரணம்: 10 சிமெண்ட் மூட்டைகள் 2400 வீதம்...",
    generate: "மேஜிக் மேற்கோளை உருவாக்குங்கள்",
    desc: "விளக்கம்",
    qty: "அளவு",
    price: "விலை",
    total: "மொத்தம்",
    discount: "தள்ளுபடி",
    grandTotal: "பெரு மொத்தம்",
    download: "PDF பதிவிறக்கவும்",
    loginPrompt: "லோகோ சேமிக்க உள்நுழையவும்",
    adLabel: "விளம்பரம்",
    leadTitle: "கடைசி படி!",
    leadDesc: "பதிவிறக்க உங்கள் WhatsApp எண்ணை உள்ளிடவும்.",
  }
};

export type Language = 'en' | 'si' | 'ta';