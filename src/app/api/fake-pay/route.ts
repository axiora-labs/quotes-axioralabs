import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Setup Supabase Client
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // 2. Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // 3. Parse Request Body
    const body = await request.json();
    const { amount, billingCycle, packageName } = body;

    if (!amount || !packageName) {
      return NextResponse.json(
        { error: 'Invalid payment data.' },
        { status: 400 }
      );
    }

    // 4. Perform Database Updates (The "Purchase")
    
    // A. Record the Payment (For Admin Revenue View)
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: 'LKR',
        status: 'completed',
        package_type: packageName, // e.g., 'Axiora Pro Monthly'
        payment_method: 'card', // Simulated
        transaction_id: `tx_fake_${Date.now()}_${Math.random().toString(36).substring(7)}`
      });

    if (paymentError) {
      console.error('Payment Insert Error:', paymentError);
      return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 });
    }

    // B. Upgrade the User Profile (Unlock Features)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_paid_member: true,
        tier: 'pro',
        business_type: 'Enterprise' // Optional: upgrades their label
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile Upgrade Error:', profileError);
      return NextResponse.json({ error: 'Payment recorded, but profile update failed.' }, { status: 500 });
    }

    // C. (Optional) Log to Credit Logs
    await supabase.from('credit_logs').insert({
      user_id: user.id,
      action_type: 'purchase',
      amount: billingCycle === 'yearly' ? 50000 : 5000, // Example credit bonus
      description: `Upgraded to ${packageName}`,
      ip_address: 'System'
    });

    // 5. Success Response
    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}