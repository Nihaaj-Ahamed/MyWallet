# The Vault (MyWallet) — Premium Financial Asset Ledger

An ultra-premium, production-ready financial tracking web application featuring a mathematically perfect discrepancy reconciliation engine, dynamic mobile viewports, privacy sensitive masking, and premium theme accent selectors.

Developed by **Nihaaj Ahamed MS** ([Nihaaj-Ahamed](https://github.com/Nihaaj-Ahamed)).

---

## Key Features

### 1. Today Ledger & Future Persistence
- **Hyper-Focus View:** The "Today Ledger" tab displays transactions matching the current local date along with any post-dated future transactions (e.g. post-dated checks, future logs).
- **Auto-Rollover:** The previous day's transactions automatically hide from this view as soon as local midnight passes.
- **Continuous Ledger:** Starting a new cycle never clears or resets historical transactions or account balances; the data persists across the continuous ledger.

### 2. Multi-Theme Accent Switcher
- Swap accents dynamically with zero layout displacement or Obsidian black body resets:
  * **Champagne Gold:** Default luxury gold accents (`#D4AF37`)
  * **Royal Emerald:** High-end jewel emerald accents (`#00E676`)
  * **Velvet Crimson / Rose Gold:** Premium copper pink accent (`#FF5252`)

### 3. Privacy Sensitive Blurring (Shutter Eye)
- Protect your capital position instantly. A clean Gaussian blur (`filter: blur(8px)`) masks sensitive numeric fields representing Net Worth, Bank Money, Hand Cash, Savings Vault, and Option Money.
- Easily toggle visibility with a single tap of the header "Eye" button.

### 4. Zero-Hover Mobile touch optimizations
- Eliminated all `:hover` and `group-hover` interactive dependencies that break on mobile screens.
- Enlarged all interactive targets, action items, toggles, and detail collapses to at least `min-height: 44px` with physical tap-scale feedback (`active:scale-95`).

### 5. Dynamic 3-Month Archive Accordion
- Fully dynamic accordions representing the last three calendar months.
- Automatically calculates:
  * **Opening Inflows** (Total Income)
  * **Period Expenses** (Total Outflows)
  * **Savings Sweeps** (Total Swept to Savings)
  * **Net Ledger Balance**
- Displays a 4-quadrant dynamic spending outlay card:
  1. Food & Groceries
  2. Commutes & Highway
  3. Rent & Utility Bills
  4. General / Subscriptions
- An expandable date timeline details specific entries per date row.

### 6. Print Statement Parity
- A print-only ledger layout styled as a bank statement. Includes dynamic summaries, outlays, and list records corresponding exactly to the selected month.

---

## Tech Stack
- **Framework:** Next.js (App Router)
- **State Management:** React Context (Supabase database integration + local backup recovery)
- **Styling:** Tailwind CSS + custom glassmorphic properties
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
