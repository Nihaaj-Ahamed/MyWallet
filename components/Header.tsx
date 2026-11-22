'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import { Moon, Sun, LogIn, UserCircle } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
}

export default function Header({ theme, setTheme }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

  return (
    <header className="no-print sticky top-0 z-35 top-bar-container">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2623] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <img src="/logo.png" alt="MyWallet Logo" className="h-7 w-7 object-contain" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight text-charcoal dark:text-[#E0E0E0] uppercase flex items-center gap-1.5">
              MyWallet
            </h1>
            <p className="text-[10px] text-sage font-medium">High-End Liquid Wealth & Commute Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {authChecked && (
            user ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-charcoal dark:text-[#E0E0E0] max-w-[140px] truncate">{displayName}</span>
                  <span className="text-[10px] text-sage max-w-[140px] truncate">{user.email}</span>
                </div>
                <Link
                  href="/profile"
                  title="Open Profile"
                  className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white dark:bg-[#1B2623] border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all active:scale-95 cursor-pointer text-charcoal dark:text-[#E0E0E0] hover:text-rose-500 dark:hover:text-rose-400"
                >
                  <UserCircle className="h-5 w-5" strokeWidth={1.75} />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="flex items-center gap-1.5 px-5 py-2.5 min-h-[44px] rounded-full bg-charcoal text-white text-xs font-bold transition-all active:scale-95 shadow-sm hover:bg-charcoal-light"
                >
                  <LogIn className="h-3.5 w-3.5" strokeWidth={2} />
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="hidden sm:flex items-center justify-center px-5 py-2.5 min-h-[44px] rounded-full bg-white dark:bg-[#1B2623] border border-slate-200/50 dark:border-slate-700/50 text-charcoal dark:text-[#E0E0E0] text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  Sign Up
                </Link>
              </>
            )
          )}

          <button
            type="button"
            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
            className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white dark:bg-[#1B2623] border border-slate-200/50 dark:border-slate-700/50 shadow-sm transition-all active:scale-95 cursor-pointer text-charcoal dark:text-[#E0E0E0]"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <Sun className="h-5 w-5 text-amber-400" strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
