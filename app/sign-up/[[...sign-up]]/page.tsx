'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserPlus, Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (!isSupabaseConfigured() || !supabase) {
      setError('Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.');
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.replace('/');
    } else {
      setNotice('Account created! Check your email to confirm your address, then sign in.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal text-white dark:bg-[#1B2623] dark:text-[#4DB6AC] shadow-sm overflow-hidden">
              <img src="/logo.png" alt="MyWallet Logo" className="h-8 w-8 object-contain" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-charcoal dark:text-[#E0E0E0] tracking-tight">Create your account</h1>
          <p className="text-sage mt-2 text-sm">Start tracking your finances with MyWallet</p>
        </div>

        <div className="rounded-3xl border border-slate-200/60 dark:border-slate-700/50 bg-white/80 dark:bg-[#1B2623]/80 p-6 shadow-soft backdrop-blur-xl">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" strokeWidth={2} />
              <span>{notice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-[11px] font-bold uppercase tracking-wider text-sage mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1916] px-4 py-3 text-sm font-medium text-charcoal dark:text-[#E0E0E0] placeholder:text-sage/60 outline-none focus:border-charcoal dark:focus:border-[#4DB6AC] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-sage mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1916] px-4 py-3 text-sm font-medium text-charcoal dark:text-[#E0E0E0] placeholder:text-sage/60 outline-none focus:border-charcoal dark:focus:border-[#4DB6AC] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-sage mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1916] px-4 py-3 text-sm font-medium text-charcoal dark:text-[#E0E0E0] placeholder:text-sage/60 outline-none focus:border-charcoal dark:focus:border-[#4DB6AC] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-[11px] font-bold uppercase tracking-wider text-sage mb-1.5">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1916] px-4 py-3 text-sm font-medium text-charcoal dark:text-[#E0E0E0] placeholder:text-sage/60 outline-none focus:border-charcoal dark:focus:border-[#4DB6AC] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-charcoal hover:bg-charcoal-light disabled:opacity-60 text-white px-6 py-3 text-sm font-bold transition-all active:scale-[0.98] shadow-lg mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
              ) : (
                <UserPlus className="h-4 w-4" strokeWidth={2} />
              )}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-sage mt-6">
          Already have an account?{' '}
          <Link href="/sign-in" className="font-bold text-charcoal dark:text-[#4DB6AC] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
