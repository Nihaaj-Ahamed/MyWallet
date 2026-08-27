import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
  }

  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/sign-in', requestUrl.origin));
}
