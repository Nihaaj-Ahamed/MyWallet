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

  React.useEffect(() => {
    const handleOpenEvent = () => handleOpen();
    window.addEventListener('open-fab-modal', handleOpenEvent);
    return () => window.removeEventListener('open-fab-modal', handleOpenEvent);
  }, []);

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
      {/* Floating Action Button (Desktop Only) */}
      <button
        onClick={handleOpen}
        className="no-print hidden lg:flex fixed bottom-8 right-8 z-40 h-14 w-14 items-center justify-center rounded-full bg-black hover:bg-charcoal text-white shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 border-none cursor-pointer"
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
              className="glass-panel relative z-10 w-full max-w-lg overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white border-t border-x sm:border border-slate-100 text-charcoal shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="font-bold text-sm tracking-wide uppercase text-charcoal">
                  The Vault Ledger Entry
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2.5 text-sage hover:text-charcoal hover:bg-slate-100 transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Segmented Control */}
              <div className="flex overflow-x-auto border-b border-slate-100 p-2 gap-1 bg-slate-50 scrollbar-none">
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
                      className={`flex-shrink-0 flex items-center justify-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 min-h-[40px] active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-white text-charcoal border border-slate-200 shadow-sm font-extrabold'
                          : 'text-sage hover:text-charcoal hover:bg-slate-100/50'
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
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Payment Source</label>
                      <div className="flex border border-slate-100 rounded-xl p-1 bg-slate-50">
                         <button
                          type="button"
                          onClick={() => setPaymentSource('hand')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[40px] active:scale-95 cursor-pointer ${
                            paymentSource === 'hand'
                              ? 'bg-white text-charcoal shadow-sm border border-slate-200/50 font-extrabold'
                              : 'text-sage hover:text-charcoal'
                          }`}
                        >
                          Hand Money
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentSource('bank')}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all min-h-[40px] active:scale-95 cursor-pointer ${
                            paymentSource === 'bank'
                              ? 'bg-white text-charcoal shadow-sm border border-slate-200/50 font-extrabold'
                              : 'text-sage hover:text-charcoal'
                          }`}
                        >
                          Bank Money
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-lg font-sans placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="glass-input w-full rounded-xl px-3 py-3 text-sm focus:border-charcoal bg-slate-50 text-charcoal cursor-pointer"
                        >
                          <option value="Food" className="bg-white text-charcoal">Food</option>
                          <option value="Travel (Colombo)" className="bg-white text-charcoal">Travel (Colombo)</option>
                          <option value="Travel (Home)" className="bg-white text-charcoal">Travel (Home)</option>
                          <option value="Rent" className="bg-white text-charcoal">Rent</option>
                          <option value="Electricity" className="bg-white text-charcoal">Electricity</option>
                          <option value="General" className="bg-white text-charcoal">General</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Date</label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="glass-input w-full rounded-xl px-4 py-3 text-sm bg-slate-50 text-charcoal"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Cafe, Groceries, Utility bill"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>
                  </>
                )}

                {/* 2. INCOME FORM */}
                {activeTab === 'income' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Cycle Starting Budget (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-lg font-sans placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Start Date</label>
                        <input
                          type="date"
                          required
                          value={cycleStartDate}
                          onChange={(e) => setCycleStartDate(e.target.value)}
                          className="glass-input w-full rounded-xl px-4 py-3 text-sm bg-slate-50 text-charcoal"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">End Date (10 days)</label>
                        <input
                          type="date"
                          required
                          value={cycleEndDate}
                          onChange={(e) => setCycleEndDate(e.target.value)}
                          className="glass-input w-full rounded-xl px-4 py-3 text-sm bg-slate-50 text-charcoal"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Mid-Month Funding Cycle"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>
                  </>
                )}

                {/* 3. WITHDRAWAL FORM */}
                {activeTab === 'withdrawal' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Withdrawal Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-lg font-sans placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Date</label>
                      <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-sm bg-slate-50 text-charcoal"
                      />
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-sage leading-relaxed">
                      <Info className="h-4 w-4 inline mr-1.5 text-sage" strokeWidth={2} />
                      <span>This dedicated withdrawal transaction type automatically subtracts the specified value from the **Bank Money** pool and transfers it to the **Hand Money** pool.</span>
                    </div>
                  </>
                )}

                {/* 4. DEBT FORM */}
                {activeTab === 'debt' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Amount (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-lg font-sans placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Person Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 h-4 w-4 text-sage" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Victoria Sterling"
                          value={personName}
                          onChange={(e) => setPersonName(e.target.value)}
                          className="glass-input w-full rounded-xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-400 bg-slate-50 text-charcoal"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Debt Relationship</label>
                      <div className="flex gap-4">
                         <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-100 min-h-[44px] py-3 cursor-pointer bg-slate-50 transition-all active:scale-95 active:border-slate-200">
                          <input
                            type="radio"
                            name="debtType"
                            checked={debtType === 'lent'}
                            onChange={() => setDebtType('lent')}
                            className="accent-black"
                          />
                          <span className={`text-xs font-bold ${debtType === 'lent' ? 'text-charcoal font-black' : 'text-sage'}`}>Lent (They owe me)</span>
                        </label>

                        <label className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-100 min-h-[44px] py-3 cursor-pointer bg-slate-50 transition-all active:scale-95 active:border-slate-200">
                          <input
                            type="radio"
                            name="debtType"
                            checked={debtType === 'borrowed'}
                            onChange={() => setDebtType('borrowed')}
                            className="accent-rose-500"
                          />
                          <span className={`text-xs font-bold ${debtType === 'borrowed' ? 'text-rose-600 font-black' : 'text-sage'}`}>Borrowed (I owe them)</span>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Reason / Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Travel tickets reimbursement"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-sm placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>
                  </>
                )}

                {/* 5. ADJUSTMENT FORM */}
                {activeTab === 'adjustment' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Select Wallet to Adjust</label>
                      <select
                        value={adjustmentWallet}
                        onChange={(e) => setAdjustmentWallet(e.target.value as any)}
                        className="glass-input w-full rounded-xl px-3 py-3 text-sm focus:border-charcoal bg-slate-50 text-charcoal cursor-pointer"
                      >
                        <option value="wallet-hand" className="bg-white text-charcoal">Hand Money (Cash in Hand)</option>
                        <option value="wallet-bank" className="bg-white text-charcoal">Bank Money (Checking/Savings)</option>
                        <option value="wallet-option" className="bg-white text-charcoal">Option Money (Steerable Balance)</option>
                      </select>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between items-center text-sage font-bold">
                        <span>Expected Wallet Value:</span>
                        <span className="font-sans text-charcoal font-black">Rs. {selectedExpected.toLocaleString()}</span>
                      </div>
                      {adjustmentWallet === 'wallet-hand' && (
                        <div className="text-[10px] text-sage leading-relaxed flex gap-1.5 items-start">
                          <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-sage" strokeWidth={2} />
                          <span>Hand cash adjustment automatically logs an audit transaction mismatch.</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-sage font-bold block">Actual Real-life Balance (Rs.)</label>
                      <input
                        type="number"
                        required
                        placeholder="0.00"
                        value={actualBalance}
                        onChange={(e) => setActualBalance(e.target.value)}
                        className="glass-input w-full rounded-xl px-4 py-3 text-lg font-sans placeholder:text-slate-400 bg-slate-50 text-charcoal"
                      />
                    </div>

                    {actualBalance && !isNaN(numActual) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 text-[10px] flex flex-col gap-1 border border-slate-100 bg-slate-50 rounded-xl"
                      >
                        <div className="flex justify-between items-center font-medium">
                          <span className={isNegativeDiscrepancy ? 'text-rose-500 font-bold' : 'text-emerald-600 font-bold'}>
                            {isNegativeDiscrepancy ? 'Deduction / Deficit:' : 'Addition / Surplus:'}
                          </span>
                          <span className={`font-sans font-black ${isNegativeDiscrepancy ? 'text-rose-500' : 'text-emerald-600'}`}>
                            Rs. {Math.abs(discrepancy).toLocaleString()}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}

                {/* Footer Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 rounded-full border border-slate-200 min-h-[44px] py-3 text-sm font-bold text-sage hover:bg-slate-50 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-black hover:bg-charcoal py-3 text-sm font-extrabold text-white transition-all duration-300 active:scale-95 min-h-[44px] cursor-pointer shadow-sm"
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
