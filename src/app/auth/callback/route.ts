import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 1. FORCE DYNAMIC: Prevents Next.js from caching this route (Critical for Auth)
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // Default to dashboard, but allow 'next' param to override
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
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

    // 2. EXCHANGE CODE: Turns the temporary code into a persistent Session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // 3. SUCCESS: Redirect to Dashboard
      // We use NextResponse.redirect to ensure cookies are written to the browser
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      // Log the actual error to your terminal for debugging
      console.error("Auth Callback Error:", error.message);
    }
  }

  // 4. FAILURE: Redirect back to Auth with error
  return NextResponse.redirect(`${origin}/auth?error=auth-code-error`);
}