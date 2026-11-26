# MyWallet — Financial Asset Ledger

MyWallet helps you see where your money came from, where it went, and how much you have left. Track cash in hand and money in the bank separately, record bills and everyday spending, and keep track of what you owe or are owed.

Use Day Cycles to manage a spending budget without changing your actual wallet balances. Monthly History shows your income, spending, and debt activity, and you can download each month's statement as a PDF.

Developed by **Nihaaj Ahamed MS** 

---

## Key Features

### 1. Today Ledger
- Displays the current and future-dated transaction timeline.
- Transactions are grouped by date.
- Starting a new cycle does not clear historical transactions or wallet balances.

### 2. Account and Profile
- Supabase sign-in and sign-up.
- Email confirmation and password reset.
- Profile page for changing the display name and password.
- Account sign-out.
- Light and dark appearance modes.

### 3. Independent Wallet Balances
- **Bank Money** and **Hand Money** are tracked independently.
- Expenses deduct only from the selected payment source.
- Income destinations remain independent.
- Fixed outflows deduct from the selected Hand or Bank wallet.
- Cash withdrawals transfer money from Bank to Hand.
- Income added to a wallet never replaces that wallet's existing balance.

### 4. Day Cycle
- The active cycle contains 10 calendar days, from its base-income date through 9 days later.
- Base Income minus cycle spending determines Remaining.
- Hand Money and Remaining are separate values.
- Income goes into the selected wallet. Tick the option to also add it to the current Day Cycle Base Income, or choose to start a new cycle with it.
- Day Count shows how many different dates have transactions in the active cycle.
- Only ticked expenses and cycle deductions reduce Day Cycle Remaining.
- Unticked expenses affect the wallet and ledger without changing cycle Remaining.

### 5. Day Cycle Deductions
- **Quick deduction** defaults to Rs. 1000 and permits one deduction per day.
- **Custom deduction** accepts an amount and description and can be used multiple times per day.
- Custom toggle mode uses no daily limit.
- Quick and custom deductions do not deduct from Hand or Bank Money.
- Deductions appear in the Daily Spent Ledger.
- Swipe a deduction left to reveal Edit and Delete actions.
- Edit updates amount or description; delete removes it and recalculates Remaining.

### 6. Automatic Day Count
- The Day Count increases automatically at midnight.
- Reset sets the Day Count to 0.
- Stop pauses automatic counting.
- Resume restarts automatic counting.
- The toolbar Plus button remains independent and opens the ledger entry form.

### 7. Monthly Archive
- Monthly income, expenses, savings sweeps, category totals, and transaction timelines are available through expandable monthly sections.

### 8. PWA
- Installable application manifest.
- Standalone mobile and desktop display.
- Service worker registration.
- Offline app-shell caching.

### 9. Privacy and Mobile
- Privacy blur hides monetary values.
- Mobile controls use 44px minimum touch targets.
- Touch actions use active scaling rather than hover-dependent behavior.

### 10. Print Statements
- Print-only bank-statement layout includes selected-month summaries and ledger records.

---

## Tech Stack
- **Framework:** Next.js 16 App Router
- **Authentication/Database:** Supabase
- **State Management:** React Context
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

---

## Author & Updates
For more updates or inquiries, contact:
- **Lead Developer:** Nihaaj Ahamed MS
- **GitHub Repository:** [Nihaaj-Ahamed/MyWallet](https://github.com/Nihaaj-Ahamed/MyWallet)
