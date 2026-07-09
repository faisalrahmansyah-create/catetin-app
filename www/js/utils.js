// ============================================
// UTILITIES
// ============================================

// ===== FORMAT RUPIAH =====
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}

function parseRupiahToNumber(text) {
  const clean = text.replace(/[Rp.\s]/g, '').trim();
  return parseInt(clean) || 0;
}

// ===== EKSTRAK NOMINAL DARI TEKS =====
function extractNumberFromText(text) {
  // Cari pola angka dengan satuan (rb, ribu, jt, juta, M, miliar, k)
  const match = text.match(/(\d+[\s]*[rbjtMm]?)/i);
  if (!match) return 0;
  
  let num = parseInt(match[0].replace(/[^\d]/g, ''));
  const lower = match[0].toLowerCase();
  
  // Support ribuan
  if (lower.includes('rb') || lower.includes('ribu')) {
    num = num * 1000;
  }
  // Support jutaan
  else if (lower.includes('jt') || lower.includes('juta')) {
    num = num * 1000000;
  }
  // Support miliaran (prioritas: cek 'miliar' dulu, baru 'm' tunggal)
  else if (lower.includes('miliar')) {
    num = num * 1000000000;
  }
  else if (lower.includes('m') && !lower.includes('rb') && !lower.includes('jt') && !lower.includes('ribu') && !lower.includes('juta')) {
    num = num * 1000000000;
  }
  // Support "k" (ribu) - opsional
  else if (lower.includes('k') && !lower.includes('rb') && !lower.includes('ribu')) {
    num = num * 1000;
  }
  
  return num;
}

// ===== EKSTRAK TANGGAL DARI TEKS =====
function extractDateFromText(text) {
  const lower = text.toLowerCase();
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  if (lower.includes('hari ini')) return todayStr;
  if (lower.includes('besok')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower.includes('lusa')) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  const dateMatch = text.match(/(\d{1,2})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    if (day >= 1 && day <= 31) {
      const d = new Date(today.getFullYear(), today.getMonth(), day);
      if (d < today) d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    }
  }

  const months = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
  for (let i = 0; i < months.length; i++) {
    if (lower.includes(months[i])) {
      const d = new Date(today.getFullYear(), i, 1);
      if (d < today) d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    }
  }
  return todayStr;
}

// ===== EKSTRAK DESKRIPSI DARI TEKS =====
function extractDescriptionFromText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i];
    if (!line.toLowerCase().includes('rp') && 
        !line.toLowerCase().includes('total') &&
        !line.toLowerCase().includes('bayar') &&
        !line.toLowerCase().includes('kembali') &&
        line.length < 50) {
      return line;
    }
  }
  for (const line of lines) {
    if (line.toLowerCase().includes('struk') || 
        line.toLowerCase().includes('nota') ||
        line.toLowerCase().includes('toko')) {
      return line;
    }
  }
  return null;
}

// ===== EKSTRAK NOMINAL DARI STRUK =====
function extractNominalFromText(text) {
  const patterns = [
    /Rp\s*([\d.,]+)/i,
    /Rp\.\s*([\d.,]+)/i,
    /Rupiah\s*([\d.,]+)/i,
    /Total\s*:?\s*Rp\s*([\d.,]+)/i,
    /Total\s*:?\s*([\d.,]+)/i,
    /Bayar\s*:?\s*Rp\s*([\d.,]+)/i,
    /Jumlah\s*:?\s*Rp\s*([\d.,]+)/i,
    /(\d{1,3}(?:[.,]\d{3})*)/,
    /(\d+\.\d+\.\d+)/
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let numStr = match[1].replace(/[^0-9]/g, '');
      if (numStr.length > 0) return parseInt(numStr);
    }
  }
  const numbers = text.match(/\d+/g);
  if (numbers) {
    const parsed = numbers.map(n => parseInt(n));
    return Math.max(...parsed);
  }
  return 0;
}