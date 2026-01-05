import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase as adminSupabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

/**
 * HELPER: Extract IP address reliably
 */
function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    const authHeader = req.headers.get('Authorization');
    let user = null;

    if (authHeader) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    const today = new Date().toISOString().split('T')[0];
    let limit = 2; 
    let isPaid = false;
    let usageCount = 0;

    if (user) {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('is_paid_member')
        .eq('id', user.id)
        .single();
      
      if (profile?.is_paid_member) {
        limit = 500;
        isPaid = true;
      } else {
        limit = 10;
      }

      const { data: usage } = await adminSupabase
        .from('ai_usage')
        .select('count')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .maybeSingle();
      
      usageCount = usage?.count || 0;
    } else {
      // GUEST FLOW: Must check for NULL user_id to avoid matching accidental guest-to-user conversions
      const { data: usage } = await adminSupabase
        .from('ai_usage')
        .select('count')
        .is('user_id', null)
        .eq('ip_address', ip)
        .eq('usage_date', today)
        .maybeSingle();
      
      usageCount = usage?.count || 0;
    }

    const remaining = Math.max(0, limit - usageCount);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hoursLeft = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minsLeft = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    return NextResponse.json({ 
      credits: remaining, 
      total_limit: limit, 
      used: usageCount,
      is_guest: !user,
      is_paid: isPaid,
      ip_tracked: ip, 
      reset_in: `${hoursLeft}h ${minsLeft}m`
    });

  } catch (e) {
    console.error("AI Check GET Failed:", e);
    return NextResponse.json({ credits: 0, error: "System Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const today = new Date().toISOString().split('T')[0];
    const authHeader = req.headers.get('Authorization');
    let user = null;

    if (authHeader) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    // 1. DEDUCTION LOGIC
    // We use a specific query to find the record to increment
    let usageQuery = adminSupabase.from('ai_usage').select('id, count');
    
    if (user) {
      usageQuery = usageQuery.eq('user_id', user.id).eq('usage_date', today);
    } else {
      usageQuery = usageQuery.is('user_id', null).eq('ip_address', ip).eq('usage_date', today);
    }

    const { data: existingUsage } = await usageQuery.maybeSingle();

    if (existingUsage) {
      // Increment existing
      const { error: updateError } = await adminSupabase
        .from('ai_usage')
        .update({ count: existingUsage.count + 1 })
        .eq('id', existingUsage.id);
        
      if (updateError) throw updateError;
    } else {
      // Create new record for today
      const { error: insertError } = await adminSupabase
        .from('ai_usage')
        .insert({ 
          user_id: user ? user.id : null, 
          ip_address: ip, 
          usage_date: today, 
          count: 1 
        });
        
      if (insertError) throw insertError;
    }

    // 2. AUDIT LOGGING
    await adminSupabase.from('credit_logs').insert({
       user_id: user ? user.id : null,
       ip_address: ip,
       action_type: 'usage',
       amount: -1,
       description: user ? `User Gen: ${user.email}` : `Guest Gen: ${ip}`
    });

    return NextResponse.json({ success: true });

  } catch (e) {
    console.error("AI Check POST Failed:", e);
    return NextResponse.json({ success: false, error: "Failed to deduct credit" }, { status: 500 });
  }
}