import { createClient } from '@supabase/supabase-js';

console.log('TODAS LAS ENV:', import.meta.env);

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase ANON:', supabaseAnonKey ? 'existe' : 'undefined');

const supabase = supabaseUrl ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default supabase;
