// ============================================
// DATABASE - Supabase Client
// ============================================

// Pastikan variabel dari config.js sudah tersedia
if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') {
  console.error('❌ SUPABASE_URL or SUPABASE_ANON_KEY is not defined. Check config.js');
} else {
  // Inisialisasi client Supabase
  const { createClient } = supabase;
  const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  console.log('✅ Supabase connected');

  // Ekspor secara global
  window.db = db;
}
