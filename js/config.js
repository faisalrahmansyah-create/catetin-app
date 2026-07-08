// ============================================
// CONFIGURATION
// ============================================

// ===== SUPABASE CREDENTIALS =====
const SUPABASE_URL = 'https://erqoltvxvlqxpzgjtkrm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycW9sdHZ4dmxxeHB6Z2p0a3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyODA3OTMsImV4cCI6MjA5Nzg1Njc5M30.P-uKjsjapfRPTteWU75oxzAOc1g0tPhjgoPGPvGTVqc';

// ===== SUPABASE EDGE FUNCTION URL =====
const SUPABASE_FUNCTION_URL = 'https://erqoltvxvlqxpzgjtkrm.supabase.co/functions/v1/gemini-proxy';

// ===== DOMAIN CONFIG (UNTUK REDIRECT LOGIN GOOGLE) =====
const APP_URL = 'https://faisalrahmansyah-create.github.io/catetin-app/';

// ===== KATEGORI =====
const categories = {
  income: [
    { name: 'Gaji', icon: 'briefcase' },
    { name: 'Bonus', icon: 'gift' },
    { name: 'Investasi', icon: 'trending-up' },
    { name: 'Piutang', icon: 'file-text' },
    { name: 'Lainnya', icon: 'plus-circle' }
  ],
  expense: [
    { name: 'Makan', icon: 'utensils' },
    { name: 'Transport', icon: 'car' },
    { name: 'Kebutuhan Rumah', icon: 'home' },
    { name: 'Perawatan Motor', icon: 'wrench' },
    { name: 'Tagihan', icon: 'file-text' },
    { name: 'Hiburan', icon: 'film' },
    { name: 'Tabungan', icon: 'piggy-bank' },
    { name: 'Saldo Awal', icon: 'plus-circle' },
    { name: 'Lainnya', icon: 'more-horizontal' }
  ]
};

// ===== TEMPLATE WHATSAPP =====
const DEFAULT_WA_TEMPLATE = `Kepada Yth, {nama_klien}

Kami mengingatkan tagihan sebesar {nominal} yang jatuh tempo pada {tanggal}.

Catatan: {catatan}

Mohon segera dibayar. Terima kasih.

--
Dikirim dari aplikasi Cashflow`;

// ===== MONTH NAMES =====
const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

console.log('✅ Config loaded');
console.log('🔗 Edge Function URL:', SUPABASE_FUNCTION_URL);
console.log('🌐 APP URL:', APP_URL);
