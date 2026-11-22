'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  Moon,
  Sun,
  UserRound,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('vault_theme');
    const nextTheme = savedTheme === 'dark' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'dark');
    document.documentElement.classList.add(`theme-${nextTheme}`);
    if (nextTheme === 'dark') document.documentElement.classList.add('dark');

    if (!supabase) {
      router.replace('/sign-in');
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace('/sign-in');
        return;
      }
      setUser(data.session.user);
      setFullName(data.session.user.user_metadata?.full_name || '');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/sign-in');
      else {
        setUser(session.user);
        setFullName(session.user.user_metadata?.full_name || '');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('vault_theme', nextTheme);
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'dark');
    document.documentElement.classList.add(`theme-${nextTheme}`);
    if (nextTheme === 'dark') document.documentElement.classList.add('dark');
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setError(null);
    setNotice(null);
    setSavingProfile(true);
    const { error: updateError } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim() },
    });
    setSavingProfile(false);
    if (updateError) setError(updateError.message);
    else setNotice('Profile details updated.');
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !user?.email) return;
    setError(null);
    setNotice(null);
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!currentPassword) {
      setError('Enter your current password.');
      return;
    }
    setSavingPassword(true);
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthError) {
      setSavingPassword(false);
      setError('The current password is incorrect.');
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (updateError) setError(updateError.message);
    else {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Password changed successfully.');
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace('/sign-in');
  };

  const initials = (fullName || user?.email || 'U')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  if (!isSupabaseConfigured() || !supabase) {
    return (
      <main className="min-h-screen px-4 py-10 flex items-center justify-center">
        <div className="glass-panel max-w-md p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
          <h1 className="mt-3 text-xl font-bold">Profile unavailable</h1>
          <p className="mt-2 text-sm text-sage">Configure Supabase to enable account features.</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen px-4 py-6 md:px-8 theme-${theme}`}>
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-sage hover:text-charcoal dark:hover:text-[#E0E0E0]">
          <ArrowLeft className="h-4 w-4" />
          Back to wallet
        </Link>

        <section className="glass-panel mt-5 overflow-hidden">
          <div className="hero-card flex items-center gap-4 p-6 md:p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 text-xl font-extrabold text-charcoal shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest opacity-60">Your account</p>
              <h1 className="mt-1 truncate text-2xl font-extrabold">{fullName || 'MyWallet User'}</h1>
              <p className="mt-1 truncate text-sm opacity-70">{user?.email}</p>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
            {error}
          </div>
        )}
        {notice && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-none" />
            {notice}
          </div>
        )}

        <section className="glass-panel mt-4 p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <UserRound className="h-5 w-5" />
            Profile details
          </h2>
          <form onSubmit={saveProfile} className="mt-5 space-y-4">
            <div>
              <label htmlFor="profile-name" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">Full name</label>
              <input id="profile-name" value={fullName} onChange={(event) => setFullName(event.target.value)} required className="glass-input w-full px-4 py-3 text-sm font-semibold" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">Email address</label>
              <div className="glass-input flex items-center gap-2 px-4 py-3 text-sm font-semibold opacity-70">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>
            </div>
            <button type="submit" disabled={savingProfile} className="pill-button-primary flex min-h-[44px] items-center gap-2 px-5 py-3 text-sm">
              {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
              Save profile
            </button>
          </form>
        </section>

        <section className="glass-panel mt-4 p-5 md:p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold">
            <KeyRound className="h-5 w-5" />
            Change password
          </h2>
          <form onSubmit={changePassword} className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="current-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">Current password</label>
              <input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" className="glass-input w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">New password</label>
              <input id="new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="glass-input w-full px-4 py-3 text-sm" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-sage">Confirm password</label>
              <input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} autoComplete="new-password" className="glass-input w-full px-4 py-3 text-sm" />
            </div>
            <button type="submit" disabled={savingPassword} className="pill-button-primary flex min-h-[44px] items-center gap-2 px-5 py-3 text-sm md:col-start-1">
              {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              Update password
            </button>
          </form>
        </section>

        <section className="glass-panel mt-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-extrabold">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                Appearance
              </h2>
              <p className="mt-1 text-sm text-sage">Currently using {theme} mode</p>
            </div>
            <button type="button" onClick={toggleTheme} className="glass-panel !rounded-full min-h-[44px] px-5 text-sm font-bold">
              Switch to {theme === 'light' ? 'dark' : 'light'}
            </button>
          </div>
        </section>

        <button type="button" onClick={signOut} className="mt-4 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-rose-200 px-5 py-3 text-sm font-bold text-rose-600 transition active:scale-[0.98] dark:border-rose-500/20 dark:text-rose-400">
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </main>
  );
}
