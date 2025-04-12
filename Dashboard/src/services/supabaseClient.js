import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://gsqvwnsqyokejcctrjwj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcXZ3bnNxeW9rZWpjY3RyandqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0ODI2NTgsImV4cCI6MjA2MDA1ODY1OH0.Fk45BZfvesDVJOvfl8c4h6E5UPd0298_oShadMEZBz4';
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;