import { createClient } from '@supabase/supabase-js';
import { Database } from '../supabase-types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Export client if credentials are provided, otherwise null.
// The app will fall back to local storage if the client is null.
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
  : null;

// Helper to determine if we are using live Supabase
export const isSupabaseConfigured = () => {
  return supabase !== null;
};
