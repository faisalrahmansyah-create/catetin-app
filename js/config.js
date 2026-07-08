// ============================================
// CONFIGURATION
// ============================================

// ===== API KEY GEMINI (SUDAH PINDAH KE BACKEND) =====
// ⚠️ TIDAK DIGUNAKAN LAGI - Semua request via Edge Function
// const GEMINI_API_KEY = ''; // Dikosongkan!

// ===== SUPABASE EDGE FUNCTION URL =====
// 🔥 GANTI DENGAN URL EDGE FUNCTION ANDA!
// Ambil dari: Supabase Dashboard → Edge Functions → gemini-proxy
const SUPABASE_FUNCTION_URL = 'https://erqoltvxvlqxpzgjtkrm.supabase.co/functions/v1/gemini-proxy';

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