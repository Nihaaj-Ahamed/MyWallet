'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import FABModal from '../components/FABModal';
import { Transaction } from '../supabase-types';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  MapPin, 
  Landmark, 
  Printer, 
  RefreshCw, 
  User, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Info,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  FileText,
  TrendingDown,
  CheckCircle,
  Pencil,
  Plus,
  Minus,
  Check,
  Edit3,
  X,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function Dashboard() {
  const {
    activeCycle,
    transactions,
    debts,
    savings,
    historicalMonths,
    loading,
    netWorth,
    bankMoney,
    handMoney,
    savingMoney,
    optionMoney,
    updateWalletBalance,
    addExpense,
    addIncome,
    addWithdrawal,
    incrementCommute,
    decrementCommute,
    settleDebt,
    depositToSavings,
    closeActiveCycleAndSweep,
    updateActiveCycleIncome,
    editTransaction,
    deleteTransaction
  } = useWallet();

  // Active view tab state (for mobile viewport tab rendering)
  const [activeMobileTab, setActiveMobileTab] = useState<number>(1); // Default to Today Ledger (Tab 2)

  // Local interaction states
  const [settlingDebtId, setSettlingDebtId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  
  const [sweepingBankId, setSweepingBankId] = useState<string | null>(null);
  const [sweepAmount, setSweepAmount] = useState('');

  // 10-Day Cycle closing simulation state
  const [showCloseoutModal, setShowCloseoutModal] = useState(false);
  const [closeoutSweepAmount, setCloseoutSweepAmount] = useState('');
  const [closeoutSweepBank, setCloseoutSweepBank] = useState('');
  const [nextCycleIncomeInput, setNextCycleIncomeInput] = useState('120000');

  // Expanded monthly accordion states (stores expanded status per monthYear string)
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({
    'June 2026': true,
    'May 2026': false,
    'April 2026': false
  });

  // Statement PDF printing state
  const [printStatementMonth, setPrintStatementMonth] = useState<string | null>(null);

  // 4 Wallets Edit Mode state
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editingWalletValue, setEditingWalletValue] = useState('');

  // Active Cycle Income Edit Mode state
  const [editingCycleIncome, setEditingCycleIncome] = useState(false);
  const [cycleIncomeValue, setCycleIncomeValue] = useState('');

  // Active Cycle Daily spent accordions expand/collapse state
  const [expandedCycleDates, setExpandedCycleDates] = useState<{ [key: string]: boolean }>({});
  const toggleCycleDate = (date: string) => {
    setExpandedCycleDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  // Expanded monthly date timeline accordion state
  const [expandedMonthlyDates, setExpandedMonthlyDates] = useState<{ [key: string]: boolean }>({});

  // Accent multi-theme switcher state
  const [theme, setTheme] = useState<'champagne' | 'emerald' | 'crimson'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vault_theme');
      return (saved as 'champagne' | 'emerald' | 'crimson') || 'champagne';
    }
    return 'champagne';
  });

  useEffect(() => {
    localStorage.setItem('vault_theme', theme);
  }, [theme]);

  // Privacy blurring state (default to true / blurred)
  const [isBlurred, setIsBlurred] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vault_blurred');
      return saved === null ? true : saved === 'true';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('vault_blurred', isBlurred ? 'true' : 'false');
  }, [isBlurred]);

  // Helper to format date in user's local YYYY-MM-DD
  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to convert Month Year label (e.g. "June 2026") to prefix "2026-06"
  const getPrefixFromMonthLabel = (label: string) => {
    const parts = label.split(' ');
    if (parts.length !== 2) return '';
    const [monthName, yearStr] = parts;
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.indexOf(monthName);
    if (monthIndex === -1) return '';
    const monthStr = String(monthIndex + 1).padStart(2, '0');
    return `${yearStr}-${monthStr}`;
  };

  const handleDeleteTransaction = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction? This will reverse its financial impact on the respective wallet.")) {
      await deleteTransaction(id);
    }
  };

  interface FixedOutflow {
    id: string;
    title: string;
    amount: number;
    status: string;
  }

  // Fixed Outflows Local State (Synchronized to LocalStorage)
  const [outflows, setOutflows] = useState<FixedOutflow[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vault_fixed_outflows');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: 'rent', title: 'Room Rent', amount: 45000, status: 'Pending' },
      { id: 'elec', title: 'Electricity Bill', amount: 8200, status: 'Pending' }
    ];
  });

  // Save fixed outflows to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vault_fixed_outflows', JSON.stringify(outflows));
    }
  }, [outflows]);

  // Transaction Edit Modal state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSource, setEditSource] = useState<'hand' | 'bank'>('hand');

  // Filter transactions for continuous calendar month view
  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
  const activeTransactions = transactions.filter(t => t.date && t.date.startsWith(currentMonthStr));
  const colomboCommuteCount = activeTransactions.filter(t => t.category === 'Travel (Colombo)').length;
  const homeCommuteCount = activeTransactions.filter(t => t.category === 'Travel (Home)').length;

  // Filter transactions for specific 10-day active cycle
  const cycleTransactions = activeCycle 
    ? transactions.filter(t => t.cycle_id === activeCycle.id)
    : [];
  const cycleBaseIncome = activeCycle?.income || 0;
  const cycleExtraIncome = cycleTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCycleIncome = cycleBaseIncome + cycleExtraIncome;

  const cycleExpenses = cycleTransactions
    .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const remainingCycleBalance = totalCycleIncome - cycleExpenses;

  // Active month total income (base + extra incomes)
  const activeMonthIncome = activeTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Toggle monthly accordions
  const toggleMonth = (monthName: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthName]: !prev[monthName]
    }));
  };

  // Trigger wallet override
  const handleStartEditWallet = (id: string, currentVal: number) => {
    setEditingWalletId(id);
    setEditingWalletValue(currentVal.toString());
  };

  const handleSaveWalletOverride = async (id: string) => {
    const val = parseFloat(editingWalletValue);
    if (!isNaN(val)) {
      await updateWalletBalance(id, val);
    }
    setEditingWalletId(null);
  };

  // Stepper adjustments for Option Money
  const handleStepOptionMoney = async (dir: 'inc' | 'dec') => {
    const step = 1000;
    const newVal = dir === 'inc' ? optionMoney + step : optionMoney - step;
    await updateWalletBalance('wallet-option', newVal);
  };

  const handleStartEditCycleIncome = () => {
    if (activeCycle) {
      setCycleIncomeValue(activeCycle.income.toString());
      setEditingCycleIncome(true);
    }
  };

  const handleSaveCycleIncome = async () => {
    const val = parseFloat(cycleIncomeValue);
    if (!isNaN(val) && val >= 0) {
      await updateActiveCycleIncome(val);
    }
    setEditingCycleIncome(false);
  };

  // Outflow direct text editing
  const handleUpdateOutflow = (id: string, field: 'title' | 'amount', value: string) => {
    setOutflows(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          [field]: field === 'amount' ? parseFloat(value) || 0 : value
        };
      }
      return o;
    }));
  };

  const handleToggleOutflowStatus = (id: string) => {
    setOutflows(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: o.status === 'Paid' ? 'Pending' : 'Paid'
        };
      }
      return o;
    }));
  };

  // Start editing transaction modal
  const handleStartEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setEditAmount(Math.abs(t.amount).toString());
    
    // Parse payment source from description prefix
    const isBank = t.description.startsWith('[Bank]');
    setEditSource(isBank ? 'bank' : 'hand');

    let cleanDesc = t.description;
    if (cleanDesc.startsWith('[Bank]')) cleanDesc = cleanDesc.replace('[Bank]', '').trim();
    if (cleanDesc.startsWith('[Hand]')) cleanDesc = cleanDesc.replace('[Hand]', '').trim();
    setEditDescription(cleanDesc);
    setEditCategory(t.category);
  };

  const handleSaveTransactionEdit = async () => {
    if (!editingTransaction) return;
    const numAmt = parseFloat(editAmount);
    if (isNaN(numAmt) || numAmt <= 0) return;

    await editTransaction(
      editingTransaction.id,
      numAmt,
      editDescription,
      editCategory,
      editSource
    );
    setEditingTransaction(null);
  };

  // Grouping transactions by Date Timeline
  const groupTransactionsByDate = (transList: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};
    
    const sorted = [...transList].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    sorted.forEach(t => {
      let displayDate = t.date;
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (t.date === todayStr) {
        displayDate = `Today — ${t.date.split('-').reverse().join('/')}`;
      } else if (t.date === yesterdayStr) {
        displayDate = `Yesterday — ${t.date.split('-').reverse().join('/')}`;
      } else {
        displayDate = t.date.split('-').reverse().join('/');
      }

      if (!groups[displayDate]) {
        groups[displayDate] = [];
      }
      groups[displayDate].push(t);
    });

    return groups;
  };

  const calculateDailyTotal = (transList: Transaction[]) => {
    return transList
      .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  // Settle debt handler
  const handleSettleDebt = async (debtId: string) => {
    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) return;
    await settleDebt(debtId, amt);
    setSettlingDebtId(null);
    setSettleAmount('');
  };

  // Sweep handler
  const handleSweepSavings = async (bankId: string) => {
    const amt = parseFloat(sweepAmount);
    if (isNaN(amt) || amt <= 0) return;
    if (amt > handMoney) {
      alert("Insufficient Hand Money balance for savings deposit sweep.");
      return;
    }
    await depositToSavings(bankId, amt);
    setSweepingBankId(null);
    setSweepAmount('');
  };

  // Close cycle simulation modal trigger
  const handleTriggerCloseoutSimulator = () => {
    setCloseoutSweepAmount(Math.max(0, handMoney).toFixed(0));
    setCloseoutSweepBank(savings.find(s => s.id !== 'wallet-bank' && s.id !== 'wallet-hand' && s.id !== 'wallet-option')?.id || 's-1');
    setShowCloseoutModal(true);
  };

  // Confirm closeout sweep
  const handleConfirmCloseout = async () => {
    const sweepAmt = parseFloat(closeoutSweepAmount);
    const nextIncome = parseFloat(nextCycleIncomeInput);
    if (isNaN(nextIncome) || nextIncome <= 0) {
      alert("Please specify a valid income for the next cycle.");
      return;
    }

    const nextStart = new Date();
    const nextEnd = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const nextStartStr = nextStart.toISOString().split('T')[0];
    const nextEndStr = nextEnd.toISOString().split('T')[0];

    await closeActiveCycleAndSweep(
      isNaN(sweepAmt) ? 0 : sweepAmt,
      closeoutSweepBank,
      nextIncome,
      nextStartStr,
      nextEndStr
    );

    setShowCloseoutModal(false);
  };

  // Printing triggers
  const handlePrintMonthlyStatement = (monthName: string) => {
    setPrintStatementMonth(monthName);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.print();
      }
    }, 100);
  };

  // Touch Swipe Gesture State Handlers
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeMobileTab < 3) {
      setActiveMobileTab(prev => prev + 1);
    }
    if (isRightSwipe && activeMobileTab > 0) {
      setActiveMobileTab(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-obsidian text-champagne">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-champagne/10 border border-champagne/20 text-champagne shadow-gold-glow animate-pulse">
            <img src="/logo.png" alt="MyWallet Logo" className="h-10 w-10 object-contain" />
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-muted" />
            <span className="font-mono text-[10px] tracking-widest uppercase text-slate-muted">Syncing Aura Ledger...</span>
          </div>
        </div>
      </div>
    );
  }

  // Active grouped timeline transactions
  const groupedTimeline = groupTransactionsByDate(activeTransactions);

  return (
    <main className={`min-h-screen bg-obsidian text-slate-muted pb-24 print:pb-0 theme-${theme}`}>
      
      {/* HEADER NAVIGATION */}
      <header className="no-print sticky top-0 z-35 bg-obsidian/95 backdrop-blur-md border-b border-slate-border/50 px-4 py-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-champagne/10 border border-champagne/30 text-champagne shadow-gold-glow overflow-hidden">
              <img src="/logo.png" alt="MyWallet Logo" className="h-6 w-6 object-contain" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
                MyWallet<span className="text-[9px] bg-champagne/15 text-champagne border border-champagne/30 px-2 py-0.5 rounded font-mono">NIHAAJ_AHAMED MS</span>
              </h1>
              <p className="text-[10px] text-slate-muted">High-End Liquid Wealth & Commute Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Compact Accent Theme Cycle Button */}
            <button
              type="button"
              onClick={() => {
                const nextTheme = theme === 'champagne' ? 'emerald' : theme === 'emerald' ? 'crimson' : 'champagne';
                setTheme(nextTheme);
              }}
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg bg-obsidian-light/80 border border-slate-border/50 transition-all active:scale-95"
              title={`Active Accent: ${theme.charAt(0).toUpperCase() + theme.slice(1)}. Tap to change.`}
            >
              <div 
                className="w-3.5 h-3.5 rounded-full transition-all duration-300 ring-2 ring-white/20"
                style={{
                  backgroundColor: theme === 'champagne' ? '#D4AF37' : theme === 'emerald' ? '#00E676' : '#FF5252'
                }}
              />
            </button>

            {/* Shutter Eye Privacy Toggle */}
            <button
              type="button"
              onClick={() => setIsBlurred(prev => !prev)}
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg bg-obsidian-light/80 border border-slate-border/50 text-slate-muted active:text-white transition-all active:scale-95"
              title={isBlurred ? "Show monetary values" : "Blur monetary values"}
            >
              {isBlurred ? <EyeOff className="h-5 w-5 text-champagne" /> : <Eye className="h-5 w-5 text-slate-muted" />}
            </button>
          </div>
        </div>

        {/* Persistent Tab Switcher (Mobile Tab Switcher) */}
        <nav className="lg:hidden flex border border-slate-border/30 p-1 bg-obsidian-light/50 rounded-lg">
          {[
            { id: 0, label: 'Vault & Trust', icon: Landmark },
            { id: 1, label: 'Today Ledger', icon: Calendar },
            { id: 2, label: '10-Day Cycles', icon: Sparkles },
            { id: 3, label: 'Monthly History', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeMobileTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMobileTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center min-h-[44px] py-2 rounded-md text-[9px] font-medium transition-all active:scale-95 ${
                  isActive
                    ? 'bg-champagne/15 text-champagne border border-champagne/30 font-bold'
                    : 'text-slate-muted active:text-white'
                }`}
              >
                <Icon className="h-4 w-4 mb-0.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* COMBINATION NET WORTH PANEL */}
      <div className="no-print max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <section className="glass-panel relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-surface/90 to-obsidian-light p-6 md:p-8 text-center border border-slate-border">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-champagne/10 blur-[90px] rounded-full pointer-events-none" />
          
          <p className="text-xs uppercase tracking-widest text-slate-muted font-bold flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-champagne" /> Combined Net Worth <Sparkles className="h-3.5 w-3.5 text-champagne" />
          </p>
          
          <h2 className={`mt-2 text-4xl md:text-5xl font-mono font-bold tracking-tight text-champagne text-gold-glow transition-all duration-300 ${isBlurred ? 'privacy-blur' : ''}`}>
            Rs. {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
        </section>
      </div>

      {/* 4 QUADRANT WALLET ARCHITECTURE (CORE LIQUIDITY BLOCKS) */}
      <div className="no-print max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. BANK MONEY */}
          <div className="glass-panel bg-slate-surface/40 p-4 rounded-xl border border-slate-border/50 flex flex-col justify-between relative group active:border-champagne/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-muted">Bank Money</span>
              <Landmark className="h-4 w-4 text-champagne" />
            </div>
            
            {editingWalletId === 'wallet-bank' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-obsidian/60 border border-champagne/40 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('wallet-bank')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('wallet-bank')} className="bg-champagne p-1 rounded text-obsidian">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-bank', bankMoney)}
                  className={`text-lg md:text-xl font-mono font-bold text-white tracking-tight cursor-pointer active:text-champagne transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {bankMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-bank', bankMoney)}
                  className="p-2 text-slate-muted active:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-[9px] text-slate-muted mt-1 leading-none">Auto-updates on Incomes & Bank Expenses</p>
          </div>

          {/* 2. LIQUID / HAND MONEY */}
          <div className="glass-panel bg-slate-surface/40 p-4 rounded-xl border border-slate-border/50 flex flex-col justify-between relative group active:border-champagne/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-muted">Hand Money</span>
              <Coins className="h-4 w-4 text-champagne" />
            </div>
            
            {editingWalletId === 'wallet-hand' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-obsidian/60 border border-champagne/40 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('wallet-hand')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('wallet-hand')} className="bg-champagne p-1 rounded text-obsidian">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-hand', handMoney)}
                  className={`text-lg md:text-xl font-mono font-bold text-white tracking-tight cursor-pointer active:text-champagne transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {handMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-hand', handMoney)}
                  className="p-2 text-slate-muted active:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-[9px] text-slate-muted mt-1 leading-none">Primary cash wallet for daily hand expenses</p>
          </div>

          {/* 3. SAVING MONEY */}
          <div className="glass-panel bg-slate-surface/40 p-4 rounded-xl border border-slate-border/50 flex flex-col justify-between relative group active:border-champagne/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-muted">Saving Money</span>
              <Wallet className="h-4 w-4 text-champagne" />
            </div>
            
            {editingWalletId === 'wallet-savings' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-obsidian/60 border border-champagne/40 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('s-1')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('s-1')} className="bg-champagne p-1 rounded text-obsidian">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-savings', savingMoney)}
                  className={`text-lg md:text-xl font-mono font-bold text-white tracking-tight cursor-pointer active:text-champagne transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {savingMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-savings', savingMoney)}
                  className="p-2 text-slate-muted active:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-[9px] text-slate-muted mt-1 leading-none">Accumulated vaults swept from cycles</p>
          </div>

          {/* 4. OPTION MONEY */}
          <div className="glass-panel bg-slate-surface/40 p-4 rounded-xl border border-slate-border/50 flex flex-col justify-between relative group active:border-champagne/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-muted">Option Money</span>
              <div className="flex gap-1.5 items-center">
                <button 
                  type="button"
                  onClick={() => handleStepOptionMoney('dec')}
                  className="bg-obsidian border border-slate-border/30 h-11 w-11 min-h-[44px] min-w-[44px] rounded flex items-center justify-center text-slate-muted active:text-white active:scale-95"
                  title="Subtract Rs. 1,000"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button 
                  type="button"
                  onClick={() => handleStepOptionMoney('inc')}
                  className="bg-obsidian border border-slate-border/30 h-11 w-11 min-h-[44px] min-w-[44px] rounded flex items-center justify-center text-slate-muted active:text-white active:scale-95"
                  title="Add Rs. 1,000"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {editingWalletId === 'wallet-option' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-obsidian/60 border border-champagne/40 rounded px-2 py-1 text-sm font-mono text-white focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('wallet-option')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('wallet-option')} className="bg-champagne p-1 rounded text-obsidian">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-option', optionMoney)}
                  className={`text-lg md:text-xl font-mono font-bold text-white tracking-tight cursor-pointer active:text-champagne transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {optionMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-option', optionMoney)}
                  className="p-2 text-slate-muted active:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-[9px] text-slate-muted mt-1 leading-none">Independent steerable ledger balance</p>
          </div>

        </div>
      </div>

      {/* MOBILE SWIPABLE VIEWPORTS */}
      <div 
        className="no-print max-w-7xl mx-auto px-4 md:px-8 mt-6 lg:hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {activeMobileTab === 0 && (
            <motion.div
              key="tab-vault"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {renderVaultAndTrust()}
            </motion.div>
          )}

          {activeMobileTab === 1 && (
            <motion.div
              key="tab-today"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {renderTodayLedger()}
            </motion.div>
          )}

          {activeMobileTab === 2 && (
            <motion.div
              key="tab-cycle"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {renderCycles()}
            </motion.div>
          )}

          {activeMobileTab === 3 && (
            <motion.div
              key="tab-history"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {renderHistory()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP 3-COLUMN BENTO GRID VIEW */}
      <div className="no-print max-w-7xl mx-auto px-8 mt-8 hidden lg:grid grid-cols-3 gap-6 items-start">
        {/* COLUMN 1: TAB 1 [THE VAULT & TRUST] */}
        <div className="space-y-6">
          {renderVaultAndTrust()}
        </div>

        {/* COLUMN 2: TAB 2 [TODAY LEDGER] */}
        <div className="space-y-6">
          {renderTodayLedger()}
        </div>

        {/* COLUMN 3: TAB 3 [10-DAY CYCLES] & TAB 4 [MONTHLY HISTORY] */}
        <div className="space-y-6">
          {renderCycles()}
          {renderHistory()}
        </div>
      </div>

      {/* Sleek Footnote Author Attribution */}
      <footer className="no-print w-full text-center py-6 mt-8 border-t border-slate-border/10">
        <p className="text-[10px] uppercase tracking-widest text-slate-muted font-mono flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>AURA LEDGER ENGINE</span>
          <span className="h-1 w-1 rounded-full bg-slate-border/60 hidden sm:inline" />
          <span>ARCHITECTED BY <span className="text-champagne font-bold">NIHAAJ AHAMED MS</span></span>
        </p>
      </footer>

      {/* SIGNATURE FLOATING ACTION BUTTON */}
      <FABModal />

      {/* TRANSACTION EDIT MODAL */}
      <AnimatePresence>
        {editingTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTransaction(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-slate-surface border border-champagne/30 rounded-2xl overflow-hidden shadow-2xl p-6 text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-border/50 pb-3">
                <h3 className="font-bold text-sm text-champagne uppercase flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4" /> Edit Transaction
                </h3>
                <button 
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="p-2.5 text-slate-muted active:text-white transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Payment Source</label>
                  <div className="flex border border-slate-border/50 rounded-lg p-0.5 bg-obsidian/30">
                    <button
                      type="button"
                      onClick={() => setEditSource('hand')}
                      className={`flex-1 py-3 text-xs font-semibold rounded transition-all min-h-[44px] active:scale-95 ${
                        editSource === 'hand'
                          ? 'bg-champagne text-obsidian font-bold shadow'
                          : 'text-slate-muted active:text-white'
                      }`}
                    >
                      Hand Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSource('bank')}
                      className={`flex-1 py-3 text-xs font-semibold rounded transition-all min-h-[44px] active:scale-95 ${
                        editSource === 'bank'
                          ? 'bg-champagne text-obsidian font-bold shadow'
                          : 'text-slate-muted active:text-white'
                      }`}
                    >
                      Bank Money
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Amount (Rs.)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm focus:border-champagne"
                  >
                    <option value="Food" className="bg-slate-surface">Food</option>
                    <option value="Travel (Colombo)" className="bg-slate-surface">Travel (Colombo)</option>
                    <option value="Travel (Home)" className="bg-slate-surface">Travel (Home)</option>
                    <option value="Rent" className="bg-slate-surface">Rent</option>
                    <option value="Electricity" className="bg-slate-surface">Electricity</option>
                    <option value="General" className="bg-slate-surface">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 border border-slate-border py-3.5 rounded-lg text-xs font-semibold text-slate-muted active:text-white active:bg-white/5 transition-all active:scale-95 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTransactionEdit}
                  className="flex-1 bg-champagne py-3.5 rounded-lg text-xs font-bold text-obsidian shadow-gold-glow transition-all active:scale-95 min-h-[44px]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CLOSEOUT CYCLES POPUP SIMULATOR MODAL */}
      <AnimatePresence>
        {showCloseoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCloseoutModal(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-md bg-slate-surface border border-champagne/30 rounded-2xl overflow-hidden shadow-2xl p-6 text-white space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-border/50 pb-3">
                <h3 className="font-bold text-lg text-champagne uppercase flex items-center gap-1.5">
                  <Sparkles className="h-5 w-5 text-champagne" /> Closeout Summary
                </h3>
              </div>

              <div className="space-y-2.5 text-sm bg-obsidian/50 p-4 rounded-lg border border-slate-border/30">
                <div className="flex justify-between">
                  <span className="text-slate-muted">Starting Budget:</span>
                  <span className="font-mono font-medium">Rs. {totalCycleIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">Total Period Expenses:</span>
                  <span className="font-mono text-crimson font-medium">-Rs. {cycleExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-border/30 pt-2 font-semibold">
                  <span className="text-slate-muted">Remaining Balance:</span>
                  <span className="font-mono text-champagne">Rs. {remainingCycleBalance.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-xs text-slate-muted leading-relaxed">
                  Sweep remaining cycle liquid funds to Zurich Gold or another Savings goal vault:
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-muted block">Select Savings Bank Goal</label>
                  <select
                    value={closeoutSweepBank}
                    onChange={(e) => setCloseoutSweepBank(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2.5 text-xs text-white"
                  >
                    {savings
                      .filter(s => s.id !== 'wallet-bank' && s.id !== 'wallet-hand' && s.id !== 'wallet-option')
                      .map(s => (
                        <option key={s.id} value={s.id} className="bg-slate-surface">{s.name} (Bal: Rs. {s.current_balance.toLocaleString()})</option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-muted block">Editable Sweep Amount (Rs.)</label>
                  <input
                    type="number"
                    value={closeoutSweepAmount}
                    onChange={(e) => setCloseoutSweepAmount(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2.5 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5 border-t border-slate-border/30 pt-3">
                  <label className="text-[10px] uppercase text-slate-muted block">Next 10-Day Cycle Starting Income (Rs.)</label>
                  <input
                    type="number"
                    value={nextCycleIncomeInput}
                    onChange={(e) => setNextCycleIncomeInput(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCloseoutModal(false)}
                  className="flex-1 border border-slate-border py-3.5 rounded-lg text-xs font-semibold text-slate-muted active:text-white active:bg-white/5 transition-all active:scale-95 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCloseout}
                  className="flex-1 bg-champagne py-3.5 rounded-lg text-xs font-bold text-obsidian shadow-gold-glow transition-all active:scale-95 min-h-[44px]"
                >
                  Approve & Deposit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT-ONLY BANK STATEMENT LAYOUT */}
      {printStatementMonth && (() => {
        const printPrefix = getPrefixFromMonthLabel(printStatementMonth);
        const printTransactions = transactions.filter(t => t.date && t.date.startsWith(printPrefix));
        
        const printIncome = printTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const printExpenses = printTransactions
          .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const printSweeps = printTransactions
          .filter(t => t.category === 'Savings Sweep')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const foodExpenses = printTransactions
          .filter(t => t.type === 'expense' && t.category === 'Food')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const travelExpenses = printTransactions
          .filter(t => t.type === 'expense' && t.category.includes('Travel'))
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const rentUtilityExpenses = printTransactions
          .filter(t => t.type === 'expense' && ['Rent', 'Electricity'].includes(t.category))
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const generalExpenses = printTransactions
          .filter(t => t.type === 'expense' && t.category === 'General')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return (
          <div className="hidden print:block text-black p-8 bg-white border-2 border-black max-w-4xl mx-auto space-y-6 h-full font-serif">
            <div className="border-b border-black pb-4 text-center">
              <h1 className="text-3xl font-bold uppercase tracking-widest font-serif"> VAULT OFFICIAL AUDIT STATEMENT</h1>
              <p className="text-xs uppercase font-mono text-gray-500 mt-1">Official Asset Ledger & Capital Position</p>
              <p className="text-xs font-mono mt-0.5">STATEMENT FOR RECORD: {printStatementMonth.toUpperCase()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="border border-black p-4 space-y-2">
                <h2 className="text-sm font-bold uppercase border-b border-black pb-1">Historical Month Summary</h2>
                <div className="flex justify-between text-xs font-mono">
                  <span>Opening Inflows:</span>
                  <span>Rs. {printIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span>Period Expenses Logged:</span>
                  <span>Rs. {printExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span>Deposited to Savings:</span>THE
                  <span>Rs. {printSweeps.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono border-t border-black pt-1 font-bold">
                  <span>Net Ledger Balance:</span>
                  <span>Rs. {(printIncome - printExpenses - printSweeps).toLocaleString()}</span>
                </div>
              </div>

              <div className="border border-black p-4 space-y-2">
                <h2 className="text-sm font-bold uppercase border-b border-black pb-1">Categories Outlay</h2>
                <div className="flex justify-between text-xs font-mono">
                  <span>Food & Groceries:</span>
                  <span>Rs. {foodExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span>Commutes & Highway:</span>
                  <span>Rs. {travelExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span>Rent & Utility Bills:</span>
                  <span>Rs. {rentUtilityExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span>General & Other:</span>
                  <span>Rs. {generalExpenses.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border border-black p-4 space-y-2">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1">Transactions Record</h2>
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-black text-left">
                    <th className="pb-1">Date</th>
                    <th className="pb-1">Category</th>
                    <th className="pb-1">Description</th>
                    <th className="pb-1 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {printTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center italic text-gray-500">No transactions recorded for this period.</td>
                    </tr>
                  ) : (
                    printTransactions.map(t => (
                      <tr key={t.id} className="border-b border-gray-200">
                        <td className="py-1">{t.date}</td>
                        <td className="py-1">{t.category}</td>
                        <td className="py-1">{t.description}</td>
                        <td className="py-1 text-right">{t.amount > 0 ? '+' : '-'}Rs. {Math.abs(t.amount).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-12 border-t border-black flex justify-between text-[11px] font-mono text-gray-500">
              <span>Security ID Reference: VAULT-OFFICIAL-{printStatementMonth.replace(' ', '-').toUpperCase()}</span>
              <span>Ledger Officer Sign: __________________________</span>
            </div>
          </div>
        );
      })()}

    </main>
  );

  // TAB 1 RENDER: THE VAULT & TRUST
  function renderVaultAndTrust() {
    return (
      <div className="glass-panel rounded-xl bg-slate-surface/40 border border-slate-border p-5 space-y-5">
        
        {/* Glowing Master Vault block */}
        <div className="text-center bg-obsidian-light/60 p-5 rounded-xl border border-slate-border/30 relative">
          <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] uppercase tracking-wider text-champagne bg-champagne/10 border border-champagne/20 px-2 py-0.5 rounded">
            <Landmark className="h-3 w-3" /> Master Vaults
          </div>
          <span className="text-[10px] uppercase text-slate-muted block font-semibold">Total Savings</span>
          <span className="font-mono text-2xl md:text-3xl text-white font-bold text-gold-glow mt-1 block">
            Rs. {savingMoney.toLocaleString()}
          </span>
        </div>

        {/* Fixed Outflows */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase text-slate-muted font-bold tracking-wider">Fixed Outflows</h4>
          <div className="grid grid-cols-1 gap-3">
            
            {outflows.map((outflow) => {
              const isPaid = outflow.status === 'Paid';
              return (
                <div key={outflow.id} className="bg-obsidian/30 p-3 rounded-lg border border-slate-border/20 flex justify-between items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={outflow.title}
                      onChange={(e) => handleUpdateOutflow(outflow.id, 'title', e.target.value)}
                      className="bg-transparent border-none text-slate-muted text-[10px] block font-medium w-full focus:outline-none active:bg-white/5 rounded focus:bg-obsidian/60 px-1 py-0.5"
                    />
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs text-white font-semibold font-mono">Rs.</span>
                      <input
                        type="number"
                        value={outflow.amount}
                        onChange={(e) => handleUpdateOutflow(outflow.id, 'amount', e.target.value)}
                        className="bg-transparent border-none text-xs text-white font-semibold font-mono w-24 focus:outline-none active:bg-white/5 rounded focus:bg-obsidian/60 px-1"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleToggleOutflowStatus(outflow.id)}
                    className={`text-[9px] uppercase font-mono px-3 rounded border transition-all duration-300 min-h-[44px] min-w-[50px] flex items-center justify-center active:scale-95 ${
                      isPaid 
                        ? 'bg-emerald/10 text-emerald border-emerald/30' 
                        : 'bg-amber/10 text-amber border-amber/30 active:bg-emerald/5 active:text-emerald active:border-emerald/20'
                    }`}
                  >
                    {outflow.status}
                  </button>
                </div>
              );
            })}

          </div>
        </div>

        {/* Trust Ledger */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase text-slate-muted font-bold tracking-wider">Trust Ledger</h4>
          <div className="space-y-2">
            {debts.length === 0 ? (
              <p className="text-xs text-slate-muted italic text-center py-2">No trust ledgers active</p>
            ) : (
              debts.map((d) => {
                const isLent = d.amount > 0;
                return (
                  <div key={d.id} className="bg-obsidian/30 p-3 rounded-lg border border-slate-border/20 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">{d.person_name}</span>
                      <span className={`font-mono text-xs font-semibold ${isLent ? 'text-emerald' : 'text-crimson'}`}>
                        {isLent ? '+' : '-'}Rs. {Math.abs(d.amount).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[9px]">
                      <span className={isLent ? 'text-emerald' : 'text-crimson'}>
                        {isLent ? 'Lent (Receivable)' : 'Borrowed (Payable)'}
                      </span>
                      
                      {settlingDebtId === d.id ? (
                        <div className="flex items-center gap-1 bg-obsidian rounded border border-slate-border/30 p-0.5">
                          <input
                            type="number"
                            placeholder="Amt"
                            value={settleAmount}
                            onChange={(e) => setSettleAmount(e.target.value)}
                            className="w-14 bg-transparent text-[9px] text-white focus:outline-none px-0.5"
                          />
                          <button
                            onClick={() => handleSettleDebt(d.id)}
                            className="bg-champagne text-obsidian text-[9px] font-bold px-3.5 rounded min-h-[44px] flex items-center justify-center active:scale-95"
                          >
                            Pay
                          </button>
                          <button
                            onClick={() => setSettlingDebtId(null)}
                            className="text-slate-muted text-[10px] min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSettlingDebtId(d.id);
                            setSettleAmount(Math.abs(d.amount).toString());
                          }}
                          className="text-[9px] uppercase font-bold text-champagne active:underline transition-all min-h-[44px] px-3.5 flex items-center justify-center active:scale-95"
                        >
                          Settle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    );
  }

  // TAB 2 RENDER: TODAY LEDGER (Timeline)
  function renderTodayLedger() {
    const todayStr = getLocalDateString();
    const todayTransactions = transactions.filter(t => t.date && t.date >= todayStr);
    const groupedTimelineToday = groupTransactionsByDate(todayTransactions);

    return (
      <div className="glass-panel rounded-xl bg-slate-surface/40 border border-slate-border p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-white">Today Ledger</h3>
          <span className="text-[10px] text-slate-muted font-mono bg-obsidian px-2 py-0.5 rounded border border-slate-border/40">
            Archived Daily Streams
          </span>
        </div>

        {/* Date Grouped Timeline container */}
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {todayTransactions.length === 0 ? (
            <p className="text-xs text-slate-muted italic text-center py-8">No ledger entries logged today</p>
          ) : (
            Object.entries(groupedTimelineToday).map(([dateStr, items]) => {
              const dailyTotal = calculateDailyTotal(items);
              return (
                <div key={dateStr} className="space-y-2">
                  {/* Daily Subheader */}
                  <div className="flex justify-between items-center bg-obsidian-light/30 px-3 py-1.5 rounded border-l-2 border-champagne text-xs font-semibold">
                    <span className="text-white">{dateStr}</span>
                    <span className="font-mono text-slate-muted">Total spent: Rs. {dailyTotal.toLocaleString()}</span>
                  </div>

                  {/* Transactions listed under day */}
                  <div className="space-y-1.5 pl-1.5">
                    {items.map(t => {
                      const isExpense = t.type === 'expense';
                      const isCommute = t.category.includes('Travel');
                      const isBank = t.description.startsWith('[Bank]');
                      
                      // Remove prefix to clean rendering description
                      let descClean = t.description;
                      if (descClean.startsWith('[Bank]')) descClean = descClean.replace('[Bank]', '').trim();
                      if (descClean.startsWith('[Hand]')) descClean = descClean.replace('[Hand]', '').trim();

                      return (
                        <div 
                          key={t.id} 
                          className="flex justify-between items-center p-2.5 rounded bg-obsidian/10 border border-slate-border/20 hover:border-champagne/10 transition-colors group/item"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-1">
                              <span className={`text-[7px] uppercase font-mono px-1 py-0.2 rounded font-bold ${
                                isBank 
                                  ? 'border border-blue-500/40 text-blue-400 bg-blue-500/5' 
                                  : 'border border-amber-500/40 text-amber-400 bg-amber-500/5'
                              }`}>
                                {isBank ? 'Bank' : 'Hand'}
                              </span>
                              <span className={`text-[8px] uppercase font-mono px-1 py-0.5 rounded ${
                                isCommute 
                                  ? t.category.includes('Colombo') 
                                    ? 'border border-champagne/40 text-champagne bg-champagne/5 font-semibold'
                                    : 'border border-crimson/40 text-crimson bg-crimson/5 font-semibold'
                                  : 'bg-slate-surface text-slate-muted'
                              }`}>
                                {t.category}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-white mt-1">{descClean}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-xs font-semibold ${isExpense ? 'text-crimson' : 'text-emerald'}`}>
                              {isExpense ? '-' : '+'}Rs. {Math.abs(t.amount).toLocaleString()}
                            </span>
                            
                            <button
                              onClick={() => handleStartEditTransaction(t)}
                              className="p-2 text-slate-muted active:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                              title="Edit transaction parameters"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-2 text-slate-muted active:text-crimson transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                              title="Delete transaction"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // TAB 3 RENDER: 10-DAY CYCLES
  function renderCycles() {
    const expensePercent = totalCycleIncome > 0 ? (cycleExpenses / totalCycleIncome) * 100 : 0;

    // Group active cycle transactions by date
    const groupedCycleTransactions = cycleTransactions.reduce((acc: { [key: string]: Transaction[] }, t) => {
      if (!t.date) return acc;
      if (!acc[t.date]) acc[t.date] = [];
      acc[t.date].push(t);
      return acc;
    }, {});

    // Sort dates chronologically newest first
    const sortedCycleDates = Object.keys(groupedCycleTransactions).sort((a, b) => b.localeCompare(a));

    const calculateDailySpent = (items: Transaction[]) => {
      return items
        .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    };

    return (
      <div className="glass-panel rounded-xl bg-slate-surface/40 border border-slate-border p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-bold">10-Day Cycles</h3>
          {activeCycle && (
            <span className="text-[10px] font-mono text-champagne bg-champagne/10 border border-champagne/20 px-2 py-0.5 rounded">
              Active Sprint
            </span>
          )}
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3 bg-obsidian/30 p-4 rounded-lg border border-slate-border/20">
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="bg-obsidian/40 p-2 rounded relative group/income">
              <span className="text-slate-muted block font-medium">Base Income</span>
              {editingCycleIncome ? (
                <div className="flex items-center gap-1 mt-0.5 justify-center">
                  <input
                    type="number"
                    value={cycleIncomeValue}
                    onChange={(e) => setCycleIncomeValue(e.target.value)}
                    className="bg-obsidian/60 border border-champagne/40 rounded px-1 py-0.5 text-xs font-mono text-white text-center focus:outline-none w-20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCycleIncome()}
                    onBlur={handleSaveCycleIncome}
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleSaveCycleIncome}
                    className="bg-champagne p-1.5 rounded text-obsidian active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span 
                    onDoubleClick={handleStartEditCycleIncome}
                    className="font-mono text-xs text-white font-semibold cursor-pointer active:text-champagne transition-colors"
                    title="Double click to edit Base Income"
                  >
                    Rs. {cycleBaseIncome.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEditCycleIncome}
                    className="p-1.5 text-slate-muted active:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                    title="Edit Base Income"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
            <div className="bg-obsidian/40 p-2 rounded">
              <span className="text-slate-muted block font-medium">Total Spent</span>
              <span className="font-mono text-xs text-crimson font-semibold mt-0.5 block">Rs. {cycleExpenses.toLocaleString()}</span>
            </div>
            <div className="bg-obsidian/40 p-2 rounded">
              <span className="text-slate-muted block font-medium">Remaining</span>
              <span className="font-mono text-xs text-champagne font-semibold mt-0.5 block">Rs. {remainingCycleBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-slate-muted">
              <span>Sprint Budget Exhaustion</span>
              <span>{expensePercent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-obsidian rounded-full overflow-hidden border border-slate-border/30">
              <div 
                className="h-full bg-gradient-to-r from-crimson to-champagne transition-all duration-500" 
                style={{ width: `${Math.min(expensePercent, 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Dynamic Daily Spent Accordions */}
        <div className="space-y-2 mt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-muted font-semibold">Daily Spent Ledger</h4>
          {sortedCycleDates.length === 0 ? (
            <p className="text-xs text-slate-muted italic text-center py-4 bg-obsidian/20 rounded">No transactions logged in this cycle</p>
          ) : (
            <div className="space-y-2">
              {sortedCycleDates.map(dateStr => {
                const items = groupedCycleTransactions[dateStr];
                const dailySpent = calculateDailySpent(items);
                const isExpanded = !!expandedCycleDates[dateStr];
                
                // Format date string for display (e.g., YYYY-MM-DD to DD/MM/YYYY)
                const parts = dateStr.split('-');
                const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;

                return (
                  <div key={dateStr} className="border border-slate-border/20 rounded-lg overflow-hidden bg-obsidian/20">
                    {/* Date Row Header */}
                    <button
                      type="button"
                      onClick={() => toggleCycleDate(dateStr)}
                      className="w-full flex justify-between items-center min-h-[44px] px-4 py-3 text-xs font-semibold active:bg-slate-surface/20 transition-all text-white active:scale-95"
                    >
                      <span className="font-mono">{displayDate}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-muted">Total Spent Rs. {dailySpent.toLocaleString()}</span>
                        <ChevronDown className={`h-4 w-4 text-slate-muted transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {/* Expandable Panel */}
                    {isExpanded && (
                      <div className="border-t border-slate-border/20 p-2.5 space-y-2 bg-obsidian-light/10">
                        {items.map(t => {
                          const isExpense = t.type === 'expense';
                          const isBank = t.description.startsWith('[Bank]');
                          
                          let descClean = t.description;
                          if (descClean.startsWith('[Bank]')) descClean = descClean.replace('[Bank]', '').trim();
                          if (descClean.startsWith('[Hand]')) descClean = descClean.replace('[Hand]', '').trim();

                          return (
                            <div key={t.id} className="flex justify-between items-center p-2 rounded bg-obsidian/30 border border-slate-border/10 text-xs">
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] uppercase font-mono px-1 py-0.2 rounded font-bold ${
                                    isBank 
                                      ? 'border border-blue-500/40 text-blue-400 bg-blue-500/5' 
                                      : 'border border-amber-500/40 text-amber-400 bg-amber-500/5'
                                  }`}>
                                    {isBank ? 'Bank' : 'Hand'}
                                  </span>
                                  <span className="text-[9px] text-slate-muted font-semibold">{t.category}</span>
                                </div>
                                <p className="text-white mt-1 font-medium">{descClean}</p>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className={`font-mono font-semibold ${isExpense ? 'text-crimson' : 'text-emerald'}`}>
                                  {isExpense ? '-' : '+'}Rs. {Math.abs(t.amount).toLocaleString()}
                                </span>
                                
                                <button
                                  onClick={() => handleStartEditTransaction(t)}
                                  className="p-2 text-slate-muted active:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                                  title="Edit transaction"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteTransaction(t.id)}
                                  className="p-2 text-slate-muted active:text-crimson transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Closeout Simulation Trigger */}
        <div className="bg-gradient-to-r from-champagne/10 to-transparent p-4 rounded-lg border border-champagne/20 space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-champagne" />
            <span className="text-xs font-semibold text-white">End-of-Cycle Pop-up Simulator</span>
          </div>
          <p className="text-[10px] text-slate-muted leading-relaxed">
            Trigger a 10th-day cycle rollover. Sweeps remaining liquid cash (Hand Money) to savings goals and creates a new cycle period.
          </p>
          <button
            type="button"
            onClick={handleTriggerCloseoutSimulator}
            className="w-full bg-champagne py-3.5 rounded text-xs font-bold text-obsidian shadow-gold-glow transition-all active:scale-95 min-h-[44px]"
          >
            Simulate End of Cycle
          </button>
        </div>

      </div>
    );
  }

  // TAB 4 RENDER: MONTHLY HISTORY (Accordions)
  function renderHistory() {
    // Dynamically calculate the last 3 calendar months relative to today
    const getLastThreeMonths = () => {
      const list = [];
      const today = new Date();
      for (let i = 0; i < 3; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); // e.g. "June 2026"
        const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // e.g. "2026-06"
        list.push({ label, prefix });
      }
      return list;
    };

    const lastThreeMonths = getLastThreeMonths();
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
      <div className="glass-panel rounded-xl bg-slate-surface/40 border border-slate-border p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold tracking-wider uppercase text-white font-bold">Monthly History</h3>
          <span className="text-[10px] text-slate-muted font-mono bg-obsidian px-2 py-0.5 rounded border border-slate-border/40">
            Archined Ledgers
          </span>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {lastThreeMonths.map(({ label, prefix }) => {
            const isCurrentMonth = label === todayLabel;
            return renderMonthAccordion(label, prefix, isCurrentMonth);
          })}
        </div>
      </div>
    );
  }

  function renderMonthAccordion(
    monthName: string,
    monthPrefix: string,
    isCurrentMonth: boolean
  ) {
    const isExpanded = expandedMonths[monthName] || false;
    
    // Filter transactions for this specific calendar month
    const monthTransactions = transactions.filter(t => t.date && t.date.startsWith(monthPrefix));
    
    const monthIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthSweeps = monthTransactions
      .filter(t => t.category === 'Savings Sweep')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Premium spending outlay categories
    const foodExpenses = monthTransactions
      .filter(t => t.type === 'expense' && t.category === 'Food')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const travelExpenses = monthTransactions
      .filter(t => t.type === 'expense' && t.category.includes('Travel'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const rentUtilityExpenses = monthTransactions
      .filter(t => t.type === 'expense' && ['Rent', 'Electricity'].includes(t.category))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const generalExpenses = monthTransactions
      .filter(t => t.type === 'expense' && t.category === 'General')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Group month transactions by date
    const groupedByDate = monthTransactions.reduce((acc: { [key: string]: Transaction[] }, t) => {
      if (!t.date) return acc;
      if (!acc[t.date]) acc[t.date] = [];
      acc[t.date].push(t);
      return acc;
    }, {});

    const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

    const formatCurrency = (val: number) => {
      return `Rs. ${val.toLocaleString()}`;
    };

    return (
      <div key={monthName} className="bg-obsidian/30 rounded-lg border border-slate-border/20 overflow-hidden transition-all duration-300">
        
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => toggleMonth(monthName)}
          className="w-full flex items-center justify-between min-h-[44px] px-4 py-3 text-xs font-semibold text-white active:bg-white/5 transition-all active:scale-95"
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-champagne" />
            <span>{monthName}</span>
            {isCurrentMonth && (
              <span className="text-[8px] uppercase tracking-wider bg-emerald/10 text-emerald border border-emerald/20 px-1.5 py-0.2 rounded ml-1 font-mono">
                Active
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-muted" /> : <ChevronDown className="h-4 w-4 text-slate-muted" />}
        </button>

        {/* Accordion Body */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-border/10 space-y-4 text-xs bg-obsidian-light/20">
            
            {/* Top metrics summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-obsidian/50 p-2 rounded">
                <span className="text-[9px] text-slate-muted block">Total Income</span>
                <span className="font-mono text-white font-bold block mt-0.5">{formatCurrency(monthIncome)}</span>
              </div>
              <div className="bg-obsidian/50 p-2 rounded">
                <span className="text-[9px] text-slate-muted block">Total Spent</span>
                <span className="font-mono text-crimson font-bold block mt-0.5">{formatCurrency(monthExpenses)}</span>
              </div>
              <div className="bg-obsidian/50 p-2 rounded">
                <span className="text-[9px] text-slate-muted block">Saved Sweeps</span>
                <span className="font-mono text-emerald font-bold block mt-0.5">{formatCurrency(monthSweeps)}</span>
              </div>
            </div>

            {/* Spending Outlay */}
            <div className="space-y-2 pt-2 border-t border-slate-border/15">
              <span className="text-[9px] uppercase tracking-wider text-slate-muted font-bold block">Spending Outlay</span>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-obsidian/40 p-2.5 rounded border border-slate-border/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-muted font-medium">Food & Groceries</span>
                  <span className="font-mono text-xs font-semibold text-white mt-1 font-bold">{formatCurrency(foodExpenses)}</span>
                </div>
                <div className="bg-obsidian/40 p-2.5 rounded border border-slate-border/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-muted font-medium">Commutes & Highway</span>
                  <span className="font-mono text-xs font-semibold text-white mt-1 font-bold">{formatCurrency(travelExpenses)}</span>
                </div>
                <div className="bg-obsidian/40 p-2.5 rounded border border-slate-border/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-muted font-medium">Rent & Utility Bills</span>
                  <span className="font-mono text-xs font-semibold text-white mt-1 font-bold">{formatCurrency(rentUtilityExpenses)}</span>
                </div>
                <div className="bg-obsidian/40 p-2.5 rounded border border-slate-border/10 flex flex-col justify-between">
                  <span className="text-[10px] text-slate-muted font-medium">General / Subscriptions</span>
                  <span className="font-mono text-xs font-semibold text-white mt-1 font-bold">{formatCurrency(generalExpenses)}</span>
                </div>
              </div>
            </div>

            {/* DIRECT DATE TIMELINE ACCORDION */}
            <div className="space-y-2 pt-3 border-t border-slate-border/15">
              <span className="text-[9px] uppercase tracking-wider text-slate-muted font-bold block font-semibold">Date Timeline</span>
              
              {sortedDates.length === 0 ? (
                <p className="text-xs text-slate-muted italic text-center py-2">No transactions recorded</p>
              ) : (
                <div className="space-y-1.5">
                  {sortedDates.map(dateStr => {
                    const dayItems = groupedByDate[dateStr];
                    const dateKey = `${monthName}-${dateStr}`;
                    const isDateExpanded = !!expandedMonthlyDates[dateKey];
                    const daySpent = dayItems
                      .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep')
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    
                    const dateParts = dateStr.split('-');
                    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateStr;

                    return (
                      <div key={dateStr} className="border border-slate-border/10 rounded overflow-hidden bg-obsidian/20">
                        <button
                          type="button"
                          onClick={() => setExpandedMonthlyDates(prev => ({ ...prev, [dateKey]: !isDateExpanded }))}
                          className="w-full flex justify-between items-center min-h-[44px] px-3 py-2.5 text-[10px] active:bg-slate-surface/20 transition-all text-white font-medium active:scale-95"
                        >
                          <span className="font-mono">{formattedDate}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-slate-muted">Spent: {formatCurrency(daySpent)}</span>
                            <ChevronDown className={`h-3 w-3 text-slate-muted transition-transform duration-200 ${isDateExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {isDateExpanded && (
                          <div className="border-t border-slate-border/10 p-2 space-y-1.5 bg-obsidian-light/5">
                            {dayItems.map(t => {
                              const isExpense = t.type === 'expense';
                              const isBank = t.description.startsWith('[Bank]');
                              const sourceLabel = isBank ? 'Bank Money' : 'Hand Money';
                              
                              let descClean = t.description;
                              if (descClean.startsWith('[Bank]')) descClean = descClean.replace('[Bank]', '').trim();
                              if (descClean.startsWith('[Hand]')) descClean = descClean.replace('[Hand]', '').trim();

                              return (
                                <div key={t.id} className="flex justify-between items-center p-1.5 rounded bg-obsidian/30 border border-slate-border/5 text-[10px]">
                                  <div className="min-w-0 pr-2">
                                    <div className="flex items-center gap-1">
                                      <span className={`text-[7px] uppercase font-mono px-1 py-0.2 rounded font-bold ${
                                        isBank 
                                          ? 'border border-blue-500/40 text-blue-400 bg-blue-500/5' 
                                          : 'border border-amber-500/40 text-amber-400 bg-amber-500/5'
                                      }`}>
                                        {sourceLabel}
                                      </span>
                                      <span className="text-[8px] text-slate-muted font-semibold">{t.category}</span>
                                    </div>
                                    <p className="text-white mt-0.5 font-medium">{descClean}</p>
                                  </div>
                                  <span className={`font-mono font-semibold ${isExpense ? 'text-crimson' : 'text-emerald'}`}>
                                    {isExpense ? '-' : '+'}{formatCurrency(Math.abs(t.amount))}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Print statement button */}
            <button
              onClick={() => handlePrintMonthlyStatement(monthName)}
              className="w-full bg-slate-surface active:bg-white/5 border border-slate-border/60 min-h-[44px] rounded text-xs font-semibold text-champagne flex items-center justify-center gap-1.5 transition-all mt-2 active:scale-95"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Download Statement PDF</span>
            </button>

          </div>
        )}

      </div>
    );
  }
}
