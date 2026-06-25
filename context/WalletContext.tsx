'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Cycle, Transaction, Debt, SavingsBank } from '../supabase-types';

const client = supabase as any;

export interface MonthlyHistory {
  monthYear: string;
  income: number;
  savings: number;
  categories: {
    Food: number;
    Travel: number;
    Rent: number;
    Electricity: number;
    General: number;
  };
}

interface WalletContextType {
  cycles: Cycle[];
  transactions: Transaction[];
  debts: Debt[];
  savings: SavingsBank[];
  historicalMonths: MonthlyHistory[];
  loading: boolean;
  activeCycle: Cycle | null;
  expectedLiquidBalance: number;
  netWorth: number;
  bankMoney: number;
  handMoney: number;
  savingMoney: number;
  optionMoney: number;
  updateWalletBalance: (id: string, amount: number) => Promise<void>;
  addExpense: (amount: number, description: string, category: string, date: string, source?: 'hand' | 'bank') => Promise<void>;
  addIncome: (amount: number, description: string, startDate: string, endDate: string) => Promise<void>;
  addWithdrawal: (amount: number, date: string) => Promise<void>;
  addDebt: (amount: number, personName: string, type: 'lent' | 'borrowed', description: string) => Promise<void>;
  settleDebt: (debtId: string, settleAmount: number) => Promise<void>;
  reconcileCash: (actualCash: number) => Promise<void>;
  incrementCommute: (category: 'Travel (Colombo)' | 'Travel (Home)', cost: number) => Promise<void>;
  decrementCommute: (category: 'Travel (Colombo)' | 'Travel (Home)') => Promise<void>;
  depositToSavings: (bankId: string, amount: number) => Promise<void>;
  closeActiveCycleAndSweep: (sweepAmount: number, bankId: string, nextCycleIncome: number, nextCycleStart: string, nextCycleEnd: string) => Promise<void>;
  updateActiveCycleIncome: (amount: number) => Promise<void>;
  editTransaction: (id: string, amount: number, description: string, category: string, source: 'hand' | 'bank') => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  resetToMocks: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const MOCK_CYCLES: Cycle[] = [];

const MOCK_TRANSACTIONS: Transaction[] = [];

const MOCK_DEBTS: Debt[] = [];

const MOCK_SAVINGS: SavingsBank[] = [
  {
    id: 'wallet-bank',
    name: 'Bank Money',
    current_balance: 0,
    target_goal: 0,
    created_at: new Date('2026-06-01T00:00:00Z').toISOString(),
  },
  {
    id: 'wallet-hand',
    name: 'Hand Money',
    current_balance: 0,
    target_goal: 0,
    created_at: new Date('2026-06-01T00:00:00Z').toISOString(),
  },
  {
    id: 'wallet-option',
    name: 'Option Money',
    current_balance: 0,
    target_goal: 0,
    created_at: new Date('2026-06-01T00:00:00Z').toISOString(),
  }
];

const MOCK_HISTORICAL_MONTHS: MonthlyHistory[] = [];

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savings, setSavings] = useState<SavingsBank[]>([]);
  const [historicalMonths, setHistoricalMonths] = useState<MonthlyHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Initial Data
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      
      const localHistory = typeof window !== 'undefined' ? localStorage.getItem('vault_historical_months') : null;
      setHistoricalMonths(localHistory ? JSON.parse(localHistory) : []);

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data: cyclesData } = await client.from('cycles').select('*').order('created_at', { ascending: false });
          const { data: transData } = await client.from('transactions').select('*').order('created_at', { ascending: false });
          const { data: debtsData } = await client.from('debts').select('*').order('created_at', { ascending: false });
          const { data: savingsData } = await client.from('savings_vault').select('*').order('created_at', { ascending: true });

          let fetchedCycles = cyclesData || [];
          let fetchedTrans = transData || [];
          let fetchedDebts = debtsData || [];
          let fetchedSavings = savingsData || [];

          // Ensure the 3 core wallets exist in the database (since they are required for transaction offsets)
          const hasBank = fetchedSavings.some((s: any) => s.id === 'wallet-bank');
          const hasHand = fetchedSavings.some((s: any) => s.id === 'wallet-hand');
          const hasOption = fetchedSavings.some((s: any) => s.id === 'wallet-option');
          
          if (!hasBank || !hasHand || !hasOption) {
            const missingWallets = [];
            if (!hasBank) missingWallets.push({ id: 'wallet-bank', name: 'Bank Money', current_balance: 0, target_goal: 0, created_at: new Date().toISOString() });
            if (!hasHand) missingWallets.push({ id: 'wallet-hand', name: 'Hand Money', current_balance: 0, target_goal: 0, created_at: new Date().toISOString() });
            if (!hasOption) missingWallets.push({ id: 'wallet-option', name: 'Option Money', current_balance: 0, target_goal: 0, created_at: new Date().toISOString() });
            
            await client.from('savings_vault').insert(missingWallets);
            
            // Re-fetch
            const { data: sData } = await client.from('savings_vault').select('*').order('created_at', { ascending: true });
            fetchedSavings = sData || [];
          }

          setCycles(fetchedCycles);
          setTransactions(fetchedTrans);
          setDebts(fetchedDebts);
          setSavings(fetchedSavings);
        } catch (e) {
          console.error("Supabase load error, falling back to LocalStorage:", e);
          loadFromLocalStorage();
        }
      } else {
        loadFromLocalStorage();
      }
      setLoading(false);
    };

    initData();
  }, []);

  const loadFromLocalStorage = () => {
    if (typeof window === 'undefined') return;

    const localCycles = localStorage.getItem('vault_cycles');
    const localTransactions = localStorage.getItem('vault_transactions');
    const localDebts = localStorage.getItem('vault_debts');
    const localSavings = localStorage.getItem('vault_savings');
    const localHistory = localStorage.getItem('vault_historical_months');

    if (localCycles && localTransactions && localDebts && localSavings) {
      setCycles(JSON.parse(localCycles));
      setTransactions(JSON.parse(localTransactions));
      setDebts(JSON.parse(localDebts));
      setSavings(JSON.parse(localSavings));
    } else {
      const defaultSavings = [
        { id: 'wallet-bank', name: 'Bank Money', current_balance: 0, target_goal: 0, created_at: new Date().toISOString() },
        { id: 'wallet-hand', name: 'Hand Money', current_balance: 0, target_goal: 0, created_at: new Date().toISOString() },
        { id: 'wallet-option', name: 'Option Money', current_balance: 0, target_goal: 0, created_at: new Date().toISOString() }
      ];
      localStorage.setItem('vault_cycles', JSON.stringify([]));
      localStorage.setItem('vault_transactions', JSON.stringify([]));
      localStorage.setItem('vault_debts', JSON.stringify([]));
      localStorage.setItem('vault_savings', JSON.stringify(defaultSavings));
      localStorage.setItem('vault_historical_months', JSON.stringify([]));

      setCycles([]);
      setTransactions([]);
      setDebts([]);
      setSavings(defaultSavings);
    }
    setHistoricalMonths(localHistory ? JSON.parse(localHistory) : []);
  };

  const saveStateToLocal = (
    newCycles: Cycle[],
    newTrans: Transaction[],
    newDebts: Debt[],
    newSavings: SavingsBank[],
    newHistory: MonthlyHistory[] = historicalMonths
  ) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('vault_cycles', JSON.stringify(newCycles));
    localStorage.setItem('vault_transactions', JSON.stringify(newTrans));
    localStorage.setItem('vault_debts', JSON.stringify(newDebts));
    localStorage.setItem('vault_savings', JSON.stringify(newSavings));
    localStorage.setItem('vault_historical_months', JSON.stringify(newHistory));
  };

  // Find Active Cycle
  const getActiveCycle = (): Cycle | null => {
    if (cycles.length === 0) return null;
    return cycles[0];
  };

  const activeCycle = getActiveCycle();

  // Extract 4 main wallet entities
  const bankMoneyObj = savings.find(s => s.id === 'wallet-bank');
  const handMoneyObj = savings.find(s => s.id === 'wallet-hand');
  const optionMoneyObj = savings.find(s => s.id === 'wallet-option');

  const bankMoney = bankMoneyObj ? bankMoneyObj.current_balance : 0;
  const handMoney = handMoneyObj ? handMoneyObj.current_balance : 0;
  const optionMoney = optionMoneyObj ? optionMoneyObj.current_balance : 0;

  const savingMoney = savings
    .filter(s => s.id !== 'wallet-bank' && s.id !== 'wallet-hand' && s.id !== 'wallet-option')
    .reduce((sum, s) => sum + s.current_balance, 0);

  // Net Worth = Hand Money + Saving Money
  const netWorth = handMoney + savingMoney;

  // Expected Liquid Cash = handMoney
  const expectedLiquidBalance = handMoney;

  // Update specific wallet balance
  const updateWalletBalance = async (id: string, amount: number) => {
    const updatedSavings = savings.map(s => s.id === id ? { ...s, current_balance: amount } : s);
    setSavings(updatedSavings);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('savings_vault').update({ current_balance: amount } as any).eq('id', id);
      } catch (err) {
        console.error("Failed to update wallet in Supabase:", err);
      }
    }
    saveStateToLocal(cycles, transactions, debts, updatedSavings);
  };

  // Log expense (deducts from Hand Money by default, or Bank Money if specified)
  const addExpense = async (amount: number, description: string, category: string, date: string, source: 'hand' | 'bank' = 'hand') => {
    if (!activeCycle) return;

    const isBank = source === 'bank';
    const walletId = isBank ? 'wallet-bank' : 'wallet-hand';

    const currentWalletObj = savings.find(s => s.id === walletId);
    const newWalletBalance = (currentWalletObj ? currentWalletObj.current_balance : 0) - amount;

    const updatedSavings = savings.map(s => s.id === walletId ? { ...s, current_balance: newWalletBalance } : s);
    setSavings(updatedSavings);

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      cycle_id: activeCycle.id,
      amount: -Math.abs(amount), // Negative for expense
      type: 'expense',
      category: category as any,
      description: `[${source === 'bank' ? 'Bank' : 'Hand'}] ${description}`,
      date,
      created_at: new Date().toISOString(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('savings_vault').update({ current_balance: newWalletBalance } as any).eq('id', walletId);
        await client.from('transactions').insert(newTransaction as any);
      } catch (err) {
        console.error("Supabase insert expense error:", err);
      }
    }

    saveStateToLocal(cycles, updatedTransactions, debts, updatedSavings);
  };

  // Add Income (increases Bank Money)
  const addIncome = async (amount: number, description: string, startDate: string, endDate: string) => {
    const newCycle: Cycle = {
      id: Math.random().toString(36).substring(2, 9),
      start_date: startDate,
      end_date: endDate,
      income: amount,
      description: description || 'New Cycle Ledger',
      created_at: new Date().toISOString(),
    };

    const currentBankObj = savings.find(s => s.id === 'wallet-bank');
    const newBankBalance = (currentBankObj ? currentBankObj.current_balance : 50000) + amount;
    
    // Bank Money increases, Hand Money is initialized equal to Base Income
    const updatedSavings = savings.map(s => {
      if (s.id === 'wallet-bank') return { ...s, current_balance: newBankBalance };
      if (s.id === 'wallet-hand') return { ...s, current_balance: amount };
      return s;
    });
    setSavings(updatedSavings);

    const incomeTrans: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      cycle_id: newCycle.id,
      amount,
      type: 'income',
      category: 'Cycle Income',
      description: description || 'Cycle Base Income',
      date: startDate,
      created_at: new Date().toISOString()
    };

    const updatedTransactions = [incomeTrans, ...transactions];
    const updatedCycles = [newCycle, ...cycles];
    
    setCycles(updatedCycles);
    setTransactions(updatedTransactions);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('cycles').insert(newCycle as any);
        await client.from('savings_vault').update({ current_balance: newBankBalance } as any).eq('id', 'wallet-bank');
        await client.from('savings_vault').update({ current_balance: amount } as any).eq('id', 'wallet-hand');
        await client.from('transactions').insert(incomeTrans as any);
      } catch (err) {
        console.error("Supabase addIncome error:", err);
      }
    }

    saveStateToLocal(updatedCycles, updatedTransactions, debts, updatedSavings);
  };

  // Dedicated Cash Withdrawal (Deducts Bank Money, Increases Hand Money)
  const addWithdrawal = async (amount: number, date: string) => {
    if (!activeCycle) return;

    const currentBankObj = savings.find(s => s.id === 'wallet-bank');
    const currentHandObj = savings.find(s => s.id === 'wallet-hand');

    const newBankBalance = (currentBankObj ? currentBankObj.current_balance : 50000) - amount;
    const newHandBalance = (currentHandObj ? currentHandObj.current_balance : 15000) + amount;

    const updatedSavings = savings.map(s => {
      if (s.id === 'wallet-bank') return { ...s, current_balance: newBankBalance };
      if (s.id === 'wallet-hand') return { ...s, current_balance: newHandBalance };
      return s;
    });
    setSavings(updatedSavings);

    const withdrawalTrans: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      cycle_id: activeCycle.id,
      amount: -amount,
      type: 'expense',
      category: 'General',
      description: `[Withdrawal] Cash from Bank`,
      date,
      created_at: new Date().toISOString()
    };

    const updatedTransactions = [withdrawalTrans, ...transactions];
    setTransactions(updatedTransactions);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('savings_vault').update({ current_balance: newBankBalance } as any).eq('id', 'wallet-bank');
        await client.from('savings_vault').update({ current_balance: newHandBalance } as any).eq('id', 'wallet-hand');
        await client.from('transactions').insert(withdrawalTrans as any);
      } catch (err) {
        console.error("Supabase withdrawal error:", err);
      }
    }

    saveStateToLocal(cycles, updatedTransactions, debts, updatedSavings);
  };

  // Add Debt (receivable/payable)
  const addDebt = async (amount: number, personName: string, type: 'lent' | 'borrowed', description: string) => {
    const finalAmount = type === 'lent' ? Math.abs(amount) : -Math.abs(amount);
    
    const newDebt: Debt = {
      id: Math.random().toString(36).substring(2, 9),
      person_name: personName,
      amount: finalAmount,
      type,
      description: description || null,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('debts').insert(newDebt as any);
      } catch (err) {
        console.error("Supabase debt insert error:", err);
      }
    }

    const updated = [newDebt, ...debts];
    setDebts(updated);
    saveStateToLocal(cycles, transactions, updated, savings);
  };

  // Settle Debt (increases Hand Money if they pay us back; decreases Hand Money if we pay them)
  const settleDebt = async (debtId: string, settleAmount: number) => {
    const debt = debts.find(d => d.id === debtId);
    if (!debt || !activeCycle) return;

    const isLent = debt.amount > 0;
    const transAmount = isLent ? Math.abs(settleAmount) : -Math.abs(settleAmount);
    
    const settlementTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      cycle_id: activeCycle.id,
      amount: transAmount,
      type: isLent ? 'income' : 'expense',
      category: 'Debt Settlement',
      description: `Settled Debt with ${debt.person_name}`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    const newDebtAmount = isLent ? debt.amount - Math.abs(settleAmount) : debt.amount + Math.abs(settleAmount);
    
    // Adjust hand wallet
    const currentHandObj = savings.find(s => s.id === 'wallet-hand');
    const newHandBalance = (currentHandObj ? currentHandObj.current_balance : 15000) + transAmount;
    
    const updatedSavings = savings.map(s => s.id === 'wallet-hand' ? { ...s, current_balance: newHandBalance } : s);
    setSavings(updatedSavings);

    let updatedDebts = [...debts];
    if (Math.abs(newDebtAmount) < 1) {
      updatedDebts = updatedDebts.filter(d => d.id !== debtId);
    } else {
      updatedDebts = updatedDebts.map(d => d.id === debtId ? { ...d, amount: newDebtAmount } : d);
    }

    const updatedTrans = [settlementTransaction, ...transactions];
    setDebts(updatedDebts);
    setTransactions(updatedTrans);

    if (isSupabaseConfigured() && supabase) {
      try {
        if (Math.abs(newDebtAmount) < 1) {
          await client.from('debts').delete().eq('id', debtId);
        } else {
          await client.from('debts').update({ amount: newDebtAmount } as any).eq('id', debtId);
        }
        await client.from('savings_vault').update({ current_balance: newHandBalance } as any).eq('id', 'wallet-hand');
        await client.from('transactions').insert(settlementTransaction as any);
      } catch (err) {
        console.error("Supabase debt settlement failed:", err);
      }
    }

    saveStateToLocal(cycles, updatedTrans, updatedDebts, updatedSavings);
  };

  // Reconcile / Adjust cash in hand
  const reconcileCash = async (actualCash: number) => {
    if (!activeCycle) return;
    
    const discrepancy = actualCash - handMoney;
    if (Math.abs(discrepancy) < 0.01) return;

    const newTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      cycle_id: activeCycle.id,
      amount: discrepancy,
      type: discrepancy < 0 ? 'expense' : 'income',
      category: 'Adjustment',
      description: `System Adjustment (Discrepancy: ${discrepancy > 0 ? '+' : ''}Rs. ${discrepancy.toLocaleString()})`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    const updatedSavings = savings.map(s => s.id === 'wallet-hand' ? { ...s, current_balance: actualCash } : s);
    setSavings(updatedSavings);

    const updatedTrans = [newTransaction, ...transactions];
    setTransactions(updatedTrans);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('savings_vault').update({ current_balance: actualCash } as any).eq('id', 'wallet-hand');
        await client.from('transactions').insert(newTransaction as any);
      } catch (err) {
        console.error("Supabase adjustment error:", err);
      }
    }

    saveStateToLocal(cycles, updatedTrans, debts, updatedSavings);
  };

  // Increment commuter transport logistics
  const incrementCommute = async (category: 'Travel (Colombo)' | 'Travel (Home)', cost: number) => {
    if (!activeCycle) return;
    await addExpense(cost, `${category} ride`, category, new Date().toISOString().split('T')[0], 'hand');
  };

  // Decrement commuter logistics
  const decrementCommute = async (category: 'Travel (Colombo)' | 'Travel (Home)') => {
    const commuteTrans = transactions.find(t => t.cycle_id === activeCycle?.id && t.category === category);
    if (commuteTrans) {
      const refundAmt = Math.abs(commuteTrans.amount);
      const currentHand = savings.find(s => s.id === 'wallet-hand');
      const newHandBalance = (currentHand ? currentHand.current_balance : 15000) + refundAmt;
      const updatedSavings = savings.map(s => s.id === 'wallet-hand' ? { ...s, current_balance: newHandBalance } : s);
      
      setSavings(updatedSavings);
      const updated = transactions.filter(t => t.id !== commuteTrans.id);
      setTransactions(updated);

      if (isSupabaseConfigured() && supabase) {
        try {
          await client.from('transactions').delete().eq('id', commuteTrans.id);
          await client.from('savings_vault').update({ current_balance: newHandBalance } as any).eq('id', 'wallet-hand');
        } catch (err) {
          console.error("Supabase decrement commute failed:", err);
        }
      }

      saveStateToLocal(cycles, updated, debts, updatedSavings);
    }
  };

  // Deposit from Hand Money to a specific Saving bank goal
  const depositToSavings = async (bankId: string, amount: number) => {
    const bank = savings.find(s => s.id === bankId);
    if (!bank || !activeCycle) return;

    const newBalance = bank.current_balance + amount;
    const newHandBalance = handMoney - amount;

    const updatedSavings = savings.map(s => {
      if (s.id === bankId) return { ...s, current_balance: newBalance };
      if (s.id === 'wallet-hand') return { ...s, current_balance: newHandBalance };
      return s;
    });
    setSavings(updatedSavings);

    const sweepTransaction: Transaction = {
      id: Math.random().toString(36).substring(2, 9),
      cycle_id: activeCycle.id,
      amount: -Math.abs(amount),
      type: 'expense',
      category: 'Savings Sweep',
      description: `Sweep to ${bank.name}`,
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };

    const updatedTrans = [sweepTransaction, ...transactions];
    setTransactions(updatedTrans);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('savings_vault').update({ current_balance: newBalance } as any).eq('id', bankId);
        await client.from('savings_vault').update({ current_balance: newHandBalance } as any).eq('id', 'wallet-hand');
        await client.from('transactions').insert(sweepTransaction as any);
      } catch (err) {
        console.error("Supabase savings sweep failed:", err);
      }
    }

    saveStateToLocal(cycles, updatedTrans, debts, updatedSavings);
  };

  // Close cycle rollover and sweep cash
  const closeActiveCycleAndSweep = async (
    sweepAmount: number,
    bankId: string,
    nextCycleIncome: number,
    nextCycleStart: string,
    nextCycleEnd: string
  ) => {
    if (!activeCycle) return;

    let updatedSavings = [...savings];
    let updatedTransactions = [...transactions];

    if (sweepAmount > 0) {
      const bank = savings.find(s => s.id === bankId);
      if (bank) {
        const newBalance = bank.current_balance + sweepAmount;
        const newHandBalance = handMoney - sweepAmount;

        updatedSavings = savings.map(s => {
          if (s.id === bankId) return { ...s, current_balance: newBalance };
          if (s.id === 'wallet-hand') return { ...s, current_balance: newHandBalance };
          return s;
        });

        const sweepTransaction: Transaction = {
          id: Math.random().toString(36).substring(2, 9),
          cycle_id: activeCycle.id,
          amount: -Math.abs(sweepAmount),
          type: 'expense',
          category: 'Savings Sweep',
          description: `Sweep to ${bank.name} (Close Cycle)`,
          date: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString(),
        };

        updatedTransactions = [sweepTransaction, ...transactions];

        if (isSupabaseConfigured() && supabase) {
          try {
            await client.from('savings_vault').update({ current_balance: newBalance } as any).eq('id', bankId);
            await client.from('transactions').insert(sweepTransaction as any);
          } catch (e) {
            console.error("Supabase closeActiveCycleAndSweep error:", e);
          }
        }
      }
    }

    const newCycle: Cycle = {
      id: Math.random().toString(36).substring(2, 9),
      start_date: nextCycleStart,
      end_date: nextCycleEnd,
      income: nextCycleIncome,
      description: `Active Cycle ${nextCycleStart.split('-')[2]}/${nextCycleStart.split('-')[1]}`,
      created_at: new Date().toISOString(),
    };

    // Set Hand Money equal to the next cycle's base income
    updatedSavings = updatedSavings.map(s => {
      if (s.id === 'wallet-hand') return { ...s, current_balance: nextCycleIncome };
      return s;
    });

    const updatedCycles = [newCycle, ...cycles];

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('savings_vault').update({ current_balance: nextCycleIncome } as any).eq('id', 'wallet-hand');
        await client.from('cycles').insert(newCycle as any);
      } catch (e) {
        console.error("Supabase cycle rollover savings_vault/cycle update error:", e);
      }
    }

    setSavings(updatedSavings);
    setTransactions(updatedTransactions);
    setCycles(updatedCycles);
    saveStateToLocal(updatedCycles, updatedTransactions, debts, updatedSavings);
  };

  // Update active cycle's base income and set Hand Money equal to it
  const updateActiveCycleIncome = async (amount: number) => {
    if (!activeCycle) return;

    const updatedCycles = cycles.map(c => c.id === activeCycle.id ? { ...c, income: amount } : c);
    setCycles(updatedCycles);

    const updatedSavings = savings.map(s => s.id === 'wallet-hand' ? { ...s, current_balance: amount } : s);
    setSavings(updatedSavings);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('cycles').update({ income: amount } as any).eq('id', activeCycle.id);
        await client.from('savings_vault').update({ current_balance: amount } as any).eq('id', 'wallet-hand');
      } catch (err) {
        console.error("Failed to update active cycle income in Supabase:", err);
      }
    }

    saveStateToLocal(updatedCycles, transactions, debts, updatedSavings);
  };

  // Edit/Adjust a transaction
  const editTransaction = async (
    id: string,
    amount: number,
    description: string,
    category: string,
    source: 'hand' | 'bank'
  ) => {
    const origTrans = transactions.find(t => t.id === id);
    if (!origTrans) return;

    const origIsBank = origTrans.description.startsWith('[Bank]');
    const origSource: 'hand' | 'bank' = origIsBank ? 'bank' : 'hand';
    const origAmount = Math.abs(origTrans.amount);

    let updatedSavings = [...savings];

    // Restore original wallet balance
    const origWalletId = origSource === 'bank' ? 'wallet-bank' : 'wallet-hand';
    const origWalletObj = savings.find(s => s.id === origWalletId);
    if (origWalletObj) {
      const restoredVal = origWalletObj.current_balance + origAmount;
      updatedSavings = updatedSavings.map(s => s.id === origWalletId ? { ...s, current_balance: restoredVal } : s);
    }

    // Charge the new wallet balance
    const newWalletId = source === 'bank' ? 'wallet-bank' : 'wallet-hand';
    const newWalletObj = updatedSavings.find(s => s.id === newWalletId);
    if (newWalletObj) {
      const chargedVal = newWalletObj.current_balance - amount;
      updatedSavings = updatedSavings.map(s => s.id === newWalletId ? { ...s, current_balance: chargedVal } : s);
    }

    setSavings(updatedSavings);

    // Clean description prefixes
    let cleanDesc = description;
    if (cleanDesc.startsWith('[Bank]')) cleanDesc = cleanDesc.replace('[Bank]', '').trim();
    if (cleanDesc.startsWith('[Hand]')) cleanDesc = cleanDesc.replace('[Hand]', '').trim();
    const finalDescription = `[${source === 'bank' ? 'Bank' : 'Hand'}] ${cleanDesc}`;

    const updatedTrans = transactions.map(t => {
      if (t.id === id) {
        return {
          ...t,
          amount: -Math.abs(amount),
          description: finalDescription,
          category: category as any
        };
      }
      return t;
    });
    setTransactions(updatedTrans);

    if (isSupabaseConfigured() && supabase) {
      try {
        const origWalletVal = updatedSavings.find(s => s.id === origWalletId)?.current_balance || 0;
        const newWalletVal = updatedSavings.find(s => s.id === newWalletId)?.current_balance || 0;

        await client.from('savings_vault').update({ current_balance: origWalletVal } as any).eq('id', origWalletId);
        if (origWalletId !== newWalletId) {
          await client.from('savings_vault').update({ current_balance: newWalletVal } as any).eq('id', newWalletId);
        }
        await client.from('transactions').update({
          amount: -Math.abs(amount),
          description: finalDescription,
          category: category as any
        } as any).eq('id', id);
      } catch (err) {
        console.error("Supabase editTransaction error:", err);
      }
    }

    saveStateToLocal(cycles, updatedTrans, debts, updatedSavings);
  };

  // Delete a transaction and reverse its financial impact
  const deleteTransaction = async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    let updatedSavings = [...savings];
    const amountAbs = Math.abs(tx.amount);

    if (tx.type === 'income') {
      // Deleting an Income subtracts the amount from Bank Assets (wallet-bank)
      const bank = savings.find(s => s.id === 'wallet-bank');
      if (bank) {
        const newBalance = bank.current_balance - amountAbs;
        updatedSavings = updatedSavings.map(s => s.id === 'wallet-bank' ? { ...s, current_balance: newBalance } : s);
        
        if (isSupabaseConfigured() && supabase) {
          try {
            await client.from('savings_vault').update({ current_balance: newBalance } as any).eq('id', 'wallet-bank');
          } catch (err) {
            console.error("Failed to update bank balance on income delete in Supabase:", err);
          }
        }
      }
    } else if (tx.type === 'expense') {
      if (tx.category === 'Savings Sweep') {
        // Sweep transaction: refund Hand Cash, deduct from target savings bank
        const match = tx.description.match(/Sweep to (.+?) \(Close Cycle\)/);
        const targetBankName = match ? match[1] : '';
        const targetBank = savings.find(s => s.name === targetBankName);
        const hand = savings.find(s => s.id === 'wallet-hand');
        
        if (hand) {
          const newHandBalance = hand.current_balance + amountAbs;
          updatedSavings = updatedSavings.map(s => s.id === 'wallet-hand' ? { ...s, current_balance: newHandBalance } : s);
          
          if (isSupabaseConfigured() && supabase) {
            try {
              await client.from('savings_vault').update({ current_balance: newHandBalance } as any).eq('id', 'wallet-hand');
            } catch (err) {
              console.error("Failed to update hand balance on sweep delete in Supabase:", err);
            }
          }
        }
        
        if (targetBank) {
          const newTargetBalance = targetBank.current_balance - amountAbs;
          updatedSavings = updatedSavings.map(s => s.id === targetBank.id ? { ...s, current_balance: newTargetBalance } : s);
          
          if (isSupabaseConfigured() && supabase) {
            try {
              await client.from('savings_vault').update({ current_balance: newTargetBalance } as any).eq('id', targetBank.id);
            } catch (err) {
              console.error("Failed to update target bank balance on sweep delete in Supabase:", err);
            }
          }
        }
      } else if (tx.description.includes('[Withdrawal]') || tx.description.includes('Withdrawal')) {
        // Withdrawal: refunds Bank Assets, deducts from Hand Cash
        const bank = savings.find(s => s.id === 'wallet-bank');
        const hand = savings.find(s => s.id === 'wallet-hand');
        
        const newBankBalance = bank ? bank.current_balance + amountAbs : 0;
        const newHandBalance = hand ? hand.current_balance - amountAbs : 0;
        
        updatedSavings = updatedSavings.map(s => {
          if (s.id === 'wallet-bank') return { ...s, current_balance: newBankBalance };
          if (s.id === 'wallet-hand') return { ...s, current_balance: newHandBalance };
          return s;
        });
        
        if (isSupabaseConfigured() && supabase) {
          try {
            await client.from('savings_vault').update({ current_balance: newBankBalance } as any).eq('id', 'wallet-bank');
            await client.from('savings_vault').update({ current_balance: newHandBalance } as any).eq('id', 'wallet-hand');
          } catch (err) {
            console.error("Failed to update balances on withdrawal delete in Supabase:", err);
          }
        }
      } else {
        // Normal expense
        const isBank = tx.description.includes('[Bank]');
        const walletId = isBank ? 'wallet-bank' : 'wallet-hand';
        const wallet = savings.find(s => s.id === walletId);
        
        if (wallet) {
          const newBalance = wallet.current_balance + amountAbs;
          updatedSavings = updatedSavings.map(s => s.id === walletId ? { ...s, current_balance: newBalance } : s);
          
          if (isSupabaseConfigured() && supabase) {
            try {
              await client.from('savings_vault').update({ current_balance: newBalance } as any).eq('id', walletId);
            } catch (err) {
              console.error("Failed to update wallet balance on expense delete in Supabase:", err);
            }
          }
        }
      }
    }

    // Remove transaction cleanly from array
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setSavings(updatedSavings);
    setTransactions(updatedTransactions);

    if (isSupabaseConfigured() && supabase) {
      try {
        await client.from('transactions').delete().eq('id', id);
      } catch (err) {
        console.error("Failed to delete transaction from Supabase:", err);
      }
    }

    saveStateToLocal(cycles, updatedTransactions, debts, updatedSavings);
  };

  // Master Reset
  const resetToMocks = async () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('vault_cycles');
    localStorage.removeItem('vault_transactions');
    localStorage.removeItem('vault_debts');
    localStorage.removeItem('vault_savings');
    localStorage.removeItem('vault_historical_months');

    if (isSupabaseConfigured() && supabase) {
      try {
        setLoading(true);
        await client.from('transactions').delete().neq('id', 'dummy-non-existent-id');
        await client.from('cycles').delete().neq('id', 'dummy-non-existent-id');
        await client.from('debts').delete().neq('id', 'dummy-non-existent-id');
        await client.from('savings_vault').delete().neq('id', 'dummy-non-existent-id');

        await client.from('cycles').insert(MOCK_CYCLES);
        await client.from('transactions').insert(MOCK_TRANSACTIONS);
        await client.from('debts').insert(MOCK_DEBTS);
        await client.from('savings_vault').insert(MOCK_SAVINGS);

        setCycles(MOCK_CYCLES);
        setTransactions(MOCK_TRANSACTIONS);
        setDebts(MOCK_DEBTS);
        setSavings(MOCK_SAVINGS);
        setHistoricalMonths(MOCK_HISTORICAL_MONTHS);
      } catch (err) {
        console.error("Supabase resetToMocks failed:", err);
      } finally {
        setLoading(false);
      }
    } else {
      loadFromLocalStorage();
    }
  };

  return (
    <WalletContext.Provider value={{
      cycles,
      transactions,
      debts,
      savings,
      historicalMonths,
      loading,
      activeCycle,
      expectedLiquidBalance,
      netWorth,
      bankMoney,
      handMoney,
      savingMoney,
      optionMoney,
      updateWalletBalance,
      addExpense,
      addIncome,
      addWithdrawal,
      addDebt,
      settleDebt,
      reconcileCash,
      incrementCommute,
      decrementCommute,
      depositToSavings,
      closeActiveCycleAndSweep,
      updateActiveCycleIncome,
      editTransaction,
      deleteTransaction,
      resetToMocks
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
