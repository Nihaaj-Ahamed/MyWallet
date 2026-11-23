export interface Database {
  public: {
    Tables: {
      cycles: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string | null;
          start_date: string; // ISO Date String YYYY-MM-DD
          end_date: string;   // ISO Date String YYYY-MM-DD
          income: number;     // Active cycle starting budget/income
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          start_date: string;
          end_date: string;
          income: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          start_date?: string;
          end_date?: string;
          income?: number;
          description?: string | null;
          created_at?: string;
        };
      };
      transactions: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string | null;
          cycle_id: string;
          amount: number;      // Negative for expenses, positive for income
          type: 'expense' | 'income' | 'adjustment';
          category: 'Food' | 'Travel (Colombo)' | 'Travel (Home)' | 'Rent' | 'Electricity' | 'General' | 'Cycle Income' | 'Adjustment' | 'Debt' | 'Debt Settlement' | 'Savings Sweep';
          description: string;
          date: string;        // ISO Date String YYYY-MM-DD
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          cycle_id: string;
          amount: number;
          type: 'expense' | 'income' | 'adjustment';
          category: 'Food' | 'Travel (Colombo)' | 'Travel (Home)' | 'Rent' | 'Electricity' | 'General' | 'Cycle Income' | 'Adjustment' | 'Debt' | 'Debt Settlement' | 'Savings Sweep';
          description: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          cycle_id?: string;
          amount?: number;
          type?: 'expense' | 'income' | 'adjustment';
          category?: 'Food' | 'Travel (Colombo)' | 'Travel (Home)' | 'Rent' | 'Electricity' | 'General' | 'Cycle Income' | 'Adjustment' | 'Debt' | 'Debt Settlement' | 'Savings Sweep';
          description?: string;
          date?: string;
          created_at?: string;
        };
      };
      debts: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string | null;
          person_name: string;
          amount: number;      // Positive: they owe me (lent), Negative: I owe them (borrowed)
          type: 'lent' | 'borrowed';
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          person_name: string;
          amount: number;
          type: 'lent' | 'borrowed';
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          person_name?: string;
          amount?: number;
          type?: 'lent' | 'borrowed';
          description?: string | null;
          created_at?: string;
        };
      };
      savings_vault: {
        Relationships: [];
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          current_balance: number;
          target_goal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          current_balance: number;
          target_goal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          current_balance?: number;
          target_goal?: number;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      reset_wallet_data: { Args: never; Returns: undefined };
      record_wallet_expense: { Args: { expense_data: Transaction }; Returns: number };
    };
  };
}

export type Cycle = Database['public']['Tables']['cycles']['Row'];
export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type Debt = Database['public']['Tables']['debts']['Row'];
export type SavingsBank = Database['public']['Tables']['savings_vault']['Row'];
