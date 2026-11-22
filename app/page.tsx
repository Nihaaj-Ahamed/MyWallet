'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../context/WalletContext';
import FABModal from '../components/FABModal';
import Header from '../components/Header';
import { supabase } from '../lib/supabase';
import { Transaction, Debt } from '../supabase-types';
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
  EyeOff,
  Coffee,
  Car,
  Home,
  Zap,
  ShoppingBag,
  CreditCard,
  Building2
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
    deleteTransaction,
    editDebt,
    deleteDebt
  } = useWallet();

  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/sign-in');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace('/sign-in');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Calculate total outstanding debts for Bank and Hand Money
  // Lent = positive, Borrowed = negative
  const bankDebtsTotal = debts
    .filter(d => d.description?.startsWith('[Bank]'))
    .reduce((sum, d) => sum + d.amount, 0);

  const handDebtsTotal = debts
    .filter(d => !d.description?.startsWith('[Bank]')) // everything else defaults to hand
    .reduce((sum, d) => sum + d.amount, 0);

  // Active view tab state (for mobile viewport tab rendering)
  const [activeMobileTab, setActiveMobileTab] = useState<number>(1); // Default to Today Ledger (Tab 2)

  // Local interaction states
  const [settlingDebtId, setSettlingDebtId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleSource, setSettleSource] = useState<'hand' | 'bank'>('hand');
  
  const [payingOutflowId, setPayingOutflowId] = useState<string | null>(null);
  const [outflowSource, setOutflowSource] = useState<'hand' | 'bank'>('bank');

  const [sweepingBankId, setSweepingBankId] = useState<string | null>(null);
  const [sweepAmount, setSweepAmount] = useState('');

  // Notebook scratchpad state
  const [notebookText, setNotebookText] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('vault_notebook') || '';
    }
    return '';
  });
  const [isSavingNotebook, setIsSavingNotebook] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vault_notebook', notebookText);
      setIsSavingNotebook(true);
      const timer = setTimeout(() => setIsSavingNotebook(false), 500);
      return () => clearTimeout(timer);
    }
  }, [notebookText]);

  const [copiedNotebook, setCopiedNotebook] = useState(false);

  const handleCopyNotebook = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(notebookText);
      setCopiedNotebook(true);
      setTimeout(() => setCopiedNotebook(false), 1500);
    }
  };

  const handleClearNotebook = () => {
    if (confirm("Are you sure you want to clear the notebook?")) {
      setNotebookText('');
    }
  };

  const handleAddNotebookTag = (tag: string) => {
    const textarea = document.getElementById('vault-notebook-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const insert = (start > 0 && text[start - 1] !== '\n') ? ` ${tag}` : tag;
      const newText = before + insert + after;
      setNotebookText(newText);
      
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + insert.length;
      }, 50);
    } else {
      setNotebookText(prev => prev + (prev.length > 0 ? ' ' : '') + tag);
    }
  };

  // Day Cycle closing simulation state
  const [closeoutSweepAmount, setCloseoutSweepAmount] = useState('');
  const [closeoutSweepBank, setCloseoutSweepBank] = useState('');
  const [nextCycleIncomeInput, setNextCycleIncomeInput] = useState('10000');
  const [nextCycleStartInput, setNextCycleStartInput] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  // Expanded monthly accordion states (stores expanded status per monthYear string)
  const [expandedMonths, setExpandedMonths] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const todayLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    setExpandedMonths({ [todayLabel]: true });
  }, []);

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

  // Binary theme switcher state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vault_theme');
      return (saved as 'light' | 'dark') || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('theme-light', 'theme-dark', 'dark');
      document.documentElement.classList.add(`theme-${theme}`);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
      localStorage.setItem('vault_theme', theme);
    }
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

  // Sync simulator inputs on activeCycle/handMoney/savings changes
  useEffect(() => {
    if (activeCycle) {
      setNextCycleIncomeInput(activeCycle.income.toString());
    }
  }, [activeCycle]);

  useEffect(() => {
    setCloseoutSweepAmount(Math.max(0, handMoney).toFixed(0));
  }, [handMoney]);

  useEffect(() => {
    const firstSaving = savings.find(s => s.id !== 'wallet-bank' && s.id !== 'wallet-hand' && s.id !== 'wallet-option');
    if (firstSaving && !closeoutSweepBank) {
      setCloseoutSweepBank(firstSaving.id);
    }
  }, [savings, closeoutSweepBank]);

  // Transaction Edit Modal state
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSource, setEditSource] = useState<'hand' | 'bank' | 'option'>('hand');

  // Filter transactions for continuous calendar month view
  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-06"
  const activeTransactions = transactions.filter(t => t.date && t.date.startsWith(currentMonthStr));
  const colomboCommuteCount = activeTransactions.filter(t => t.category === 'Travel (Colombo)').length;
  const homeCommuteCount = activeTransactions.filter(t => t.category === 'Travel (Home)').length;

  // Filter transactions for the active Day Cycle date range
  const cycleTransactions = activeCycle 
    ? transactions.filter(t =>
        t.cycle_id === activeCycle.id &&
        t.date >= activeCycle.start_date &&
        t.date <= activeCycle.end_date
      )
    : [];
  const cycleBaseIncome = activeCycle?.income || 0;
  const cycleExtraIncome = cycleTransactions
    .filter(t => t.type === 'income' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalCycleIncome = cycleBaseIncome + cycleExtraIncome;

  const cycleExpenses = cycleTransactions
    .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const remainingCycleBalance = handMoney;

  // Active month total income (base + extra incomes)
  const activeMonthIncome = activeTransactions
    .filter(t => t.type === 'income' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
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
    const isOption = t.description.startsWith('[Option]');
    setEditSource(isBank ? 'bank' : isOption ? 'option' : 'hand');

    let cleanDesc = t.description;
    if (cleanDesc.startsWith('[Bank]')) cleanDesc = cleanDesc.replace('[Bank]', '').trim();
    if (cleanDesc.startsWith('[Hand]')) cleanDesc = cleanDesc.replace('[Hand]', '').trim();
    if (cleanDesc.startsWith('[Option]')) cleanDesc = cleanDesc.replace('[Option]', '').trim();
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

  // Debt Edit Modal state
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [editDebtAmount, setEditDebtAmount] = useState('');
  const [editDebtPersonName, setEditDebtPersonName] = useState('');
  const [editDebtType, setEditDebtType] = useState<'lent' | 'borrowed'>('lent');
  const [editDebtDescription, setEditDebtDescription] = useState('');

  const handleStartEditDebt = (d: Debt) => {
    setEditingDebt(d);
    setEditDebtAmount(Math.abs(d.amount).toString());
    setEditDebtPersonName(d.person_name);
    setEditDebtType(d.type);
    setEditDebtDescription(d.description || '');
  };

  const handleSaveDebtEdit = async () => {
    if (!editingDebt) return;
    const numAmt = parseFloat(editDebtAmount);
    if (isNaN(numAmt) || numAmt <= 0 || !editDebtPersonName.trim()) return;

    await editDebt(
      editingDebt.id,
      numAmt,
      editDebtPersonName.trim(),
      editDebtType,
      editDebtDescription
    );
    setEditingDebt(null);
  };

  const handleDeleteDebt = async (id: string) => {
    if (confirm("Are you sure you want to delete this trust ledger? This will remove the debt record.")) {
      await deleteDebt(id);
    }
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
      .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  // Settle debt handler
  const handleSettleDebt = async (debtId: string) => {
    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) return;
    await settleDebt(debtId, amt, settleSource);
    setSettlingDebtId(null);
    setSettleAmount('');
  };

  // Fixed Outflow handlers
  const handlePayOutflow = async (outflow: FixedOutflow) => {
    const amount = Math.abs(outflow.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("Please enter a valid fixed outflow amount.");
      return;
    }

    const availableBalance = outflowSource === 'bank' ? bankMoney : handMoney;
    if (amount > availableBalance) {
      alert(`Insufficient ${outflowSource === 'bank' ? 'Bank' : 'Hand'} Money for this payment.`);
      return;
    }

    const category = outflow.id === 'rent' ? 'Rent' : outflow.id === 'elec' ? 'Electricity' : 'General';
    const description = `Fixed Outflow: ${outflow.title}`;
    const date = getLocalDateString();
    
    await addExpense(amount, description, category, date, outflowSource);
    
    setOutflows(prev => prev.map(o => {
      if (o.id === outflow.id) {
        return { ...o, status: 'Paid' };
      }
      return o;
    }));
    setPayingOutflowId(null);
  };

  const handleUnpayOutflow = async (outflow: FixedOutflow) => {
    if (confirm(`Are you sure you want to mark "${outflow.title}" as Pending? This will delete the logged transaction and refund the money.`)) {
      const matchTx = transactions.find(t => 
        t.type === 'expense' && 
        (t.description.includes(`Fixed Outflow: ${outflow.title}`) || t.description.includes(outflow.title))
      );
      
      if (matchTx) {
        await deleteTransaction(matchTx.id);
      }
      
      setOutflows(prev => prev.map(o => {
        if (o.id === outflow.id) {
          return { ...o, status: 'Pending' };
        }
        return o;
      }));
    }
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

  // Perform inline sweep action
  const handlePerformInlineSweep = async () => {
    const sweepAmt = parseFloat(closeoutSweepAmount);
    if (isNaN(sweepAmt) || sweepAmt <= 0) {
      alert("Please specify a valid sweep amount.");
      return;
    }
    if (sweepAmt > handMoney) {
      alert("Cannot sweep more than remaining Hand Money balance.");
      return;
    }
    await depositToSavings(closeoutSweepBank, sweepAmt);
    alert(`Successfully swept Rs. ${sweepAmt.toLocaleString()}!`);
  };

  // Perform inline start new cycle action (preserves Hand Money, only affects base income)
  const handlePerformInlineStartNewCycle = async () => {
    const nextIncome = parseFloat(nextCycleIncomeInput);
    if (isNaN(nextIncome) || nextIncome <= 0) {
      alert("Please specify a valid income for the next cycle.");
      return;
    }

    const [startYear, startMonth, startDay] = nextCycleStartInput.split('-').map(Number);
    if (!startYear || !startMonth || !startDay) {
      alert("Please specify the base income date.");
      return;
    }

    const nextStart = new Date(startYear, startMonth - 1, startDay);
    if (
      nextStart.getFullYear() !== startYear ||
      nextStart.getMonth() !== startMonth - 1 ||
      nextStart.getDate() !== startDay
    ) {
      alert("Please specify a valid base income date.");
      return;
    }

    const nextEnd = new Date(startYear, startMonth - 1, startDay + 9);
    const nextStartStr = getLocalDateString(nextStart);
    const nextEndStr = getLocalDateString(nextEnd);

    await closeActiveCycleAndSweep(
      0, // sweepAmount = 0 (separate)
      '', // bankId = ''
      nextIncome,
      nextStartStr,
      nextEndStr
    );

    alert("Successfully started a new Day Cycle! Remaining Hand Money balance has been preserved.");
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

  // Swiped transaction state in Monthly History
  const [swipedTransactionId, setSwipedTransactionId] = useState<string | null>(null);
  const [itemTouchStart, setItemTouchStart] = useState<number | null>(null);

  const handleItemTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setItemTouchStart(e.touches[0].clientX);
  };

  const handleItemTouchMove = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (itemTouchStart === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = itemTouchStart - currentX;
    
    // Swipe left to open edit options
    if (diffX > 45) {
      setSwipedTransactionId(id);
    }
    // Swipe right to close/hide edit options
    if (diffX < -45) {
      if (swipedTransactionId === id) {
        setSwipedTransactionId(null);
      }
    }
  };

  const handleItemTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setItemTouchStart(null);
  };

  const handleItemMouseDown = (e: React.MouseEvent) => {
    setItemTouchStart(e.clientX);
  };

  const handleItemMouseMove = (e: React.MouseEvent, id: string) => {
    if (itemTouchStart === null) return;
    const diffX = itemTouchStart - e.clientX;
    if (diffX > 45) {
      setSwipedTransactionId(id);
    } else if (diffX < -45) {
      if (swipedTransactionId === id) {
        setSwipedTransactionId(null);
      }
    }
  };

  const handleItemMouseUp = () => {
    setItemTouchStart(null);
  };

  // Swiped debt state in Trust Ledger
  const [swipedDebtId, setSwipedDebtId] = useState<string | null>(null);

  const handleDebtTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setItemTouchStart(e.touches[0].clientX);
  };

  const handleDebtTouchMove = (e: React.TouchEvent, id: string) => {
    e.stopPropagation();
    if (itemTouchStart === null) return;
    const currentX = e.touches[0].clientX;
    const diffX = itemTouchStart - currentX;
    
    // Swipe left to open edit options
    if (diffX > 45) {
      setSwipedDebtId(id);
    }
    // Swipe right to close/hide edit options
    if (diffX < -45) {
      if (swipedDebtId === id) {
        setSwipedDebtId(null);
      }
    }
  };

  const handleDebtTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    setItemTouchStart(null);
  };

  const handleDebtMouseDown = (e: React.MouseEvent) => {
    setItemTouchStart(e.clientX);
  };

  const handleDebtMouseMove = (e: React.MouseEvent, id: string) => {
    if (itemTouchStart === null) return;
    const diffX = itemTouchStart - e.clientX;
    if (diffX > 45) {
      setSwipedDebtId(id);
    } else if (diffX < -45) {
      if (swipedDebtId === id) {
        setSwipedDebtId(null);
      }
    }
  };

  const handleDebtMouseUp = () => {
    setItemTouchStart(null);
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
            <span className="font-mono text-[10px] tracking-widest uppercase text-slate-muted">Syncing MSNA Wallet System...</span>
          </div>
        </div>
      </div>
    );
  }

  // Helper to render transaction category avatar
  const getTransactionAvatar = (category: string, description: string, type: string) => {
    let bgClass = 'bg-slate-100 text-slate-500';
    let LucideIcon = ShoppingBag;

    if (type === 'income') {
      bgClass = 'bg-emerald-100 text-emerald-700';
      LucideIcon = ArrowDownLeft;
    } else if (category === 'Savings Sweep' || description.includes('Sweep')) {
      bgClass = 'bg-teal-100 text-teal-700';
      LucideIcon = Wallet;
    } else {
      switch (category) {
        case 'Food':
          bgClass = 'bg-orange-100 text-orange-600';
          LucideIcon = Coffee;
          break;
        case 'Travel (Colombo)':
          bgClass = 'bg-blue-100 text-blue-600';
          LucideIcon = Car;
          break;
        case 'Travel (Home)':
          bgClass = 'bg-indigo-100 text-indigo-600';
          LucideIcon = Home;
          break;
        case 'Rent':
          bgClass = 'bg-purple-100 text-purple-600';
          LucideIcon = Building2;
          break;
        case 'Electricity':
          bgClass = 'bg-yellow-100 text-yellow-600';
          LucideIcon = Zap;
          break;
        default:
          if (description.toLowerCase().includes('withdrawal') || description.toLowerCase().includes('withdraw')) {
            bgClass = 'bg-amber-100 text-amber-600';
            LucideIcon = CreditCard;
          } else {
            bgClass = 'bg-slate-100 text-slate-600';
            LucideIcon = ShoppingBag;
          }
          break;
      }
    }

    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${bgClass}`}>
        <LucideIcon className="h-5 w-5" strokeWidth={1.75} />
      </div>
    );
  };

  return (
    <main className={`min-h-screen bg-transparent pb-32 print:pb-0 theme-${theme}`}>
      
      <Header theme={theme} setTheme={setTheme} />

      {/* COMBINATION NET WORTH PANEL (HERO CARD) */}
      <div className="no-print max-w-7xl mx-auto px-4 md:px-8 mt-4">
        <section className="hero-card relative overflow-hidden p-6 md:p-8 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start w-full">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest text-charcoal/60 font-bold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-charcoal/70" strokeWidth={1.75} />
                Combined Net Worth
              </p>
              <h2 className={`text-4xl md:text-5xl font-extrabold tracking-tight text-charcoal transition-all duration-300 mt-2 ${isBlurred ? 'privacy-blur' : ''}`}>
                Rs. {netWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
            </div>
            
            <button
              type="button"
              onClick={() => setIsBlurred(prev => !prev)}
              className="flex items-center justify-center w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white/60 text-charcoal shadow-sm active:scale-90 transition-all cursor-pointer"
              title={isBlurred ? "Show monetary values" : "Blur monetary values"}
            >
              {isBlurred ? <EyeOff className="h-5 w-5" strokeWidth={1.75} /> : <Eye className="h-5 w-5" strokeWidth={1.75} />}
            </button>
          </div>
        </section>
      </div>

      {/* 4 QUADRANT WALLET ARCHITECTURE (CORE LIQUIDITY BLOCKS) */}
      <div className="no-print max-w-7xl mx-auto px-4 md:px-8 mt-6">
        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-none pb-4 px-2 md:px-0">
          
          {/* 1. BANK MONEY */}
          <div className="glass-panel p-3.5 rounded-2xl flex-shrink-0 w-[260px] md:w-[calc(25%-12px)] snap-center flex flex-col justify-between relative group transition-all duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage">Bank Money</span>
              <Landmark className="h-4.5 w-4.5 text-sage" strokeWidth={1.75} />
            </div>
            
            {editingWalletId === 'wallet-bank' ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-sans font-bold text-charcoal focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('wallet-bank')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('wallet-bank')} className="bg-charcoal p-1.5 rounded-lg text-white cursor-pointer active:scale-90 transition-all">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-bank', bankMoney)}
                  className={`text-lg md:text-xl font-sans font-black text-charcoal tracking-tight cursor-pointer transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {bankMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-bank', bankMoney)}
                  className="p-1.5 text-sage hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mt-1">
              <p className="text-[9px] text-sage/85 leading-tight">Auto-updates on Incomes & Bank Expenses</p>
              {bankDebtsTotal !== 0 && (
                <span className={`text-[9px] font-mono font-bold ${bankDebtsTotal > 0 ? 'text-emerald-500 dark:text-[#4DB6AC]' : 'text-crimson dark:text-rose-400'}`}>
                  {bankDebtsTotal > 0 ? '+' : '-'}Rs. {Math.abs(bankDebtsTotal).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* 2. LIQUID / HAND MONEY */}
          <div className="glass-panel p-3.5 rounded-2xl flex-shrink-0 w-[260px] md:w-[calc(25%-12px)] snap-center flex flex-col justify-between relative group transition-all duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage">Hand Money</span>
              <Coins className="h-4.5 w-4.5 text-sage" strokeWidth={1.75} />
            </div>
            
            {editingWalletId === 'wallet-hand' ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-sans font-bold text-charcoal focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('wallet-hand')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('wallet-hand')} className="bg-charcoal p-1.5 rounded-lg text-white cursor-pointer active:scale-90 transition-all">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-hand', handMoney)}
                  className={`text-lg md:text-xl font-sans font-black text-charcoal tracking-tight cursor-pointer transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {handMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-hand', handMoney)}
                  className="p-1.5 text-sage hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            )}
            <div className="flex justify-between items-center mt-1">
              <p className="text-[9px] text-sage/85 leading-tight">Primary cash wallet for daily hand expenses</p>
              {handDebtsTotal !== 0 && (
                <span className={`text-[9px] font-mono font-bold ${handDebtsTotal > 0 ? 'text-emerald-500 dark:text-[#4DB6AC]' : 'text-crimson dark:text-rose-400'}`}>
                  {handDebtsTotal > 0 ? '+' : '-'}Rs. {Math.abs(handDebtsTotal).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* 3. SAVING MONEY */}
          <div className="glass-panel p-3.5 rounded-2xl flex-shrink-0 w-[260px] md:w-[calc(25%-12px)] snap-center flex flex-col justify-between relative group transition-all duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage">Saving Money</span>
              <Wallet className="h-4.5 w-4.5 text-sage" strokeWidth={1.75} />
            </div>
            
            {editingWalletId === 'wallet-savings' ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-sans font-bold text-charcoal focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('s-1')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('s-1')} className="bg-charcoal p-1.5 rounded-lg text-white cursor-pointer active:scale-90 transition-all">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-savings', savingMoney)}
                  className={`text-lg md:text-xl font-sans font-black text-charcoal tracking-tight cursor-pointer transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {savingMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-savings', savingMoney)}
                  className="p-1.5 text-sage hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-colors flex items-center justify-center active:scale-90 cursor-pointer"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            )}
            <p className="text-[9px] text-sage/85 mt-1 leading-tight">Accumulated vaults swept from cycles</p>
          </div>

          {/* 4. OPTION MONEY */}
          <div className="glass-panel p-3.5 rounded-2xl flex-shrink-0 w-[260px] md:w-[calc(25%-12px)] snap-center flex flex-col justify-between relative group transition-all duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage">Option Money</span>
              <div className="flex gap-1 items-center">
                <button 
                  type="button"
                  onClick={() => handleStepOptionMoney('dec')}
                  className="bg-slate-100 dark:bg-slate-800 border-none h-6 w-6 min-h-[24px] min-w-[24px] rounded-full flex items-center justify-center text-charcoal dark:text-white transition-all active:scale-90 cursor-pointer"
                  title="Subtract Rs. 1,000"
                >
                  <Minus className="h-3 w-3" strokeWidth={2} />
                </button>
                <button 
                  type="button"
                  onClick={() => handleStepOptionMoney('inc')}
                  className="bg-slate-100 dark:bg-slate-800 border-none h-6 w-6 min-h-[24px] min-w-[24px] rounded-full flex items-center justify-center text-charcoal dark:text-white transition-all active:scale-90 cursor-pointer"
                  title="Add Rs. 1,000"
                >
                  <Plus className="h-3 w-3" strokeWidth={2} />
                </button>
              </div>
            </div>
            
            {editingWalletId === 'wallet-option' ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={editingWalletValue}
                  onChange={(e) => setEditingWalletValue(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-sm font-sans font-bold text-charcoal focus:outline-none w-full"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveWalletOverride('wallet-option')}
                  autoFocus
                />
                <button onClick={() => handleSaveWalletOverride('wallet-option')} className="bg-charcoal p-1.5 rounded-lg text-white cursor-pointer active:scale-90 transition-all">
                  <Check className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between mt-1">
                <h3 
                  onDoubleClick={() => handleStartEditWallet('wallet-option', optionMoney)}
                  className={`text-lg md:text-xl font-sans font-black text-charcoal tracking-tight cursor-pointer transition-colors ${isBlurred ? 'privacy-blur' : ''}`}
                >
                  Rs. {optionMoney.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h3>
                <button 
                  type="button"
                  onClick={() => handleStartEditWallet('wallet-option', optionMoney)}
                  className="p-1.5 text-sage hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-full transition-colors flex items-center justify-center active:scale-90 cursor-pointer"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.75} />
                </button>
              </div>
            )}
            <p className="text-[9px] text-sage/85 mt-1 leading-tight">Independent steerable ledger balance</p>
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

      {/* MOBILE FLOATING BOTTOM DOCK NAVIGATION */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden no-print w-[90%] max-w-sm">
        <div className="bg-white/95 backdrop-blur-md rounded-full px-5 py-3 shadow-lg border border-slate-100 flex items-center justify-between gap-2">
          {/* Tab 0: Vault (Landmark Icon) */}
          <button
            onClick={() => setActiveMobileTab(0)}
            className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 0 
                ? 'bg-black text-white scale-110 shadow-sm' 
                : 'text-sage  '
            }`}
            title="Vault & Trust"
          >
            <Landmark className="h-5 w-5" strokeWidth={activeMobileTab === 0 ? 2 : 1.75} />
          </button>

          {/* Tab 1: Today (Calendar Icon) */}
          <button
            onClick={() => setActiveMobileTab(1)}
            className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 1 
                ? 'bg-black text-white scale-110 shadow-sm' 
                : 'text-sage  '
            }`}
            title="Today Ledger"
          >
            <Calendar className="h-5 w-5" strokeWidth={activeMobileTab === 1 ? 2 : 1.75} />
          </button>

          {/* Center FAB Plus Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-fab-modal'));
            }}
            className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center shadow-md transition-all transform active:scale-95 cursor-pointer -translate-y-4 border-4 border-white"
            title="Add Ledger Entry"
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={2.5} />
          </button>

          {/* Tab 2: Cycles (Sparkles Icon) */}
          <button
            onClick={() => setActiveMobileTab(2)}
            className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 2 
                ? 'bg-black text-white scale-110 shadow-sm' 
                : 'text-sage  '
            }`}
            title="Day Cycles"
          >
            <Sparkles className="h-5 w-5" strokeWidth={activeMobileTab === 2 ? 2 : 1.75} />
          </button>

          {/* Tab 3: History (FileText Icon) */}
          <button
            onClick={() => setActiveMobileTab(3)}
            className={`p-2.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeMobileTab === 3 
                ? 'bg-black text-white scale-110 shadow-sm' 
                : 'text-sage  '
            }`}
            title="Monthly History"
          >
            <FileText className="h-5 w-5" strokeWidth={activeMobileTab === 3 ? 2 : 1.75} />
          </button>
        </div>
      </div>

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
              className="glass-panel relative z-10 w-full max-w-md overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-border/50 pb-3">
                <h3 className="font-bold text-sm text-charcoal dark:text-[#4DB6AC] uppercase flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4" /> Edit Transaction
                </h3>
                <button 
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="p-2.5 text-sage active:text-charcoal dark:active:text-white transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Payment Source / Destination</label>
                  <div className="flex border border-slate-border/50 rounded-lg p-0.5 bg-slate-50 dark:bg-[#22302C]">
                    <button
                      type="button"
                      onClick={() => setEditSource('hand')}
                      className={`flex-1 py-3 text-xs font-semibold rounded transition-all min-h-[44px] active:scale-95 ${
                        editSource === 'hand'
                          ? 'bg-black dark:bg-[#4DB6AC] text-white dark:text-[#0F1916] font-bold shadow'
                          : 'text-slate-muted active:text-charcoal dark:active:text-white'
                      }`}
                    >
                      Hand Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSource('bank')}
                      className={`flex-1 py-3 text-xs font-semibold rounded transition-all min-h-[44px] active:scale-95 ${
                        editSource === 'bank'
                          ? 'bg-black dark:bg-[#4DB6AC] text-white dark:text-[#0F1916] font-bold shadow'
                          : 'text-slate-muted active:text-charcoal dark:active:text-white'
                      }`}
                    >
                      Bank Money
                    </button>
                    {(editingTransaction?.type === 'income' || editingTransaction?.category === 'Adjustment') && (
                      <button
                        type="button"
                        onClick={() => setEditSource('option')}
                        className={`flex-1 py-3 text-xs font-semibold rounded transition-all min-h-[44px] active:scale-95 ${
                          editSource === 'option'
                            ? 'bg-black dark:bg-[#4DB6AC] text-white dark:text-[#0F1916] font-bold shadow'
                            : 'text-slate-muted active:text-charcoal dark:active:text-white'
                        }`}
                      >
                        Option Money
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Amount (Rs.)</label>
                  <input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Category</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm focus:border-charcoal dark:focus:border-[#4DB6AC]"
                  >
                    <option value="Food" className="bg-white dark:bg-[#1B2623] text-charcoal dark:text-white">Food</option>
                    <option value="Travel (Colombo)" className="bg-white dark:bg-[#1B2623] text-charcoal dark:text-white">Travel (Colombo)</option>
                    <option value="Travel (Home)" className="bg-white dark:bg-[#1B2623] text-charcoal dark:text-white">Travel (Home)</option>
                    <option value="Rent" className="bg-white dark:bg-[#1B2623] text-charcoal dark:text-white">Rent</option>
                    <option value="Electricity" className="bg-white dark:bg-[#1B2623] text-charcoal dark:text-white">Electricity</option>
                    <option value="General" className="bg-white dark:bg-[#1B2623] text-charcoal dark:text-white">General</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Description</label>
                  <input
                    type="text"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTransaction(null)}
                  className="flex-1 border border-slate-border py-3.5 rounded-lg text-xs font-semibold text-slate-muted active:text-charcoal dark:active:text-white active:bg-slate-100 dark:active:bg-[#22302C] transition-all active:scale-95 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTransactionEdit}
                  className="flex-1 bg-black dark:bg-[#4DB6AC] py-3.5 rounded-lg text-xs font-bold text-white dark:text-[#0F1916] transition-all active:scale-95 min-h-[44px]"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEBT EDIT MODAL */}
      <AnimatePresence>
        {editingDebt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md p-6 space-y-4 shadow-lg border border-slate-border text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-border/50">
                <h3 className="text-sm font-black uppercase text-charcoal dark:text-white flex items-center gap-1.5">
                  <Edit3 className="h-4 w-4 text-gold-glow" /> Edit Trust Ledger
                </h3>
                <button
                  onClick={() => setEditingDebt(null)}
                  className="p-1 rounded-full text-slate-muted hover:bg-slate-100 dark:hover:bg-[#22302C] active:scale-95 transition-all cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Amount (Rs.)</label>
                  <input
                    type="number"
                    value={editDebtAmount}
                    onChange={(e) => setEditDebtAmount(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Person Name</label>
                  <input
                    type="text"
                    value={editDebtPersonName}
                    onChange={(e) => setEditDebtPersonName(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Relationship</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditDebtType('lent')}
                      className={`flex-1 py-2 text-xs font-semibold rounded transition-all active:scale-95 border border-slate-200 dark:border-slate-700/50 ${
                        editDebtType === 'lent'
                          ? 'bg-black dark:bg-[#4DB6AC] text-white dark:text-[#0F1916] font-bold shadow'
                          : 'text-slate-muted active:text-charcoal dark:active:text-white'
                      }`}
                    >
                      Lent
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditDebtType('borrowed')}
                      className={`flex-1 py-2 text-xs font-semibold rounded transition-all active:scale-95 border border-slate-200 dark:border-slate-700/50 ${
                        editDebtType === 'borrowed'
                          ? 'bg-rose-500 text-white font-bold shadow'
                          : 'text-slate-muted active:text-charcoal dark:active:text-white'
                      }`}
                    >
                      Borrowed
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-slate-muted block font-semibold">Reason / Description</label>
                  <input
                    type="text"
                    value={editDebtDescription}
                    onChange={(e) => setEditDebtDescription(e.target.value)}
                    className="glass-input w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingDebt(null)}
                  className="flex-1 border border-slate-border py-3.5 rounded-lg text-xs font-semibold text-slate-muted active:text-charcoal dark:active:text-white active:bg-slate-100 dark:active:bg-[#22302C] transition-all active:scale-95 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDebtEdit}
                  className="flex-1 bg-black dark:bg-[#4DB6AC] py-3.5 rounded-lg text-xs font-bold text-white dark:text-[#0F1916] transition-all active:scale-95 min-h-[44px]"
                >
                  Save Changes
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
          .filter(t => t.type === 'income' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
          .reduce((sum, t) => sum + t.amount, 0);

        const printExpenses = printTransactions
          .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
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
                  <span>Deposited to Savings:</span>
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

            <div className="border border-black p-4 space-y-4">
              <h2 className="text-sm font-bold uppercase border-b border-black pb-1">Detailed Transaction Log</h2>
              {printTransactions.length === 0 ? (
                <p className="text-xs italic text-gray-500 text-center py-4">No transactions recorded for this period.</p>
              ) : (() => {
                // Group printTransactions by category
                const grouped: { [category: string]: Transaction[] } = {};
                printTransactions.forEach(t => {
                  const cat = t.category || 'General';
                  if (!grouped[cat]) {
                    grouped[cat] = [];
                  }
                  grouped[cat].push(t);
                });

                // Get categories present
                const categories = Object.keys(grouped).sort();

                return (
                  <div className="space-y-6">
                    {categories.map((cat, idx) => {
                      const catTransactions = grouped[cat];
                      return (
                        <div key={cat} className={`space-y-2 pb-4 ${idx < categories.length - 1 ? 'border-b border-gray-200' : ''}`}>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-black">[{cat.toUpperCase()}]</h3>
                          <table className="w-full text-xs font-mono">
                            <thead>
                              <tr className="border-b border-black text-left">
                                <th className="pb-1 w-1/4">Date</th>
                                <th className="pb-1 w-1/2">Description</th>
                                <th className="pb-1 text-right w-1/4">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {catTransactions.map((t, rowIdx) => (
                                <tr key={t.id} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                  <td className="py-1">{t.date}</td>
                                  <td className="py-1">{t.description}</td>
                                  <td className="py-1 text-right">{t.amount > 0 ? '+' : '-'}Rs. {Math.abs(t.amount).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
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
          <span className="font-mono text-2xl md:text-3xl font-bold text-gold-glow mt-1 block">
            Rs. {savingMoney.toLocaleString()}
          </span>
        </div>

        {/* Fixed Outflows */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase text-slate-muted font-bold tracking-wider">Fixed Outflows</h4>
          <div className="grid grid-cols-1 gap-3">
            
            {outflows.map((outflow) => {
              const isPaid = outflow.status === 'Paid';
              const isPaying = payingOutflowId === outflow.id;
              return (
                <div key={outflow.id} className="bg-obsidian/30 p-3 rounded-lg border border-slate-border/20 space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={outflow.title}
                        onChange={(e) => handleUpdateOutflow(outflow.id, 'title', e.target.value)}
                        className="bg-transparent border-none text-slate-muted text-[10px] block font-medium w-full focus:outline-none active:bg-white/5 rounded focus:bg-obsidian/60 px-1 py-0.5"
                      />
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs text-charcoal dark:text-[#E0E0E0] font-semibold font-mono">Rs.</span>
                        <input
                          type="number"
                          value={outflow.amount}
                          onChange={(e) => handleUpdateOutflow(outflow.id, 'amount', e.target.value)}
                          className="bg-transparent border-none text-xs text-charcoal dark:text-[#E0E0E0] font-semibold font-mono w-24 focus:outline-none active:bg-white/5 rounded focus:bg-obsidian/60 px-1"
                        />
                      </div>
                    </div>
                    
                    {!isPaying && (
                      <button 
                        onClick={() => {
                          if (isPaid) {
                            handleUnpayOutflow(outflow);
                          } else {
                            setPayingOutflowId(outflow.id);
                            setOutflowSource('bank');
                          }
                        }}
                        className={`text-[9px] uppercase font-mono px-3 rounded border transition-all duration-300 min-h-[44px] min-w-[50px] flex items-center justify-center active:scale-95 ${
                          isPaid 
                            ? 'bg-emerald/10 text-emerald border-emerald/30 font-bold' 
                            : 'bg-amber/10 text-amber border-amber/30 active:bg-emerald/5 active:text-emerald active:border-emerald/20 font-bold'
                        }`}
                      >
                        {outflow.status}
                      </button>
                    )}
                  </div>

                  {isPaying && (
                    <div className="p-2 bg-obsidian/60 rounded border border-slate-border/30 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[9px]">
                        <span className="text-slate-muted font-bold uppercase">Pay Outflow From:</span>
                        <div className="flex border border-slate-border/50 rounded bg-obsidian/30 p-0.5">
                          <button
                            type="button"
                            onClick={() => setOutflowSource('hand')}
                            className={`px-2 py-0.5 text-[8px] font-bold rounded transition-all ${
                              outflowSource === 'hand'
                                ? 'bg-champagne text-obsidian'
                                : 'text-slate-muted active:text-white'
                            }`}
                          >
                            Hand
                          </button>
                          <button
                            type="button"
                            onClick={() => setOutflowSource('bank')}
                            className={`px-2 py-0.5 text-[8px] font-bold rounded transition-all ${
                              outflowSource === 'bank'
                                ? 'bg-champagne text-obsidian'
                                : 'text-slate-muted active:text-white'
                            }`}
                          >
                            Bank
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setPayingOutflowId(null)}
                          className="text-slate-muted border border-slate-border/30 px-2.5 py-1 rounded active:scale-95 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePayOutflow(outflow)}
                          className="bg-champagne text-obsidian font-bold px-3 py-1 rounded shadow-gold-glow active:scale-95 transition-all"
                        >
                          Confirm Pay
                        </button>
                      </div>
                    </div>
                  )}
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
                const isSwiped = swipedDebtId === d.id;
                return (
                  <div 
                    key={d.id} 
                    onTouchStart={handleDebtTouchStart}
                    onTouchMove={(e) => handleDebtTouchMove(e, d.id)}
                    onTouchEnd={handleDebtTouchEnd}
                    onMouseDown={handleDebtMouseDown}
                    onMouseMove={(e) => handleDebtMouseMove(e, d.id)}
                    onMouseUp={handleDebtMouseUp}
                    onMouseLeave={handleDebtMouseUp}
                    className="relative overflow-hidden rounded-lg border border-slate-border/20 bg-obsidian/30 select-none"
                  >
                    {/* Swipe edit/delete buttons underneath */}
                    <div 
                      className="absolute right-0 top-0 bottom-0 flex items-center bg-slate-50 dark:bg-[#1B2623] transition-all duration-300 z-10"
                      style={{
                        width: isSwiped ? '80px' : '0px',
                        opacity: isSwiped ? 1 : 0,
                        overflow: 'hidden'
                      }}
                    >
                      <div className="flex items-center justify-center w-full h-full gap-2 px-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleStartEditDebt(d);
                            setSwipedDebtId(null);
                          }}
                          className="p-1.5 text-sage hover:text-charcoal dark:hover:text-white rounded-full transition-all active:scale-90 cursor-pointer flex items-center justify-center bg-white dark:bg-[#22302C] shadow-sm border border-slate-100 dark:border-slate-800"
                          title="Edit trust ledger"
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleDeleteDebt(d.id);
                            setSwipedDebtId(null);
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-full transition-all active:scale-90 cursor-pointer flex items-center justify-center bg-white dark:bg-[#22302C] shadow-sm border border-slate-100 dark:border-slate-800"
                          title="Delete trust ledger"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </div>

                    {/* Main Content card */}
                    <div 
                      className="p-3 space-y-1.5 transition-transform duration-300"
                      style={{
                        transform: isSwiped ? 'translateX(-80px)' : 'translateX(0px)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-charcoal dark:text-[#E0E0E0]">{d.person_name}</span>
                        <span className={`font-mono text-xs font-semibold ${isLent ? 'text-emerald' : 'text-crimson'}`}>
                          {isLent ? '+' : '-'}Rs. {Math.abs(d.amount).toLocaleString()}
                        </span>
                      </div>

                      {d.description && (
                        <p className="text-[10px] text-slate-muted italic">{d.description}</p>
                      )}

                      <div className="flex justify-between items-center text-[9px]">
                        <span className={isLent ? 'text-emerald' : 'text-crimson'}>
                          {isLent ? 'Lent (Receivable)' : 'Borrowed (Payable)'}
                        </span>
                        
                        {settlingDebtId !== d.id && (
                          <button
                            onClick={() => {
                              setSettlingDebtId(d.id);
                              setSettleAmount(Math.abs(d.amount).toString());
                              setSettleSource('hand');
                            }}
                            className="text-[9px] uppercase font-bold text-champagne active:underline transition-all min-h-[44px] px-3.5 flex items-center justify-center active:scale-95"
                          >
                            Settle
                          </button>
                        )}
                      </div>

                      {settlingDebtId === d.id && (
                        <div className="mt-2 p-2 bg-obsidian/60 rounded border border-slate-border/30 space-y-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <label className="text-[8px] uppercase text-slate-muted font-bold flex-1">Settle Amount</label>
                            <input
                              type="number"
                              placeholder="Amount"
                              value={settleAmount}
                              onChange={(e) => setSettleAmount(e.target.value)}
                              className="w-24 bg-slate-50 dark:bg-[#1B2623] text-[10px] text-charcoal dark:text-[#E0E0E0] border border-slate-200 dark:border-slate-700/50 rounded px-1.5 py-1 focus:outline-none font-mono"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[8px] uppercase text-slate-muted font-bold flex-1">Wallet Source</label>
                            <div className="flex border border-slate-border/50 rounded bg-obsidian/30 p-0.5">
                              <button
                                type="button"
                                onClick={() => setSettleSource('hand')}
                                className={`px-2.5 py-0.5 text-[8px] font-bold rounded transition-all ${
                                  settleSource === 'hand'
                                    ? 'bg-champagne text-obsidian'
                                    : 'text-slate-muted active:text-white'
                                }`}
                              >
                                Hand
                              </button>
                              <button
                                type="button"
                                onClick={() => setSettleSource('bank')}
                                className={`px-2.5 py-0.5 text-[8px] font-bold rounded transition-all ${
                                  settleSource === 'bank'
                                    ? 'bg-champagne text-obsidian'
                                    : 'text-slate-muted active:text-white'
                                }`}
                              >
                                Bank
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setSettlingDebtId(null)}
                              className="text-slate-muted text-[10px] border border-slate-border/30 px-2 py-0.5 rounded active:scale-95 transition-all"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSettleDebt(d.id)}
                              className="bg-champagne text-obsidian text-[10px] font-bold px-3.5 py-0.5 rounded shadow-gold-glow active:scale-95 transition-all"
                            >
                              Pay
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Notebook Section */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Edit3 className="h-4 w-4 text-sage" strokeWidth={2} />
              <h4 className="text-xs uppercase text-slate-muted font-bold tracking-wider">Vault Scratchpad</h4>
            </div>
            <div className="flex items-center gap-1.5">
              {isSavingNotebook ? (
                <span className="flex items-center gap-1 text-[9px] font-mono text-amber-500 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Saving
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
                  Auto-saved
                </span>
              )}
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-2xl bg-white dark:bg-[#151D1B] border border-slate-100 dark:border-slate-800/50 shadow-sm space-y-3">
            {/* Quick Action Tags Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[9px] font-mono scroll-smooth">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  const dateStr = `[${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}]: `;
                  handleAddNotebookTag(dateStr);
                }}
                className="bg-slate-100 dark:bg-[#1C2623] hover:bg-slate-200 dark:hover:bg-slate-800 text-charcoal dark:text-white px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 cursor-pointer active:scale-95 transition-all font-semibold"
              >
                + Date
              </button>
              <button
                type="button"
                onClick={() => handleAddNotebookTag('[TODO] ')}
                className="bg-slate-100 dark:bg-[#1C2623] hover:bg-slate-200 dark:hover:bg-slate-800 text-charcoal dark:text-white px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 cursor-pointer active:scale-95 transition-all font-semibold"
              >
                + Todo
              </button>
              <button
                type="button"
                onClick={() => handleAddNotebookTag('[SETTLE] ')}
                className="bg-slate-100 dark:bg-[#1C2623] hover:bg-slate-200 dark:hover:bg-slate-800 text-charcoal dark:text-white px-2 py-1 rounded border border-slate-200/50 dark:border-slate-700/50 flex-shrink-0 cursor-pointer active:scale-95 transition-all font-semibold"
              >
                + Settle
              </button>
              <button
                type="button"
                onClick={() => handleAddNotebookTag('[URGENT] ')}
                className="bg-red-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-2 py-1 rounded border border-red-100 dark:border-rose-900/40 flex-shrink-0 cursor-pointer active:scale-95 transition-all font-semibold"
              >
                + Urgent
              </button>
              <div className="w-[1px] h-3 bg-slate-200 dark:bg-slate-800 flex-shrink-0 mx-0.5" />
              <button
                type="button"
                onClick={() => handleAddNotebookTag('Rs. 500')}
                className="bg-slate-50 dark:bg-[#1B2623]/40 text-sage px-2 py-1 rounded border border-slate-100 dark:border-slate-800/40 flex-shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                + Rs. 500
              </button>
              <button
                type="button"
                onClick={() => handleAddNotebookTag('Rs. 1,000')}
                className="bg-slate-50 dark:bg-[#1B2623]/40 text-sage px-2 py-1 rounded border border-slate-100 dark:border-slate-800/40 flex-shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                + Rs. 1k
              </button>
              <button
                type="button"
                onClick={() => handleAddNotebookTag('Rs. 5,000')}
                className="bg-slate-50 dark:bg-[#1B2623]/40 text-sage px-2 py-1 rounded border border-slate-100 dark:border-slate-800/40 flex-shrink-0 cursor-pointer active:scale-95 transition-all"
              >
                + Rs. 5k
              </button>
            </div>

            {/* Ruled Notebook Paper Sheet */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-inner">
              {/* Paper bookmark sticker */}
              <div className="absolute top-0 right-4 w-6 h-4 bg-amber-500/80 dark:bg-amber-600/80 rounded-b-md shadow-sm z-20 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white/60" />
              </div>
              
              <textarea
                id="vault-notebook-textarea"
                value={notebookText}
                onChange={(e) => setNotebookText(e.target.value)}
                placeholder="Draft trust settlements, pending bills, or reminders here. Auto-saves as you type..."
                className="w-full min-h-[160px] max-h-[300px] text-xs font-mono font-medium p-4 pt-5 pl-8 focus:outline-none resize-y transition-all text-charcoal dark:text-slate-100 bg-[#FCF9F2] dark:bg-[#181F1D]"
                style={{
                  lineHeight: '24px',
                  backgroundImage: theme === 'light' 
                    ? 'linear-gradient(to bottom, transparent 23px, #e9e5d9 23px)' 
                    : 'linear-gradient(to bottom, transparent 23px, #2A3633 23px)',
                  backgroundSize: '100% 24px',
                  borderLeft: theme === 'light' ? '2px solid #fda4af' : '2px solid #881337',
                }}
              />
            </div>

            {/* Notebook Footer Toolbar */}
            <div className="flex justify-between items-center text-[10px] text-slate-muted">
              <span>{notebookText.length} characters | {notebookText.split('\n').filter(Boolean).length} lines</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClearNotebook}
                  className="px-2.5 py-1 text-rose-500 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleCopyNotebook}
                  className={`px-3 py-1 font-semibold rounded transition-all active:scale-95 flex items-center gap-1 cursor-pointer ${
                    copiedNotebook 
                      ? 'bg-emerald text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-[#1C2623] text-charcoal dark:text-white border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                >
                  {copiedNotebook ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <FileText className="h-3 w-3" />
                      Copy All
                    </>
                  )}
                </button>
              </div>
            </div>
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
      <div className="glass-panel p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold tracking-wider uppercase text-charcoal">Today Ledger</h3>
          <span className="text-[9px] text-sage font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/50">
            Archived Daily Streams
          </span>
        </div>

        {/* Date Grouped Timeline container */}
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {todayTransactions.length === 0 ? (
            <p className="text-xs text-sage italic text-center py-10">No ledger entries logged today</p>
          ) : (
            Object.entries(groupedTimelineToday).map(([dateStr, items]) => {
              const dailyTotal = calculateDailyTotal(items);
              return (
                <div key={dateStr} className="space-y-3">
                  {/* Daily Subheader */}
                  <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border-l-4 border-champagne text-xs font-bold">
                    <span className="text-charcoal">{dateStr}</span>
                    <span className="text-sage">Total spent: <span className="text-charcoal font-bold">Rs. {dailyTotal.toLocaleString()}</span></span>
                  </div>

                  {/* Transactions listed under day */}
                  <div className="space-y-2 pl-1">
                    {items.map(t => {
                      const isExpense = t.type === 'expense';
                      const isBank = t.description.startsWith('[Bank]');
                      const isOption = t.description.startsWith('[Option]');
                      
                      // Remove prefix to clean rendering description
                      let descClean = t.description;
                      if (descClean.startsWith('[Bank]')) descClean = descClean.replace('[Bank]', '').trim();
                      if (descClean.startsWith('[Hand]')) descClean = descClean.replace('[Hand]', '').trim();
                      if (descClean.startsWith('[Option]')) descClean = descClean.replace('[Option]', '').trim();

                      return (
                        <div 
                          key={t.id} 
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 transition-all duration-200 group/item"
                        >
                          {/* Avatar icon */}
                          {getTransactionAvatar(t.category, t.description, t.type)}

                          {/* Middle content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-full font-bold ${
                                isBank 
                                  ? 'bg-blue-50 text-blue-600 border border-blue-100/50' 
                                  : isOption
                                    ? 'bg-purple-50 text-purple-600 border border-purple-100/50'
                                    : 'bg-amber-50 text-amber-600 border border-amber-100/50'
                              }`}>
                                {isBank ? 'Bank' : isOption ? 'Option' : 'Hand'}
                              </span>
                              <span className="text-[9px] text-sage font-semibold">{t.category}</span>
                            </div>
                            <p className="text-xs font-semibold text-charcoal mt-1 leading-tight">{descClean}</p>
                          </div>
                          
                          {/* Right side actions and amount */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className={`font-sans text-xs font-black mr-2 ${isExpense ? 'text-rose-500' : 'text-emerald-600'}`}>
                              {isExpense ? '-' : '+'}Rs. {Math.abs(t.amount).toLocaleString()}
                            </span>
                            
                            <button
                              onClick={() => handleStartEditTransaction(t)}
                              className="p-1.5 text-sage rounded-full transition-colors active:scale-90 cursor-pointer flex items-center justify-center"
                              title="Edit transaction parameters"
                            >
                              <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </button>

                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-1.5 text-sage rounded-full transition-colors active:scale-90 cursor-pointer flex items-center justify-center"
                              title="Delete transaction"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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

  // TAB 3 RENDER: DAY CYCLES
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
        .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    };

    return (
      <div className="glass-panel p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold tracking-wider uppercase text-charcoal">Day Cycle</h3>
          {activeCycle && (
            <span className="text-[9px] font-bold text-champagne bg-champagne/10 border border-champagne/20 px-2.5 py-1 rounded-full">
              Active Cycle
            </span>
          )}
        </div>
        {activeCycle && (
          <p className="text-[10px] font-bold text-sage">
            Base income period: {activeCycle.start_date} to {activeCycle.end_date}
          </p>
        )}

        {/* Metrics Grid */}
        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
          <div className="grid grid-cols-3 gap-3 text-center text-[10px]">
            <div className="bg-white border border-slate-100 p-2.5 rounded-xl relative group/income shadow-sm">
              <span className="text-sage block font-bold uppercase tracking-wider text-[8px] mb-1">Base Income</span>
              {editingCycleIncome ? (
                <div className="flex items-center gap-1.5 mt-1 justify-center">
                  <input
                    type="number"
                    value={cycleIncomeValue}
                    onChange={(e) => setCycleIncomeValue(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs font-sans font-bold text-charcoal text-center focus:outline-none w-20"
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCycleIncome()}
                    onBlur={handleSaveCycleIncome}
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleSaveCycleIncome}
                    className="bg-charcoal p-1 rounded-lg text-white active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    <Check className="h-3 w-3" strokeWidth={2} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span 
                    onDoubleClick={handleStartEditCycleIncome}
                    className="font-sans text-xs text-charcoal font-extrabold cursor-pointer transition-colors"
                    title="Double click to edit Base Income"
                  >
                    Rs. {cycleBaseIncome.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={handleStartEditCycleIncome}
                    className="p-1 text-sage transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
                    title="Edit Base Income"
                  >
                    <Pencil className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
              <span className="text-sage block font-bold uppercase tracking-wider text-[8px] mb-1">Total Spent</span>
              <span className="font-sans text-xs text-rose-500 font-extrabold mt-1.5 block">Rs. {cycleExpenses.toLocaleString()}</span>
            </div>
            <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
              <span className="text-sage block font-bold uppercase tracking-wider text-[8px] mb-1">Remaining</span>
              <span className="font-sans text-xs text-charcoal font-extrabold mt-1.5 block">Rs. {remainingCycleBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-sage font-bold uppercase tracking-wider">
              <span>Day Cycle Budget Used</span>
              <span>{expensePercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 w-full bg-slate-200/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-amber-400 transition-all duration-500 rounded-full" 
                style={{ width: `${Math.min(expensePercent, 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Dynamic Daily Spent Accordions */}
        <div className="space-y-3 mt-4">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-sage">Daily Spent Ledger</h4>
          {sortedCycleDates.length === 0 ? (
            <p className="text-xs text-sage italic text-center py-6 bg-slate-50 border border-slate-100 rounded-2xl">No transactions logged in this cycle</p>
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
                  <div key={dateStr} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-200">
                    {/* Date Row Header */}
                    <button
                      type="button"
                      onClick={() => toggleCycleDate(dateStr)}
                      className="w-full flex justify-between items-center min-h-[48px] px-4 py-3 text-xs font-bold transition-all text-charcoal active:scale-[0.99] cursor-pointer"
                    >
                      <span>{displayDate}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sage">Spent: <span className="text-charcoal font-bold">Rs. {dailySpent.toLocaleString()}</span></span>
                        <ChevronDown className={`h-4 w-4 text-sage transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                      </div>
                    </button>

                    {/* Expandable Panel */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-3 space-y-3 bg-slate-50/50">
                        {items.map(t => {
                          const isExpense = t.type === 'expense';
                          const isBank = t.description.startsWith('[Bank]');
                          const isOption = t.description.startsWith('[Option]');
                          
                          let descClean = t.description;
                          if (descClean.startsWith('[Bank]')) descClean = descClean.replace('[Bank]', '').trim();
                          if (descClean.startsWith('[Hand]')) descClean = descClean.replace('[Hand]', '').trim();
                          if (descClean.startsWith('[Option]')) descClean = descClean.replace('[Option]', '').trim();

                          return (
                            <div 
                              key={t.id} 
                              className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 transition-all duration-200 group/item text-left"
                            >
                              {/* Avatar */}
                              {getTransactionAvatar(t.category, t.description, t.type)}

                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[8px] uppercase px-1.5 py-0.5 rounded-full font-bold ${
                                    isBank 
                                      ? 'bg-blue-50 text-blue-600 border border-blue-100/50' 
                                      : isOption
                                        ? 'bg-purple-50 text-purple-600 border border-purple-100/50'
                                        : 'bg-amber-50 text-amber-600 border border-amber-100/50'
                                  }`}>
                                    {isBank ? 'Bank' : isOption ? 'Option' : 'Hand'}
                                  </span>
                                  <span className="text-[9px] text-sage font-semibold">{t.category}</span>
                                </div>
                                <p className="text-xs font-semibold text-charcoal mt-1 leading-tight">{descClean}</p>
                              </div>
                              
                              {/* Amount & Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className={`font-sans text-xs font-black mr-2 ${isExpense ? 'text-rose-500' : 'text-emerald-600'}`}>
                                  {isExpense ? '-' : '+'}Rs. {Math.abs(t.amount).toLocaleString()}
                                </span>
                                
                                <button
                                  onClick={() => handleStartEditTransaction(t)}
                                  className="p-1.5 text-sage rounded-full transition-colors active:scale-90 cursor-pointer flex items-center justify-center"
                                  title="Edit transaction"
                                >
                                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteTransaction(t.id)}
                                  className="p-1.5 text-sage rounded-full transition-colors active:scale-90 cursor-pointer flex items-center justify-center"
                                  title="Delete transaction"
                                >
                                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
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

        {/* Divided Closeout Simulator */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/50 space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-200/50 pb-2.5">
            <Sparkles className="h-4.5 w-4.5 text-champagne" strokeWidth={1.75} />
            <span className="text-xs font-bold text-charcoal">Simulator & Cycle Controls</span>
          </div>

          {/* Action 1: Sweep Leftover Cash */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-sage font-bold block">1. Sweep Leftover Cash</span>
            <div className="flex border border-slate-200 dark:border-slate-750 rounded-xl p-1 bg-white dark:bg-[#1B2623] shadow-sm">
              <button
                type="button"
                onClick={() => setCloseoutSweepBank('wallet-bank')}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all min-h-[32px] active:scale-95 cursor-pointer ${
                  closeoutSweepBank === 'wallet-bank'
                    ? 'bg-black text-white dark:bg-[#4DB6AC] dark:text-[#0F1916] shadow-sm font-extrabold'
                    : 'text-sage'
                }`}
              >
                Bank Money
              </button>
              <button
                type="button"
                onClick={() => {
                  const firstSavingId = savings.find(s => s.id !== 'wallet-bank' && s.id !== 'wallet-hand' && s.id !== 'wallet-option')?.id || 's-1';
                  setCloseoutSweepBank(firstSavingId);
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all min-h-[32px] active:scale-95 cursor-pointer ${
                  closeoutSweepBank !== 'wallet-bank'
                    ? 'bg-black text-white dark:bg-[#4DB6AC] dark:text-[#0F1916] shadow-sm font-extrabold'
                    : 'text-sage'
                }`}
              >
                Saving Money
              </button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-sage font-bold">Rs.</span>
                <input
                  type="number"
                  value={closeoutSweepAmount}
                  onChange={(e) => setCloseoutSweepAmount(e.target.value)}
                  className="w-full bg-white dark:bg-[#1B2623] border border-slate-205 dark:border-slate-750 rounded-xl pl-8 pr-3 py-2 text-xs font-sans text-charcoal dark:text-white focus:outline-none shadow-sm"
                  placeholder="Sweep Amount"
                />
              </div>
              <button
                type="button"
                onClick={handlePerformInlineSweep}
                className="bg-black dark:bg-[#4DB6AC] text-white dark:text-[#0F1916] px-4 py-2 rounded-xl text-xs font-bold active:scale-[0.98] cursor-pointer shadow-sm"
              >
                Sweep
              </button>
            </div>
          </div>

          {/* Action 2: Start Next Day Cycle */}
          <div className="space-y-2 pt-3 border-t border-slate-200/50">
            <span className="text-[10px] uppercase tracking-wider text-sage font-bold block">2. Start Next Day Cycle</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="date"
                value={nextCycleStartInput}
                onChange={(e) => setNextCycleStartInput(e.target.value)}
                className="w-full bg-white dark:bg-[#1B2623] border border-slate-205 dark:border-slate-750 rounded-xl px-3 py-2 text-xs font-sans text-charcoal dark:text-white focus:outline-none shadow-sm"
                aria-label="Base income date"
              />
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-sage font-bold">Rs.</span>
                <input
                  type="number"
                  value={nextCycleIncomeInput}
                  onChange={(e) => setNextCycleIncomeInput(e.target.value)}
                  className="w-full bg-white dark:bg-[#1B2623] border border-slate-205 dark:border-slate-750 rounded-xl pl-8 pr-3 py-2 text-xs font-sans text-charcoal dark:text-white focus:outline-none shadow-sm"
                  placeholder="Starting Income"
                />
              </div>
              <button
                type="button"
                onClick={handlePerformInlineStartNewCycle}
                className="bg-black dark:bg-[#4DB6AC] text-white dark:text-[#0F1916] px-4 py-2 rounded-xl text-xs font-bold active:scale-[0.98] cursor-pointer shadow-sm"
              >
                Start
              </button>
            </div>
          </div>
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
        const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        // Prefix YYYY-MM
        const year = d.getFullYear();
        const monthNum = String(d.getMonth() + 1).padStart(2, '0');
        const prefix = `${year}-${monthNum}`;
        list.push({ label, prefix });
      }
      return list;
    };

    const lastThreeMonths = getLastThreeMonths();
    const todayLabel = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
      <div className="glass-panel p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold tracking-wider uppercase text-charcoal">Monthly History</h3>
          <span className="text-[9px] text-sage font-bold bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/50">
            Archived Ledgers
          </span>
        </div>

        <div className="space-y-4">
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
      .filter(t => t.type === 'income' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthExpenses = monthTransactions
      .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
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
      <div key={monthName} className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all duration-300">
        
        {/* Accordion Header */}
        <button
          type="button"
          onClick={() => toggleMonth(monthName)}
          className="w-full flex items-center justify-between min-h-[48px] px-4 py-3 text-xs font-bold transition-all text-charcoal active:scale-[0.99] cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-sage" strokeWidth={1.75} />
            <span>{monthName}</span>
            {isCurrentMonth && (
              <span className="text-[8px] uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full ml-1 font-sans font-bold">
                Active
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-sage" strokeWidth={2} /> : <ChevronDown className="h-4.5 w-4.5 text-sage" strokeWidth={2} />}
        </button>

        {/* Accordion Body */}
        {isExpanded && (
          <div className="p-4 border-t border-slate-100 space-y-5 text-xs bg-slate-50/50">
            
            {/* Top metrics summary */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
                <span className="text-[8px] uppercase tracking-wider text-sage font-bold block mb-1">Total Income</span>
                <span className="font-sans text-xs text-charcoal font-extrabold block mt-0.5">{formatCurrency(monthIncome)}</span>
              </div>
              <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
                <span className="text-[8px] uppercase tracking-wider text-sage font-bold block mb-1">Total Spent</span>
                <span className="font-sans text-xs text-rose-500 font-extrabold block mt-0.5">{formatCurrency(monthExpenses)}</span>
              </div>
              <div className="bg-white border border-slate-100 p-2.5 rounded-xl shadow-sm">
                <span className="text-[8px] uppercase tracking-wider text-sage font-bold block mb-1">Saved Sweeps</span>
                <span className="font-sans text-xs text-emerald-600 font-extrabold block mt-0.5">{formatCurrency(monthSweeps)}</span>
              </div>
            </div>

            {/* Spending Outlay */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[8px] uppercase tracking-wider text-sage font-bold block">Spending Outlay</span>
              
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white border border-slate-100 p-3 rounded-xl flex flex-col justify-between shadow-sm">
                  <span className="text-[9px] text-sage font-bold uppercase tracking-wider">Food & Groceries</span>
                  <span className="font-sans text-xs font-extrabold text-charcoal mt-1">{formatCurrency(foodExpenses)}</span>
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-xl flex flex-col justify-between shadow-sm">
                  <span className="text-[9px] text-sage font-bold uppercase tracking-wider">Commutes & Highway</span>
                  <span className="font-sans text-xs font-extrabold text-charcoal mt-1">{formatCurrency(travelExpenses)}</span>
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-xl flex flex-col justify-between shadow-sm">
                  <span className="text-[9px] text-sage font-bold uppercase tracking-wider">Rent & Utility Bills</span>
                  <span className="font-sans text-xs font-extrabold text-charcoal mt-1">{formatCurrency(rentUtilityExpenses)}</span>
                </div>
                <div className="bg-white border border-slate-100 p-3 rounded-xl flex flex-col justify-between shadow-sm">
                  <span className="text-[9px] text-sage font-bold uppercase tracking-wider">General / Other</span>
                  <span className="font-sans text-xs font-extrabold text-charcoal mt-1">{formatCurrency(generalExpenses)}</span>
                </div>
              </div>
            </div>

            {/* DIRECT DATE TIMELINE ACCORDION */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <span className="text-[8px] uppercase tracking-wider text-sage font-bold block">Date Timeline</span>
              
              {sortedDates.length === 0 ? (
                <p className="text-xs text-sage italic text-center py-2 bg-white border border-slate-100 rounded-xl">No transactions recorded</p>
              ) : (
                <div className="space-y-2">
                  {sortedDates.map(dateStr => {
                    const dayItems = groupedByDate[dateStr];
                    const dateKey = `${monthName}-${dateStr}`;
                    const isDateExpanded = !!expandedMonthlyDates[dateKey];
                    const daySpent = dayItems
                      .filter(t => t.type === 'expense' && t.category !== 'Savings Sweep' && t.category !== 'Debt' && t.category !== 'Debt Settlement')
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                    
                    const dateParts = dateStr.split('-');
                    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : dateStr;

                    return (
                      <div key={dateStr} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => setExpandedMonthlyDates(prev => ({ ...prev, [dateKey]: !isDateExpanded }))}
                          className="w-full flex justify-between items-center min-h-[40px] px-3 py-2.5 text-[10px] transition-all text-charcoal font-bold active:scale-[0.99] cursor-pointer"
                        >
                          <span>{formattedDate}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sage">Spent: <span className="text-charcoal font-bold">{formatCurrency(daySpent)}</span></span>
                            <ChevronDown className={`h-3 w-3 text-sage transition-transform duration-200 ${isDateExpanded ? 'rotate-180' : ''}`} strokeWidth={2} />
                          </div>
                        </button>

                        {isDateExpanded && (
                          <div className="border-t border-slate-100 p-2 space-y-2 bg-slate-50/50">
                            {dayItems.map(t => {
                              const isExpense = t.type === 'expense';
                              const isBank = t.description.startsWith('[Bank]');
                              const isOption = t.description.startsWith('[Option]');
                              const sourceLabel = isBank ? 'Bank' : isOption ? 'Option' : 'Hand';
                              
                              let descClean = t.description;
                              if (descClean.startsWith('[Bank]')) descClean = descClean.replace('[Bank]', '').trim();
                              if (descClean.startsWith('[Hand]')) descClean = descClean.replace('[Hand]', '').trim();
                              if (descClean.startsWith('[Option]')) descClean = descClean.replace('[Option]', '').trim();

                              const isSwiped = swipedTransactionId === t.id;

                              return (
                                <div 
                                  key={t.id} 
                                  onTouchStart={handleItemTouchStart}
                                  onTouchMove={(e) => handleItemTouchMove(e, t.id)}
                                  onTouchEnd={handleItemTouchEnd}
                                  onMouseDown={handleItemMouseDown}
                                  onMouseMove={(e) => handleItemMouseMove(e, t.id)}
                                  onMouseUp={handleItemMouseUp}
                                  onMouseLeave={handleItemMouseUp}
                                  className="relative overflow-hidden rounded-xl border border-slate-100 bg-white select-none"
                                >
                                  {/* Action Buttons underneath */}
                                  <div 
                                    className="absolute right-0 top-0 bottom-0 flex items-center bg-slate-50 dark:bg-[#1B2623] transition-all duration-305 z-10"
                                    style={{
                                      width: isSwiped ? '80px' : '0px',
                                      opacity: isSwiped ? 1 : 0,
                                      overflow: 'hidden'
                                    }}
                                  >
                                    <div className="flex items-center justify-center w-full h-full gap-2 px-1">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleStartEditTransaction(t);
                                          setSwipedTransactionId(null);
                                        }}
                                        className="p-1.5 text-sage hover:text-charcoal dark:hover:text-white rounded-full transition-all active:scale-90 cursor-pointer flex items-center justify-center bg-white dark:bg-[#22302C] shadow-sm border border-slate-100 dark:border-slate-800"
                                        title="Edit transaction"
                                      >
                                        <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleDeleteTransaction(t.id);
                                          setSwipedTransactionId(null);
                                        }}
                                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-full transition-all active:scale-90 cursor-pointer flex items-center justify-center bg-white dark:bg-[#22302C] shadow-sm border border-slate-100 dark:border-slate-800"
                                        title="Delete transaction"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Main Content Row */}
                                  <div 
                                    className="flex items-center gap-3 p-2.5 transition-transform duration-305 text-left text-[10px]"
                                    style={{
                                      transform: isSwiped ? 'translateX(-80px)' : 'translateX(0px)'
                                    }}
                                  >
                                    {/* Avatar */}
                                    {getTransactionAvatar(t.category, t.description, t.type)}

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className={`text-[7px] uppercase px-1 py-0.2 rounded font-bold ${
                                          isBank 
                                            ? 'bg-blue-50 text-blue-600 border border-blue-100/50' 
                                            : isOption
                                              ? 'bg-purple-50 text-purple-600 border border-purple-100/50'
                                              : 'bg-amber-50 text-amber-600 border border-amber-100/50'
                                        }`}>
                                          {sourceLabel}
                                        </span>
                                        <span className="text-[8px] text-sage font-semibold">{t.category}</span>
                                      </div>
                                      <p className="text-[11px] font-semibold text-charcoal mt-0.5 leading-tight">{descClean}</p>
                                    </div>
                                    <span className={`font-sans text-[11px] font-black flex-shrink-0 ${isExpense ? 'text-rose-500' : 'text-emerald-600'} mr-1`}>
                                      {isExpense ? '-' : '+'}{formatCurrency(Math.abs(t.amount))}
                                    </span>
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

            {/* Print statement button */}
            <button
              onClick={() => handlePrintMonthlyStatement(monthName)}
              className="w-full bg-black border-none min-h-[44px] rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all mt-3 active:scale-[0.98] cursor-pointer shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" strokeWidth={2} />
              <span>Download Statement PDF</span>
            </button>

          </div>
        )}

      </div>
    );
  }
}
