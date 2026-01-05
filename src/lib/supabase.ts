import { createBrowserClient } from '@supabase/ssr';

// This creates a client for the browser (Login, Signup, etc.)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);