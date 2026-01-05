import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabase as adminSupabase } from "@/lib/supabase";

// Initialize Gemini (Standard Fast Model)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Force dynamic to prevent caching usage counts
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

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // --- 1. IDENTIFY CONTEXT (User vs Guest) ---
    const ip = getClientIp(req);
    const today = new Date().toISOString().split('T')[0];
    const authHeader = req.headers.get('Authorization');
    
    let user = null;
    let limit = 2; // Default Guest Limit

    // Attempt to verify User
    if (authHeader) {
      const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data } = await authClient.auth.getUser();
      user = data.user;
    }

    // --- 2. CHECK LIMITS ---
    if (user) {
      // Fetch Profile for Tier
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('is_paid_member, tier')
        .eq('id', user.id)
        .single();
      
      // Determine Limit
      limit = (profile?.is_paid_member || profile?.tier === 'pro') ? 500 : 10;

      // Check User Usage
      const { data: usage } = await adminSupabase
        .from('ai_usage')
        .select('count')
        .eq('user_id', user.id)
        .eq('usage_date', today)
        .maybeSingle();
      
      if ((usage?.count || 0) >= limit) {
        return NextResponse.json(
          { error: `Daily limit of ${limit} reached. Upgrade for more.` }, 
          { status: 403 }
        );
      }
    } else {
      // Check Guest Usage (IP Based, user_id IS NULL)
      const { data: usage } = await adminSupabase
        .from('ai_usage')
        .select('count')
        .is('user_id', null)
        .eq('ip_address', ip)
        .eq('usage_date', today)
        .maybeSingle();

      if ((usage?.count || 0) >= limit) {
        return NextResponse.json(
          { error: "Guest limit reached (2/2). Please sign up for free." }, 
          { status: 403 }
        );
      }
    }

    // --- 3. AI GENERATION (Gemini 2.5 Flash) ---
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const instruction = `
      You are an AI Invoice Assistant for a Sri Lankan business software called "Axiora".
      Your job is to parse natural language (including Singlish, English, Tamil-English) into structured Invoice JSON.

      USER INPUT: "${prompt}"

      STRICT RULES:
      1. Detect "INVOICE" or "QUOTATION". Default: INVOICE.
      2. Extract items: "5 Cement 2400" -> { desc: "Cement", qty: 5, price: 2400 }.
      3. Translate terms: "Simenti" -> "Cement", "Weli" -> "Sand".
      4. Detect Client Details (Name, Phone, Address).
      5. Extract Notes/Delivery instructions.

      OUTPUT JSON STRUCTURE:
      {
        "items": [
          { "desc": "String", "qty": Number, "price": Number }
        ],
        "client": { 
          "name": "String | null", 
          "phone": "String | null",
          "address": "String | null" 
        },
        "sender": {
           "name": "String | null",
           "phone": "String | null"
        },
        "docType": "INVOICE" | "QUOTATION",
        "notes": "String | null"
      }
    `;

    const result = await model.generateContent(instruction);
    const responseText = result.response.text();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error("AI JSON Parse Error:", responseText);
      return NextResponse.json({ error: "AI produced invalid JSON" }, { status: 500 });
    }

    // --- 4. DEDUCT CREDIT (DB UPDATE) ---
    // We explicitly look up the record again to ensure we increment the correct one
    let query = adminSupabase.from('ai_usage').select('id, count');

    if (user) {
      query = query.eq('user_id', user.id).eq('usage_date', today);
    } else {
      query = query.is('user_id', null).eq('ip_address', ip).eq('usage_date', today);
    }

    const { data: existingRow } = await query.maybeSingle();

    if (existingRow) {
      await adminSupabase
        .from('ai_usage')
        .update({ count: existingRow.count + 1 })
        .eq('id', existingRow.id);
    } else {
      await adminSupabase.from('ai_usage').insert({ 
        user_id: user ? user.id : null,
        ip_address: ip, 
        usage_date: today, 
        count: 1 
      });
    }

    // Log to audit trail
    await adminSupabase.from('credit_logs').insert({
       user_id: user ? user.id : null,
       ip_address: ip,
       action_type: 'usage',
       amount: -1,
       description: user ? 'AI Generation (Member)' : 'AI Generation (Guest)'
    });

    return NextResponse.json(parsedData);

  } catch (error) {
    console.error("AI Route Critical Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}