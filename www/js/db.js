// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://erqoltvxvlqxpzgjtkrm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycW9sdHZ4dmxxeHB6Z2p0a3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODA3OTMsImV4cCI6MjA5Nzg1Njc5M30.P-uKjsjapfRPTteWU75oxzAOc1g0tPhjgoPGPvGTVqc';

// Inisialisasi client Supabase
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase connected');