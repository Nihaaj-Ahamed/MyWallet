'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Plus, 
  X, 
  Landmark, 
  TrendingDown, 
  TrendingUp, 
  Handshake, 
  Scale, 
  Check, 
  User, 
  Info,
  ArrowDownLeft,
  Coins
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function FABModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'expense' | 'income' | 'withdrawal' | 'debt' | 'adjustment'>('expense');
  
  const { 
    addExpense, 
    addIncome, 
    addWithdrawal,
    addDebt, 
    reconcileCash,
    updateWalletBalance,
    expectedLiquidBalance,
    bankMoney,
    handMoney,
    optionMoney
  } = useWallet();

  // Form states
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentSource, setPaymentSource] = useState<'hand' | 'bank'>('hand');

  // Income Cycle states
  const [cycleStartDate, setCycleStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [cycleEndDate, setCycleEndDate] = useState(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  // Debt states
  const [personName, setPersonName] = useState('');
  const [debtType, setDebtType] = useState<'lent' | 'borrowed'>('lent');

  // Adjustment states
  const [adjustmentWallet, setAdjustmentWallet] = useState<'wallet-bank' | 'wallet-hand' | 'wallet-option'>('wallet-hand');
  const [actualBalance, setActualBalance] = useState('');

  // Reset form helper
  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setPaymentSource('hand');
    setCycleStartDate(new Date().toISOString().split('T')[0]);
    setCycleEndDate(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setPersonName('');
    setDebtType('lent');
    setActualBalance('');
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (activeTab === 'expense') {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        await addExpense(numAmount, description || 'General Expense', category, date, paymentSource);
      } else if (activeTab === 'income') {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        await addIncome(numAmount, description || 'Cycle Funding', cycleStartDate, cycleEndDate);
      } else if (activeTab === 'withdrawal') {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;
        await addWithdrawal(numAmount, date);
      } else if (activeTab === 'debt') {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0 || !personName.trim()) return;
        await addDebt(numAmount, personName.trim(), debtType, description);
      } else if (activeTab === 'adjustment') {
        const numActual = parseFloat(actualBalance);
        if (isNaN(numActual)) return;
        if (adjustmentWallet === 'wallet-hand') {
          await reconcileCash(numActual);
        } else {
          await updateWalletBalance(adjustmentWallet, numActual);
        }
      }

      setIsOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error submitting form: ", err);
    }
  };

  const numActual = parseFloat(actualBalance);
  const selectedExpected = adjustmentWallet === 'wallet-bank' 
    ? bankMoney 
    : adjustmentWallet === 'wallet-hand' 
      ? handMoney 
      : optionMoney;

  const discrepancy = !isNaN(numActual) ? numActual - selectedExpected : 0;
  const isNegativeDiscrepancy = discrepancy < 0;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={handleOpen}
        className="no-print fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-obsidian-light border border-champagne text-champagne shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-300 hover:scale-105"
        aria-label="Add entry"
      >
        <Plus className="h-6 w-6 stroke-[2]" />
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="glass-panel relative z-10 w-full max-w-lg overflow-hidden rounded-t-2xl sm:rounded-2xl bg-slate-surface/95 border-t border-x sm:border border-slate-border text-white shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-border/50 px-6 py-4">
                <h3 className="font-semibold text-base tracking-wide uppercase text-champagne">
                  The Vault Ledger Entry
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-slate-muted hover:bg-white/5 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Segmented Control */}
              <div className="flex overflow-x-auto border-b border-slate-border/40 p-2 gap-1 bg-obsidian/40 scrollbar-none">
                {[
                  { id: 'expense', label: 'Expense', icon: TrendingDown },
                  { id: 'income', label: 'Income', icon: TrendingUp },
                  { id: 'withdrawal', label: 'Withdraw', icon: ArrowDownLeft },
                  { id: 'debt', label: 'Debt', icon: Handshake },
                  { id: 'adjustment', label: 'Adjust', icon: Scale },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-shrink-0 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-champagne/15 text-champagne border border-champagne/30 shadow-inner'
                          : 'text-slate-muted hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* 1. EXPENSE FORM */}
                {activeTab === 'expense' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold">Payment Source</label>
                      <div className="flex border border-slate-border/50 rounded-lg p-1 bg-obsidian/30">
                        <button
                          type="button"
                          onClick={() => setPaymentSource('hand')}
                          className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${
                            paymentSource === 'hand'
                              ? 'bg-champagne text-obsidian font-bold shadow'
                              : 'text-slate-muted hover:text-white'
                          }`}
                        >
                          Hand Money
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentSource('bank')}
                          className={`flex-1 py-2 text-xs font-semibold rounded transition-all ${
                            paymentSource === 'bank'
                              ? 'bg-champagne text-obsidian font-bold shadow'
                              : 'text-slate-muted hover:text-white'
                          }`}
                        >
                          Bank Money
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-lg font-mono placeholder:text-slate-muted/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="glass-input w-full rounded-lg px-3 py-3 text-sm focus:border-champagne"
                        >
                          <option value="Food" className="bg-slate-surface text-white">Food</option>
                          <option value="Travel (Colombo)" className="bg-slate-surface text-white">Travel (Colombo)</option>
                          <option value="Travel (Home)" className="bg-slate-surface text-white">Travel (Home)</option>
                          <option value="Rent" className="bg-slate-surface text-white">Rent</option>
                          <option value="Electricity" className="bg-slate-surface text-white">Electricity</option>
                          <option value="General" className="bg-slate-surface text-white">General</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Date</label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="glass-input w-full rounded-lg px-4 py-3 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Cafe, Groceries, Utility bill"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-sm placeholder:text-slate-muted/40"
                      />
                    </div>
                  </>
                )}

                {/* 2. INCOME FORM */}
                {activeTab === 'income' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Cycle Starting Budget (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-lg font-mono placeholder:text-slate-muted/40"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Start Date</label>
                        <input
                          type="date"
                          required
                          value={cycleStartDate}
                          onChange={(e) => setCycleStartDate(e.target.value)}
                          className="glass-input w-full rounded-lg px-4 py-3 text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">End Date (10 days)</label>
                        <input
                          type="date"
                          required
                          value={cycleEndDate}
                          onChange={(e) => setCycleEndDate(e.target.value)}
                          className="glass-input w-full rounded-lg px-4 py-3 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Mid-Month Funding Cycle"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-sm placeholder:text-slate-muted/40"
                      />
                    </div>
                  </>
                )}

                {/* 3. WITHDRAWAL FORM */}
                {activeTab === 'withdrawal' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Withdrawal Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-lg font-mono placeholder:text-slate-muted/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Date</label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-sm"
                      />
                    </div>

                    <div className="rounded-lg bg-champagne/5 p-4 border border-champagne/20 text-xs text-slate-muted leading-relaxed">
                      <Info className="h-4 w-4 inline mr-1.5 text-champagne" />
                      <span>This dedicated withdrawal transaction type automatically subtracts the specified value from the **Bank Money** pool and transfers it to the **Hand Money** pool.</span>
                    </div>
                  </>
                )}

                {/* 4. DEBT FORM */}
                {activeTab === 'debt' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-lg font-mono placeholder:text-slate-muted/40"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Person Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-muted" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Victoria Sterling"
                          value={personName}
                          onChange={(e) => setPersonName(e.target.value)}
                          className="glass-input w-full rounded-lg pl-10 pr-4 py-3 text-sm placeholder:text-slate-muted/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Debt Relationship</label>
                      <div className="flex gap-4">
                        <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-border/50 py-3 cursor-pointer bg-obsidian/30 transition-all duration-300 hover:border-champagne/40">
                          <input
                            type="radio"
                            name="debtType"
                            checked={debtType === 'lent'}
                            onChange={() => setDebtType('lent')}
                            className="accent-champagne"
                          />
                          <span className={`text-xs font-semibold ${debtType === 'lent' ? 'text-champagne' : 'text-slate-muted'}`}>Lent (They owe me)</span>
                        </label>

                        <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-border/50 py-3 cursor-pointer bg-obsidian/30 transition-all duration-300 hover:border-crimson/40">
                          <input
                            type="radio"
                            name="debtType"
                            checked={debtType === 'borrowed'}
                            onChange={() => setDebtType('borrowed')}
                            className="accent-crimson"
                          />
                          <span className={`text-xs font-semibold ${debtType === 'borrowed' ? 'text-crimson' : 'text-slate-muted'}`}>Borrowed (I owe them)</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Reason / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Travel tickets reimbursement"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-sm placeholder:text-slate-muted/40"
                      />
                    </div>
                  </>
                )}

                {/* 5. ADJUSTMENT FORM */}
                {activeTab === 'adjustment' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Select Wallet to Adjust</label>
                      <select
                        value={adjustmentWallet}
                        onChange={(e) => setAdjustmentWallet(e.target.value as any)}
                        className="glass-input w-full rounded-lg px-3 py-3 text-sm focus:border-champagne"
                      >
                        <option value="wallet-hand" className="bg-slate-surface text-white">Hand Money (Cash in Hand)</option>
                        <option value="wallet-bank" className="bg-slate-surface text-white">Bank Money (Checking/Savings)</option>
                        <option value="wallet-option" className="bg-slate-surface text-white">Option Money (Steerable Balance)</option>
                      </select>
                    </div>

                    <div className="rounded-lg bg-obsidian/60 p-4 border border-slate-border/30 text-xs space-y-2">
                      <div className="flex justify-between items-center text-slate-muted">
                        <span>Expected Wallet Value:</span>
                        <span className="font-mono text-white font-medium">Rs. {selectedExpected.toLocaleString()}</span>
                      </div>
                      {adjustmentWallet === 'wallet-hand' && (
                        <div className="text-[10px] text-slate-muted leading-relaxed flex gap-1.5 items-start">
                          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-champagne" />
                          <span>Hand cash adjustment automatically logs an audit transaction mismatch.</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-slate-muted font-bold block">Actual Real-life Balance (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={actualBalance}
                        onChange={(e) => setActualBalance(e.target.value)}
                        className="glass-input w-full rounded-lg px-4 py-3 text-lg font-mono placeholder:text-slate-muted/40"
                      />
                    </div>

                    {actualBalance && !isNaN(numActual) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 text-[10px] flex flex-col gap-1 border border-slate-border/30 bg-obsidian/40 rounded-lg"
                      >
                        <div className="flex justify-between items-center font-medium">
                          <span className={isNegativeDiscrepancy ? 'text-crimson' : 'text-emerald'}>
                            {isNegativeDiscrepancy ? 'Deduction / Deficit:' : 'Addition / Surplus:'}
                          </span>
                          <span className={`font-mono ${isNegativeDiscrepancy ? 'text-crimson' : 'text-emerald'}`}>
                            Rs. {Math.abs(discrepancy).toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-border/50">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-lg border border-slate-border/50 py-3 text-sm font-medium text-slate-muted hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-champagne hover:bg-champagne-light py-3 text-sm font-semibold text-obsidian shadow-gold-glow transition-all duration-300 hover:scale-[1.02]"
                  >
                    <Check className="h-4 w-4 stroke-[2.5]" />
                    <span>Post Ledger</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
