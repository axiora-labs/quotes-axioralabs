import { supabase } from '@/lib/supabase';
import { FileText, Users, Star, Calendar } from 'lucide-react';

export default async function StatsBar() {
  let invoiceCount = 0;
  
  try {
    // Fetch the total count of invoices from your database
    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count !== null) {
      invoiceCount = count;
    }
  } catch (e) {
    console.error("Failed to fetch stats:", e);
  }

  // Format the number (e.g., 12400 -> 12,400+)
  const formattedCount = invoiceCount > 0 ? `${invoiceCount.toLocaleString()}+` : '0';

  return (
    <section className="border-y border-slate-200 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Invoices Generated', value: formattedCount, icon: FileText },
          { label: 'Active Users', value: '100+', icon: Users },
          { label: 'GitHub Stars', value: '2', icon: Star },
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
  );
}