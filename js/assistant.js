// ============================================
// ASSISTANT - AI Voice Assistant (LENGKAP)
// ============================================

console.log('🤖 AI Assistant module loaded');

// ===== INISIALISASI =====
let isAssistantOn = false;
let isListening = false;
let isProcessing = false;
let isWaitingForName = false;
let isWaitingForConfirm = false;
let isWaitingForAmount = false;
let isWaitingForDate = false;
let isWaitingForBalance = false;
let isWaitingForCategory = false;
let isWaitingForDeleteDate = false;
let isWaitingForWallet = false;
let isWaitingForGoalWallet = false;
let pendingContext = null;
let pendingDeleteContext = null;
let pendingTransaction = { category: null, amount: 0, description: '', walletId: null };
let pendingGoal = { name: null, amount: 0, walletId: null };
let assistantName = localStorage.getItem('assistant_name') || 'Asisten';
let recognizer = null;
let synth = window.speechSynthesis;

// ===== CEK SUPPORT BROWSER =====
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function checkBrowserSupport() {
  var status = document.getElementById('assistantStatus');
  var toggle = document.getElementById('assistantToggle');
  
  if (!SpeechRecognition) {
    if (status) {
      status.textContent = 'Tidak Support';
      status.style.background = '#E86868';
      status.style.color = 'white';
    }
    if (toggle) {
      toggle.style.opacity = '0.5';
      toggle.disabled = true;
    }
    console.error('❌ Browser tidak mendukung Web Speech API.');
    return false;
  }
  
  if (!synth) {
    if (status) {
      status.textContent = 'Speech Error';
      status.style.background = '#E86868';
      status.style.color = 'white';
    }
    console.error('❌ Browser tidak mendukung Speech Synthesis.');
    return false;
  }
  
  console.log('✅ Browser mendukung Web Speech API');
  return true;
}

// ===== INISIALISASI RECOGNIZER =====
function initRecognizer() {
  if (!SpeechRecognition) return null;
  
  var rec = new SpeechRecognition();
  rec.lang = 'id-ID';
  rec.continuous = true;
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  
  console.log('✅ Recognizer initialized');
  return rec;
}

// ===== GET GREETING =====
function getGreeting() {
  var hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

// ===== SPEAK =====
function speak(text, callback) {
  if (!synth) {
    console.warn('⚠️ Speech synthesis not available');
    if (callback) callback();
    return;
  }
  
  synth.cancel();
  
  var utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.onend = function() {
    console.log('✅ Speech ended:', text.substring(0, 30) + '...');
    if (callback) callback();
  };
  utterance.onerror = function(e) {
    console.warn('⚠️ Speech error:', e);
    if (callback) callback();
  };
  synth.speak(utterance);
  console.log('🔊 Speaking:', text.substring(0, 30) + '...');
}

// ===== START LISTENING =====
function startListening() {
  if (!isAssistantOn || isListening || isProcessing) {
    console.log('⏳ Cannot start listening:', { isAssistantOn: isAssistantOn, isListening: isListening, isProcessing: isProcessing });
    return;
  }
  
  if (!recognizer) {
    console.error('❌ Recognizer not initialized');
    return;
  }
  
  try {
    recognizer.start();
    isListening = true;
    var status = document.getElementById('assistantStatus');
    var wave = document.getElementById('assistantWave');
    if (status) { 
      status.textContent = '🎤 Mendengar...'; 
      status.className = 'listening'; 
    }
    if (wave) wave.style.display = 'block';
    console.log('🎤 Listening...');
  } catch (e) {
    console.warn('⚠️ Gagal mulai mendengarkan:', e);
    isListening = false;
    try { recognizer.stop(); } catch (ex) {}
    setTimeout(function() {
      if (isAssistantOn && !isListening) startListening();
    }, 1000);
  }
}

// ===== STOP LISTENING =====
function stopListening() {
  if (recognizer) {
    try {
      recognizer.stop();
      console.log('🛑 Stopped listening');
    } catch (e) {
      console.warn('⚠️ Error stopping recognizer:', e);
    }
  }
  isListening = false;
  var wave = document.getElementById('assistantWave');
  if (wave) wave.style.display = 'none';
}

// ===== START ASSISTANT =====
function startAssistant() {
  if (isAssistantOn) return;
  
  console.log('🤖 Starting Assistant...');
  
  if (!checkBrowserSupport()) {
    alert('Browser Anda tidak mendukung fitur suara. Gunakan Chrome atau Edge terbaru.');
    return;
  }
  
  recognizer = initRecognizer();
  if (!recognizer) {
    alert('Gagal menginisialisasi pengenalan suara.');
    return;
  }
  
  setupRecognizerEvents();
  
  isAssistantOn = true;
  var toggle = document.getElementById('assistantToggle');
  var icon = document.getElementById('assistantIcon');
  var status = document.getElementById('assistantStatus');
  
  if (toggle) toggle.classList.add('on');
  if (icon) icon.setAttribute('data-lucide', 'mic-off');
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  if (status) { status.textContent = 'ON'; status.className = 'on'; }
  
  console.log('✅ Assistant started');
  
  var savedName = localStorage.getItem('assistant_name');
  if (savedName) {
    assistantName = savedName;
    var greeting = getGreeting();
    speak(greeting + ', saya ' + assistantName + ', asisten keuangan Anda. Ada yang bisa saya bantu?', function() {
      setTimeout(function() { if (isAssistantOn) startListening(); }, 500);
    });
  } else {
    isWaitingForName = true;
    speak('Halo! Saya asisten keuangan Anda. Siapa nama saya?', function() {
      setTimeout(function() { if (isAssistantOn) startListening(); }, 500);
    });
  }
}

// ===== STOP ASSISTANT =====
function stopAssistant() {
  if (!isAssistantOn) return;
  
  console.log('🛑 Stopping Assistant...');
  
  isAssistantOn = false;
  stopListening();
  
  if (synth) synth.cancel();
  
  var toggle = document.getElementById('assistantToggle');
  var icon = document.getElementById('assistantIcon');
  var status = document.getElementById('assistantStatus');
  var wave = document.getElementById('assistantWave');
  
  if (toggle) toggle.classList.remove('on');
  if (icon) icon.setAttribute('data-lucide', 'mic');
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  if (status) { status.textContent = 'OFF'; status.className = ''; }
  if (wave) wave.style.display = 'none';
  
  isListening = false;
  isProcessing = false;
  isWaitingForName = false;
  isWaitingForConfirm = false;
  isWaitingForAmount = false;
  isWaitingForDate = false;
  isWaitingForBalance = false;
  isWaitingForCategory = false;
  isWaitingForDeleteDate = false;
  isWaitingForWallet = false;
  isWaitingForGoalWallet = false;
  pendingContext = null;
  pendingDeleteContext = null;
  pendingTransaction = { category: null, amount: 0, description: '', walletId: null };
  pendingGoal = { name: null, amount: 0, walletId: null };
  
  if (recognizer) {
    try { recognizer.stop(); } catch (e) {}
    recognizer = null;
  }
  
  console.log('✅ Assistant stopped');
}

// ============================================================
// ===== EKSTRAK NOMINAL DARI TEKS (FIX) =====
// ============================================================

function extractNumberFromText(text) {
  if (!text) return 0;
  var cleaned = text.toLowerCase().trim();
  console.log('🔍 Extracting number from:', cleaned);
  
  // ===== STEP 1: HAPUS TITIK DAN KOMA (PEMISAH RIBUAN) =====
  var withoutDots = cleaned.replace(/[.,]/g, '');
  
  // ===== STEP 2: POLA ANGKA + SATUAN =====
  var patterns = [
    { regex: /(\d+)\s*jt\s*(a|u)?/, multiplier: 1000000 },
    { regex: /(\d+)\s*juta/, multiplier: 1000000 },
    { regex: /(\d+)\s* million/i, multiplier: 1000000 },
    { regex: /(\d+)\s*rb\s*(u)?/, multiplier: 1000 },
    { regex: /(\d+)\s*ribu/, multiplier: 1000 },
    { regex: /(\d+)\s*k\s*(?![a-zA-Z])/, multiplier: 1000 },
    { regex: /(\d+)\s*m\s*(i|l|liar)?/, multiplier: 1000000000 },
    { regex: /(\d+)\s*miliar/, multiplier: 1000000000 },
    { regex: /(\d+)\s*milyar/, multiplier: 1000000000 },
  ];
  
  for (var i = 0; i < patterns.length; i++) {
    var match = withoutDots.match(patterns[i].regex);
    if (match) {
      var result = parseInt(match[1]) * patterns[i].multiplier;
      console.log('✅ Pattern match:', match[1], 'x', patterns[i].multiplier, '=', result);
      return result;
    }
  }
  
  // ===== STEP 3: ANGKA MENTAH =====
  var numbers = withoutDots.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    var maxNum = 0;
    for (var i = 0; i < numbers.length; i++) {
      var num = parseInt(numbers[i]);
      if (num > maxNum) maxNum = num;
    }
    if (maxNum > 0) {
      console.log('✅ Raw numbers found:', maxNum);
      return maxNum;
    }
  }
  
  // ===== STEP 4: POLA KATA ANGKA =====
  var wordToNumber = {
    'nol': 0, 'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4,
    'lima': 5, 'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9,
    'sepuluh': 10, 'sebelas': 11, 'dua belas': 12, 'tiga belas': 13,
    'empat belas': 14, 'lima belas': 15, 'enam belas': 16,
    'tujuh belas': 17, 'delapan belas': 18, 'sembilan belas': 19,
    'dua puluh': 20, 'tiga puluh': 30, 'empat puluh': 40,
    'lima puluh': 50, 'enam puluh': 60, 'tujuh puluh': 70,
    'delapan puluh': 80, 'sembilan puluh': 90,
    'seratus': 100, 'dua ratus': 200, 'tiga ratus': 300,
    'empat ratus': 400, 'lima ratus': 500, 'enam ratus': 600,
    'tujuh ratus': 700, 'delapan ratus': 800, 'sembilan ratus': 900,
    'seribu': 1000, 'dua ribu': 2000, 'tiga ribu': 3000,
    'empat ribu': 4000, 'lima ribu': 5000, 'enam ribu': 6000,
    'tujuh ribu': 7000, 'delapan ribu': 8000, 'sembilan ribu': 9000,
    'sepuluh ribu': 10000, 'seratus ribu': 100000
  };
  
  var hasJuta = cleaned.includes('juta') || cleaned.includes('jt') || cleaned.includes('million');
  var hasRibu = cleaned.includes('ribu') || cleaned.includes('rb') || (cleaned.includes('k') && !cleaned.includes('ka'));
  var hasMiliar = cleaned.includes('miliar') || cleaned.includes('milyar');
  
  var sortedKeys = Object.keys(wordToNumber).sort(function(a, b) { return b.length - a.length; });
  
  for (var i = 0; i < sortedKeys.length; i++) {
    var key = sortedKeys[i];
    if (cleaned.includes(key)) {
      var value = wordToNumber[key];
      if (hasJuta && !key.includes('juta') && !key.includes('jt')) return value * 1000000;
      if (hasRibu && !key.includes('ribu') && !key.includes('rb')) return value * 1000;
      if (hasMiliar && !key.includes('miliar')) return value * 1000000000;
      return value;
    }
  }
  
  console.log('⚠️ No number found, returning 0');
  return 0;
}

// ===== EKSTRAK TANGGAL DARI TEKS =====
function extractDateFromText(text) {
  var lower = text.toLowerCase().trim();
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];

  if (lower.includes('hari ini')) return todayStr;
  if (lower.includes('besok') || lower.includes('esok')) {
    var d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (lower.includes('lusa')) {
    var d = new Date(today);
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  }

  var monthMap = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3,
    'mei': 4, 'juni': 5, 'juli': 6, 'agustus': 7,
    'september': 8, 'oktober': 9, 'november': 10, 'desember': 11
  };
  
  for (var month in monthMap) {
    if (lower.includes(month)) {
      var match = lower.match(new RegExp('(\\d{1,2})\\s*' + month + '\\s*(\\d{4})?'));
      if (match) {
        var day = parseInt(match[1]);
        var year = match[2] ? parseInt(match[2]) : today.getFullYear();
        var dateObj = new Date(year, monthMap[month], day);
        if (!match[2] && dateObj < today) dateObj.setFullYear(year + 1);
        return dateObj.toISOString().split('T')[0];
      }
    }
  }

  var matchSlash = lower.match(/(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{4})/);
  if (matchSlash) {
    var day = parseInt(matchSlash[1]);
    var month = parseInt(matchSlash[2]);
    var year = parseInt(matchSlash[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }
  }

  return todayStr;
}

// ============================================================
// ===== NORMALISASI TEKS UCAPAN (DIALEK LOKAL) - FULL =====
// ============================================================

function normalizeSpeechText(text) {
  if (!text) return '';
  
  var cleaned = text.toLowerCase().trim();
  
  // ===== SLANG KHUSUS (MENGANDUNG SPASI) =====
  cleaned = cleaned.replace(/\bcepek ceng\b/g, '100000');
  cleaned = cleaned.replace(/\bdapet duit\b/g, 'pemasukan');
  cleaned = cleaned.replace(/\bdapat uang\b/g, 'pemasukan');
  
  var fillerWords = [
    '\\b(eh|oh|ah|ih|uh|um|emm|hmm|mm|nggak|gak|ga|enggak|iya|yah|ya)\\b'
  ];
  var fillerRegex = new RegExp(fillerWords.join('|'), 'g');
  cleaned = cleaned.replace(fillerRegex, '');
  
  var slangMap = {
    'rebu': 'ribu', 'rbu': 'ribu', 'rb': 'ribu', 'ribu': 'ribu',
    'juta': 'juta', 'jt': 'juta', 'jut': 'juta', 'juta': 'juta',
    'miliar': 'miliar', 'milyar': 'miliar', 'm': 'miliar',
    'perak': '', 'duit': '', 'uang': '', 'k': 'ribu',
    'beli': 'beli', 'bayar': 'bayar',
    'catet': 'catat', 'catetin': 'tambah', 'tambahin': 'tambah',
    'tambahkan': 'tambah', 'bikin': 'buat', 'buatin': 'buat',
    'bikinin': 'buat', 'input': 'tambah',
    'berapa': 'berapa', 'brp': 'berapa', 'brapa': 'berapa',
    'ovoo': 'ovo', 'gopay': 'gopay', 'shopeepay': 'shopeepay',
    'dana': 'dana', 'bca': 'bca', 'bni': 'bni', 'bri': 'bri',
    'mandiri': 'mandiri',
    'gaji': 'gaji', 'bonus': 'bonus', 'tunjangan': 'tunjangan',
    'honor': 'honor', 'makan': 'makan', 'transport': 'transport',
    'tagihan': 'tagihan', 'listrik': 'listrik', 'air': 'air',
    'internet': 'internet', 'sewa': 'sewa', 'cicilan': 'cicilan',
    'kredit': 'kredit', 'pinjaman': 'pinjaman', 'tabungan': 'tabungan',
    'target': 'target', 'rencana': 'rencana', 'jadwal': 'jadwal',
    'piutang': 'piutang', 'hutang': 'hutang', 'lunas': 'lunas',
    'tagih': 'tagih', 'whatsapp': 'wa', 'wa': 'wa',
    'nyari': 'cari', 'cari': 'cari', 'cek': 'cek',
    'lihat': 'lihat', 'cekin': 'cek', 'lihatin': 'lihat',
    'kasih': 'kasih', 'kasi': 'kasih',
    'aku': 'saya', 'gue': 'saya', 'gua': 'saya', 'gw': 'saya',
    'saya': 'saya', 'kamu': 'Anda', 'lu': 'Anda', 'elo': 'Anda',
    'udah': 'sudah', 'udh': 'sudah', 'belum': 'belum',
    'blm': 'belum', 'blum': 'belum', 'mau': 'mau', 'mo': 'mau',
    'pengen': 'ingin', 'pingin': 'ingin', 'ingin': 'ingin',
    'ngeluarin': 'pengeluaran', 'keluar': 'pengeluaran',
    'kemasukan': 'pemasukan', 'masuk': 'pemasukan',
    'gajian': 'pemasukan',
    'cepek': '100', 'gopek': '500', 'seceng': '1000',
    'goceng': '5000', 'ceban': '10000', 'goban': '50000'
  };
  
  for (var key in slangMap) {
    var value = slangMap[key];
    var regex = new RegExp('\\b' + key + '\\b', 'g');
    cleaned = cleaned.replace(regex, value);
  }
  
  cleaned = cleaned.replace(/(\d+)\s*rb/g, '$1 ribu');
  cleaned = cleaned.replace(/(\d+)\s*jt/g, '$1 juta');
  cleaned = cleaned.replace(/(\d+)\s*m$/g, '$1 miliar');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/\brp\b/g, 'rupiah');
  
  console.log('🔍 Normalized from:', text);
  console.log('🔍 Normalized to:', cleaned);
  
  return cleaned;
}

// ============================================================
// ===== SETUP RECOGNIZER EVENTS =====
// ============================================================

function setupRecognizerEvents() {
  if (!recognizer) return;
  
  recognizer.onresult = async function(event) {
    if (!isAssistantOn) return;
    
    var last = event.results.length - 1;
    var alternatives = event.results[last];
    var transcript = alternatives[0].transcript.trim();
    
    for (var i = 0; i < alternatives.length; i++) {
      var altText = alternatives[i].transcript.toLowerCase();
      if (altText.includes('ribu') || altText.includes('juta') || altText.includes('rb') || altText.includes('jt')) {
        transcript = alternatives[i].transcript.trim();
        break;
      }
    }
    
    var cleanedTranscript = normalizeSpeechText(transcript);
    
    console.log('🎤 Perintah suara terpilih (normalized):', cleanedTranscript);
    
    stopListening();
    
    var status = document.getElementById('assistantStatus');
    if (status) { status.textContent = '⏳ Memproses...'; status.className = 'processing'; }
    
    // ===== HANDLE FOLLOW-UP =====
    if (isWaitingForAmount || isWaitingForDate || isWaitingForBalance || isWaitingForCategory || isWaitingForDeleteDate || isWaitingForWallet || isWaitingForGoalWallet) {
      var handled = handleFollowUpResponse(cleanedTranscript);
      if (handled) {
        if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
        return;
      }
    }
    
    // ===== HANDLE NAMA ASISTEN =====
    if (isWaitingForName) {
      var name = cleanedTranscript.trim();
      if (name && name.length > 0) {
        assistantName = name.charAt(0).toUpperCase() + name.slice(1);
        localStorage.setItem('assistant_name', assistantName);
        isWaitingForName = false;
        isProcessing = true;
        speak('Baik, saya ' + assistantName + '. Senang berkenalan dengan Anda! Ada yang bisa saya bantu?', function() {
          isProcessing = false;
          if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
        });
      } else {
        speak('Maaf, saya tidak mendengar nama Anda. Coba sebutkan lagi.', function() {
          if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
        });
      }
      return;
    }
    
    // ===== HANDLE KONFIRMASI =====
    if (isWaitingForConfirm) {
      isWaitingForConfirm = false;
      var lower = cleanedTranscript.toLowerCase();
      if (lower.includes('ya') || lower.includes('setuju') || lower.includes('oke') || lower.includes('y') || lower.includes('iya')) {
        var cmd = window._pendingCommand;
        if (cmd) {
          var result = '';
          isProcessing = true;
          try {
            if (cmd.action === 'create') {
              result = await createTransactionWithWallet(cmd.category, cmd.amount, cmd.description || '', cmd.walletId);
            } else if (cmd.action === 'delete_last') {
              result = await deleteLastTransaction();
            } else if (cmd.action === 'delete') {
              result = await deleteTransactionByCategory(cmd.category, cmd.amount);
            } else if (cmd.action === 'delete_with_confirm') {
              result = await deleteTransactionById(cmd.id);
            } else if (cmd.action === 'create_goal') {
              result = await createGoal(cmd.name, cmd.amount, cmd.walletId);
            } else if (cmd.action === 'topup_goal') {
              result = await topUpGoal(cmd.name, cmd.amount);
            } else if (cmd.action === 'create_plan') {
              result = await createSchedulePlan(cmd.title, cmd.amount, cmd.date);
            } else if (cmd.action === 'create_wallet') {
              result = await createWallet(cmd.name, cmd.balance);
            } else if (cmd.action === 'mark_paid') {
              result = await markAsPaid(cmd.title);
            } else if (cmd.action === 'send_wa') {
              result = await sendWACommand(cmd.target);
            } else if (cmd.action === 'send_all_wa') {
              result = await sendAllWABulk();
            }
          } catch (e) {
            result = '❌ Gagal memproses: ' + e.message;
          }
          window._pendingCommand = null;
          var enhancedResult = PERSONALITY.enhance(result, 'default', { text: result });
          speak(enhancedResult, function() {
            isProcessing = false;
            if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
          });
        }
      } else {
        speak('Baik, dibatalkan.', function() {
          window._pendingCommand = null;
          if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
        });
      }
      return;
    }
    
    // ===== PROSES PERINTAH UTAMA =====
    isProcessing = true;
    try {
      var reply = await processWithConfirmation(cleanedTranscript);
      if (reply) {
        var enhancedReply = PERSONALITY.enhance(reply, 'default', { text: reply });
        speak(enhancedReply, function() {
          isProcessing = false;
          if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
        });
      } else {
        isProcessing = false;
        if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
      }
    } catch (e) {
      console.error('❌ Error processing command:', e);
      speak('Maaf, terjadi kesalahan saat memproses perintah Anda.', function() {
        isProcessing = false;
        if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
      });
    }
  };
  
  recognizer.onerror = function(event) {
    console.warn('⚠️ Recognizer error:', event.error);
    
    if (event.error === 'not-allowed') {
      speak('Izin mikrofon belum diberikan. Silakan klik ikon gembok di address bar, izinkan akses mikrofon, lalu refresh halaman.', function() {
        if (isAssistantOn) {
          isAssistantOn = false;
          var toggle = document.getElementById('assistantToggle');
          var status = document.getElementById('assistantStatus');
          if (toggle) toggle.classList.remove('on');
          if (status) { status.textContent = 'OFF'; status.className = ''; }
          var wave = document.getElementById('assistantWave');
          if (wave) wave.style.display = 'none';
        }
      });
      return;
    }
    
    if (event.error === 'no-speech') {
      console.log('🔇 Tidak ada suara terdeteksi, mencoba lagi...');
      if (isAssistantOn && !isProcessing) {
        setTimeout(function() { if (isAssistantOn && !isListening) startListening(); }, 500);
      }
      return;
    }
    
    if (isAssistantOn && !isProcessing) {
      isListening = false;
      var wave = document.getElementById('assistantWave');
      if (wave) wave.style.display = 'none';
      var status = document.getElementById('assistantStatus');
      if (status) { status.textContent = '🎤 Mendengar...'; status.className = 'listening'; }
      setTimeout(function() { if (isAssistantOn && !isListening) startListening(); }, 500);
    }
  };
  
  recognizer.onend = function() {
    console.log('🔚 Recognizer ended, isListening:', isListening);
    isListening = false;
    var wave = document.getElementById('assistantWave');
    if (wave) wave.style.display = 'none';
    if (isAssistantOn && !isProcessing) {
      setTimeout(function() { if (isAssistantOn && !isListening) startListening(); }, 300);
    }
  };
  
  console.log('✅ Recognizer events configured');
}

// ============================================================
// ===== ASK FOLLOW-UP =====
// ============================================================

function askFollowUp(question) {
  speak(question, function() {
    if (isAssistantOn) setTimeout(function() { startListening(); }, 500);
  });
}

// ============================================================
// ===== HANDLE FOLLOW-UP RESPONSE =====
// ============================================================

function handleFollowUpResponse(transcript) {
  var lower = transcript.toLowerCase();
  
  if (lower.includes('batal') || lower.includes('tidak jadi') || lower.includes('ga jadi') || lower.includes('cancel')) {
    pendingContext = null;
    pendingDeleteContext = null;
    pendingTransaction = { category: null, amount: 0, description: '', walletId: null };
    pendingGoal = { name: null, amount: 0, walletId: null };
    isWaitingForAmount = false;
    isWaitingForDate = false;
    isWaitingForBalance = false;
    isWaitingForCategory = false;
    isWaitingForDeleteDate = false;
    isWaitingForWallet = false;
    isWaitingForGoalWallet = false;
    speak('Baik, dibatalkan.');
    return true;
  }
  
  var amount = extractNumberFromText(transcript);
  console.log('💰 Extracted amount:', amount);
  
  // ===== DOMPET - TANYA DOMPET (UNTUK TRANSAKSI) =====
  if (isWaitingForWallet && pendingTransaction) {
    var walletName = transcript.trim();
    var wallet = allWallets.find(function(w) { 
      return w.name.toLowerCase() === walletName.toLowerCase();
    });
    
    if (!wallet) {
      var list = allWallets.map(function(w) { return w.name; }).join(', ');
      speak('Dompet "' + walletName + '" tidak ditemukan. Dompet yang tersedia: ' + list);
      return true;
    }
    
    pendingTransaction.walletId = wallet.id;
    isWaitingForWallet = false;
    
    if (pendingTransaction.category && pendingTransaction.amount > 0) {
      executePendingTransaction();
      pendingTransaction = { category: null, amount: 0, description: '', walletId: null };
      return true;
    }
    
    if (!pendingTransaction.category) {
      isWaitingForCategory = true;
      speak('Kategori dan berapa nominalnya? (contoh: Makan 25000)');
      return true;
    }
    
    if (pendingTransaction.amount === 0) {
      isWaitingForAmount = true;
      speak('Berapa nominal untuk transaksi ' + pendingTransaction.category + '?');
      return true;
    }
    
    return true;
  }
  
  // ===== TARGET - TANYA DOMPET =====
  if (isWaitingForGoalWallet && pendingGoal) {
    var walletName = transcript.trim();
    var wallet = allWallets.find(function(w) { 
      return w.name.toLowerCase() === walletName.toLowerCase();
    });
    
    if (!wallet) {
      var list = allWallets.map(function(w) { return w.name; }).join(', ');
      speak('Dompet "' + walletName + '" tidak ditemukan. Dompet yang tersedia: ' + list);
      return true;
    }
    
    pendingGoal.walletId = wallet.id;
    isWaitingForGoalWallet = false;
    
    if (pendingGoal.amount > 0) {
      createGoal(pendingGoal.name, pendingGoal.amount, pendingGoal.walletId).then(function(result) {
        var enhanced = PERSONALITY.enhance(result, 'default', { text: result });
        speak(enhanced);
      });
      pendingGoal = { name: null, amount: 0, walletId: null };
      return true;
    }
    
    isWaitingForAmount = true;
    speak('Berapa nominal target ' + pendingGoal.name + '?');
    return true;
  }
  
  // ===== HAPUS TRANSAKSI - TANYA TANGGAL =====
  if (isWaitingForDeleteDate && pendingDeleteContext) {
    var dateStr = extractDateFromText(transcript);
    if (dateStr) {
      var found = pendingDeleteContext.transactions.filter(function(t) {
        return t.transaction_date === dateStr;
      });
      
      if (found.length === 0) {
        speak('Tidak ada transaksi ' + pendingDeleteContext.category + ' pada tanggal ' + new Date(dateStr).toLocaleDateString('id-ID') + '.');
        isWaitingForDeleteDate = false;
        pendingDeleteContext = null;
        return true;
      }
      
      if (found.length === 1) {
        var t = found[0];
        speak('Saya temukan transaksi ' + t.category + ' ' + formatRupiah(t.amount) + ' tanggal ' + new Date(t.transaction_date).toLocaleDateString('id-ID') + '. Apakah Anda yakin ingin menghapusnya?');
        window._pendingCommand = { action: 'delete_with_confirm', id: t.id };
        isWaitingForConfirm = true;
        isWaitingForDeleteDate = false;
        pendingDeleteContext = null;
        return true;
      }
      
      speak('Masih ada ' + found.length + ' transaksi pada tanggal itu. Silakan sebutkan nominalnya.');
      return true;
    }
    speak('Maaf, saya tidak mengerti tanggalnya. Coba sebutkan format tanggal (contoh: kemarin, 20 Januari 2025).');
    return true;
  }
  
  // ===== DOMPET - TANYA SALDO =====
  if (pendingContext && pendingContext.action === 'create_wallet' && isWaitingForBalance) {
    if (amount > 0) {
      pendingContext.balance = amount;
      isWaitingForBalance = false;
      isWaitingForAmount = false;
      executePendingCommand(pendingContext);
      pendingContext = null;
      return true;
    }
    speak('Maaf, saya tidak mendengar nominalnya. Coba sebutkan angka saldo awalnya (contoh: 500000 atau lima ratus ribu).');
    return true;
  }
  
  // ===== TARGET - TANYA NOMINAL =====
  if (pendingContext && pendingContext.action === 'create_goal' && isWaitingForAmount) {
    if (amount > 0) {
      pendingContext.amount = amount;
      isWaitingForAmount = false;
      executePendingCommand(pendingContext);
      pendingContext = null;
      return true;
    }
    speak('Maaf, saya tidak mendengar nominalnya. Coba sebutkan angka targetnya (contoh: 10000000 atau sepuluh juta).');
    return true;
  }
  
  // ===== RENCANA - TANYA NOMINAL =====
  if (pendingContext && pendingContext.action === 'create_plan' && isWaitingForAmount) {
    if (amount > 0) {
      pendingContext.amount = amount;
      isWaitingForAmount = false;
      if (!pendingContext.date) {
        isWaitingForDate = true;
        speak('Tanggal berapa rencana ini? (contoh: besok, 15 Januari 2025, atau 20/01/2025)');
        return true;
      }
      executePendingCommand(pendingContext);
      pendingContext = null;
      return true;
    }
    speak('Maaf, saya tidak mendengar nominalnya. Coba sebutkan angka nominalnya.');
    return true;
  }
  
  // ===== RENCANA - TANYA TANGGAL =====
  if (pendingContext && pendingContext.action === 'create_plan' && isWaitingForDate) {
    var dateStr = extractDateFromText(transcript);
    if (dateStr) {
      pendingContext.date = dateStr;
      isWaitingForDate = false;
      isWaitingForAmount = false;
      executePendingCommand(pendingContext);
      pendingContext = null;
      return true;
    }
    speak('Maaf, saya tidak mengerti tanggalnya. Coba sebutkan format tanggal (contoh: 20 Januari 2025 atau besok).');
    return true;
  }
  
  // ===== TRANSAKSI - TANYA KATEGORI =====
  if (isWaitingForCategory && pendingTransaction) {
    var amt = extractNumberFromText(transcript);
    var category = transcript.replace(/\d+/g, '')
                             .replace(/(ribu|rb|juta|jt|k|ratus|rupiah|perak)/gi, '')
                             .replace(/[.,]/g, '')
                             .trim();
                             
    if (category && amt > 0) {
      pendingTransaction.category = category.charAt(0).toUpperCase() + category.slice(1);
      pendingTransaction.amount = amt;
      isWaitingForCategory = false;
      isWaitingForAmount = false;
      executePendingTransaction();
      pendingTransaction = { category: null, amount: 0, description: '', walletId: null };
      return true;
    }
    
    if (category && amt === 0) {
      pendingTransaction.category = category.charAt(0).toUpperCase() + category.slice(1);
      isWaitingForCategory = false;
      isWaitingForAmount = true;
      speak('Berapa nominal untuk transaksi ' + pendingTransaction.category + '?');
      return true;
    }
    
    speak('Maaf, saya tidak mengerti. Coba sebutkan kategori dan nominal (contoh: Makan 25000).');
    return true;
  }
  
  // ===== TRANSAKSI - TANYA NOMINAL =====
  if (isWaitingForAmount && pendingTransaction) {
    var amt = extractNumberFromText(transcript);
    if (amt > 0) {
      pendingTransaction.amount = amt;
      isWaitingForAmount = false;
      executePendingTransaction();
      pendingTransaction = { category: null, amount: 0, description: '', walletId: null };
      return true;
    }
    speak('Maaf, saya tidak mendengar nominalnya. Coba sebutkan angka (contoh: 25000 atau dua puluh lima ribu).');
    return true;
  }
  
  return false;
}

// ============================================================
// ===== EXECUTE PENDING TRANSACTION =====
// ============================================================

function executePendingTransaction() {
  if (!pendingTransaction) return;
  var data = pendingTransaction;
  createTransactionWithWallet(data.category, data.amount, data.description || '', data.walletId)
    .then(function(result) {
      var enhanced = PERSONALITY.enhance(result, 'expense', { 
        amount: formatRupiah(data.amount), 
        category: data.category 
      });
      speak(enhanced);
    });
}

// ============================================================
// ===== EXECUTE PENDING COMMAND =====
// ============================================================

function executePendingCommand(context) {
  var action = context.action;
  if (action === 'create_wallet') {
    createWallet(context.name, context.balance).then(function(result) {
      var enhanced = PERSONALITY.enhance(result, 'default', { text: result });
      speak(enhanced);
    });
  } else if (action === 'create_goal') {
    createGoal(context.name, context.amount).then(function(result) {
      var enhanced = PERSONALITY.enhance(result, 'default', { text: result });
      speak(enhanced);
    });
  } else if (action === 'create_plan') {
    createSchedulePlan(context.title, context.amount, context.date).then(function(result) {
      var enhanced = PERSONALITY.enhance(result, 'plan', { title: context.title, amount: formatRupiah(context.amount) });
      speak(enhanced);
    });
  }
}

// ============================================================
// ===== GET FINANCIAL CONTEXT =====
// ============================================================

function getFinancialContext() {
  var today = new Date().toISOString().split('T')[0];
  var month = today.substring(0, 7);
  var totalIncome = 0, totalExpense = 0;
  var incomeToday = 0, expenseToday = 0;
  var expenseMonth = 0;
  allTransactions.forEach(function(t) {
    var amount = Number(t.amount);
    if (t.type === 'pemasukan') {
      totalIncome += amount;
      if (t.transaction_date === today) incomeToday += amount;
    } else {
      totalExpense += amount;
      if (t.transaction_date === today) expenseToday += amount;
      if (t.transaction_date.startsWith(month)) expenseMonth += amount;
    }
  });
  var balance = totalIncome - totalExpense;
  var recent = allTransactions.slice(0, 5).map(function(t) { return t.category + ' ' + (t.type === 'pemasukan' ? '+' : '-') + formatRupiah(t.amount); }).join(', ');
  return { balance: balance, incomeToday: incomeToday, expenseToday: expenseToday, expenseMonth: expenseMonth, totalIncome: totalIncome, totalExpense: totalExpense, recent: recent };
}

// ============================================================
// ===== FALLBACK LOKAL =====
// ============================================================

function getLocalFallbackResponse(text) {
  var ctx = getFinancialContext();
  var lower = text.toLowerCase();
  
  if (lower.includes('saldo') || lower.includes('uang') || lower.includes('total')) {
    return '💰 Saldo total Anda saat ini: ' + formatRupiah(ctx.balance) + '. (AI sedang sibuk, ini data realtime dari sistem)';
  }
  if ((lower.includes('pengeluaran') || lower.includes('keluar')) && (lower.includes('hari ini') || lower.includes('sekarang') || !lower.includes('minggu'))) {
    return '📤 Pengeluaran hari ini: ' + formatRupiah(ctx.expenseToday) + '. (AI offline, data realtime)';
  }
  if ((lower.includes('pemasukan') || lower.includes('masuk')) && (lower.includes('hari ini') || lower.includes('sekarang') || !lower.includes('minggu'))) {
    return '📥 Pemasukan hari ini: ' + formatRupiah(ctx.incomeToday) + '. (AI offline, data realtime)';
  }
  if (lower.includes('ringkasan') || lower.includes('summary') || lower.includes('keuangan')) {
    return '📊 Ringkasan: Saldo ' + formatRupiah(ctx.balance) + ', Pemasukan hari ini ' + formatRupiah(ctx.incomeToday) + ', Pengeluaran hari ini ' + formatRupiah(ctx.expenseToday) + '.';
  }
  return 'Maaf, kuota AI sedang habis. Tapi saya masih bisa bantu pertanyaan tentang saldo, pemasukan, pengeluaran harian, atau ringkasan keuangan. Coba tanyakan itu ya! 😊';
}

// ============================================================
// ===== HIGH PRIORITY FUNCTIONS =====
// ============================================================

function getBalance() {
  if (!allWallets.length) return 'Belum ada dompet. Silakan buat dompet terlebih dahulu.';
  
  var totalBalance = 0;
  var walletDetails = [];
  
  allWallets.forEach(function(w) {
    var balance = 0;
    allTransactions.forEach(function(t) {
      if (t.wallet_id === w.id) {
        if (t.type === 'pemasukan') balance += Number(t.amount);
        else balance -= Number(t.amount);
      }
    });
    totalBalance += balance;
    walletDetails.push(w.name + ': ' + formatRupiah(balance));
  });
  
  var result = '💰 Total saldo: ' + formatRupiah(totalBalance) + '\n' + walletDetails.join('\n');
  return PERSONALITY.enhance(result, 'balance', { amount: formatRupiah(totalBalance) });
}

function getExpenseToday() {
  var today = new Date().toISOString().split('T')[0];
  var expenses = allTransactions.filter(function(t) { 
    return t.type === 'pengeluaran' && t.transaction_date === today;
  });
  
  if (expenses.length === 0) {
    return '📤 Tidak ada pengeluaran yang tercatat hari ini.';
  }
  
  var total = expenses.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var detail = expenses.map(function(t) { return t.category + ': ' + formatRupiah(t.amount); }).join('\n');
  var result = '📤 Pengeluaran hari ini: ' + formatRupiah(total) + '\n' + detail;
  return PERSONALITY.enhance(result, 'expense', { amount: formatRupiah(total), category: expenses.length > 0 ? expenses[0].category : '' });
}

function getIncomeToday() {
  var today = new Date().toISOString().split('T')[0];
  var incomes = allTransactions.filter(function(t) { 
    return t.type === 'pemasukan' && t.transaction_date === today;
  });
  
  if (incomes.length === 0) {
    return '📥 Tidak ada pemasukan yang tercatat hari ini.';
  }
  
  var total = incomes.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var detail = incomes.map(function(t) { return t.category + ': ' + formatRupiah(t.amount); }).join('\n');
  var result = '📥 Pemasukan hari ini: ' + formatRupiah(total) + '\n' + detail;
  return PERSONALITY.enhance(result, 'income', { amount: formatRupiah(total), category: incomes.length > 0 ? incomes[0].category : '' });
}

// ============================================================
// ===== MEDIUM PRIORITY FUNCTIONS =====
// ============================================================

function getWalletBalance(walletName) {
  if (!allWallets.length) return 'Belum ada dompet.';
  
  var wallet = allWallets.find(function(w) { 
    return w.name.toLowerCase().includes(walletName.toLowerCase());
  });
  
  if (!wallet) {
    var list = allWallets.map(function(w) { return w.name; }).join(', ');
    return 'Dompet "' + walletName + '" tidak ditemukan. Dompet yang tersedia: ' + list;
  }
  
  var balance = 0;
  allTransactions.forEach(function(t) {
    if (t.wallet_id === wallet.id) {
      if (t.type === 'pemasukan') balance += Number(t.amount);
      else balance -= Number(t.amount);
    }
  });
  
  var result = '💰 ' + wallet.name + ': ' + formatRupiah(balance);
  return PERSONALITY.enhance(result, 'balance', { amount: formatRupiah(balance) });
}

function getAllWallets() {
  if (!allWallets.length) return 'Belum ada dompet.';
  
  var details = allWallets.map(function(w) {
    var balance = 0;
    allTransactions.forEach(function(t) {
      if (t.wallet_id === w.id) {
        if (t.type === 'pemasukan') balance += Number(t.amount);
        else balance -= Number(t.amount);
      }
    });
    return w.name + ': ' + formatRupiah(balance);
  });
  
  var totalBalance = 0;
  allWallets.forEach(function(w) {
    var balance = 0;
    allTransactions.forEach(function(t) {
      if (t.wallet_id === w.id) {
        if (t.type === 'pemasukan') balance += Number(t.amount);
        else balance -= Number(t.amount);
      }
    });
    totalBalance += balance;
  });
  
  var result = '📱 Semua Dompet:\n' + details.join('\n') + '\n\n💰 Total: ' + formatRupiah(totalBalance);
  return PERSONALITY.enhance(result, 'balance', { amount: formatRupiah(totalBalance) });
}

function getFinancialSummary() {
  var today = new Date();
  var monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  
  var monthIncome = allTransactions.filter(function(t) { return t.type === 'pemasukan' && t.transaction_date.startsWith(monthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var monthExpense = allTransactions.filter(function(t) { return t.type === 'pengeluaran' && t.transaction_date.startsWith(monthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  
  var balance = getBalance();
  var dueIncome = allScheduledPlans.filter(function(p) { return p.plan_type === 'pemasukan' && !p.is_paid; }).reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
  var dueExpense = allScheduledPlans.filter(function(p) { return p.plan_type === 'pengeluaran' && !p.is_paid; }).reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
  
  var result = '📊 RINGKASAN KEUANGAN\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  result += balance + '\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📥 Pemasukan bulan ini: ' + formatRupiah(monthIncome) + '\n';
  result += '📤 Pengeluaran bulan ini: ' + formatRupiah(monthExpense) + '\n';
  result += '💰 Saldo bulan ini: ' + formatRupiah(monthIncome - monthExpense) + '\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📋 Piutang belum lunas: ' + formatRupiah(dueIncome) + '\n';
  result += '📋 Tagihan belum lunas: ' + formatRupiah(dueExpense);
  
  return PERSONALITY.enhance(result, 'default', { text: result });
}

function getMonthComparison() {
  var today = new Date();
  var currentMonth = today.getMonth();
  var currentYear = today.getFullYear();
  var lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  var lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  var currentMonthStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0');
  var lastMonthStr = lastMonthYear + '-' + String(lastMonth + 1).padStart(2, '0');
  
  var currentIncome = allTransactions.filter(function(t) { return t.type === 'pemasukan' && t.transaction_date.startsWith(currentMonthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var lastIncome = allTransactions.filter(function(t) { return t.type === 'pemasukan' && t.transaction_date.startsWith(lastMonthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var currentExpense = allTransactions.filter(function(t) { return t.type === 'pengeluaran' && t.transaction_date.startsWith(currentMonthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var lastExpense = allTransactions.filter(function(t) { return t.type === 'pengeluaran' && t.transaction_date.startsWith(lastMonthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  
  var incomeDiff = currentIncome - lastIncome;
  var expenseDiff = currentExpense - lastExpense;
  var incomePercent = lastIncome === 0 ? 0 : ((incomeDiff / lastIncome) * 100);
  var expensePercent = lastExpense === 0 ? 0 : ((expenseDiff / lastExpense) * 100);
  
  var result = '📊 PERBANDINGAN BULAN LALU\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📥 Pemasukan:\n';
  result += '  Bulan ini: ' + formatRupiah(currentIncome) + '\n';
  result += '  Bulan lalu: ' + formatRupiah(lastIncome) + '\n';
  result += '  ' + (incomeDiff >= 0 ? '📈' : '📉') + ' ' + (incomePercent >= 0 ? '+' : '') + incomePercent.toFixed(1) + '%\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📤 Pengeluaran:\n';
  result += '  Bulan ini: ' + formatRupiah(currentExpense) + '\n';
  result += '  Bulan lalu: ' + formatRupiah(lastExpense) + '\n';
  result += '  ' + (expenseDiff >= 0 ? '📈' : '📉') + ' ' + (expensePercent >= 0 ? '+' : '') + expensePercent.toFixed(1) + '%\n';
  
  return PERSONALITY.enhance(result, 'default', { text: result });
}

function getTopExpenseCategory() {
  var today = new Date();
  var monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  
  var expenses = allTransactions.filter(function(t) { 
    return t.type === 'pengeluaran' && t.transaction_date.startsWith(monthStr);
  });
  
  if (expenses.length === 0) {
    return '📤 Belum ada pengeluaran bulan ini.';
  }
  
  var categories = {};
  expenses.forEach(function(t) {
    categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
  });
  
  var sorted = Object.entries(categories).sort(function(a, b) { return b[1] - a[1]; });
  var total = sorted.reduce(function(sum, item) { return sum + item[1]; }, 0);
  
  var result = '🔥 KATEGORI PENGELUARAN TERBESAR\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  sorted.slice(0, 5).forEach(function(item, i) {
    var percent = ((item[1] / total) * 100).toFixed(1);
    result += (i+1) + '. ' + item[0] + ': ' + formatRupiah(item[1]) + ' (' + percent + '%)\n';
  });
  
  return PERSONALITY.enhance(result, 'default', { text: result });
}

function getTopIncomeCategory() {
  var today = new Date();
  var monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  
  var incomes = allTransactions.filter(function(t) { 
    return t.type === 'pemasukan' && t.transaction_date.startsWith(monthStr);
  });
  
  if (incomes.length === 0) {
    return '📥 Belum ada pemasukan bulan ini.';
  }
  
  var categories = {};
  incomes.forEach(function(t) {
    categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
  });
  
  var sorted = Object.entries(categories).sort(function(a, b) { return b[1] - a[1]; });
  var total = sorted.reduce(function(sum, item) { return sum + item[1]; }, 0);
  
  var result = '🔥 SUMBER PEMASUKAN TERBESAR\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  sorted.slice(0, 5).forEach(function(item, i) {
    var percent = ((item[1] / total) * 100).toFixed(1);
    result += (i+1) + '. ' + item[0] + ': ' + formatRupiah(item[1]) + ' (' + percent + '%)\n';
  });
  
  return PERSONALITY.enhance(result, 'default', { text: result });
}

function getFinancialAdvice() {
  var today = new Date();
  var monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  
  var monthIncome = allTransactions.filter(function(t) { return t.type === 'pemasukan' && t.transaction_date.startsWith(monthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var monthExpense = allTransactions.filter(function(t) { return t.type === 'pengeluaran' && t.transaction_date.startsWith(monthStr); }).reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  
  var ratio = monthIncome > 0 ? (monthExpense / monthIncome) * 100 : 0;
  var advice = [];
  
  if (monthIncome === 0 && monthExpense === 0) {
    return '📊 Belum ada data keuangan bulan ini. Mulai catat transaksi Anda!';
  }
  
  advice.push('📊 Rasio Pengeluaran: ' + ratio.toFixed(1) + '% dari pemasukan');
  
  if (ratio > 80) {
    advice.push('⚠️ Pengeluaran Anda > 80% dari pemasukan! Segera evaluasi.');
  } else if (ratio > 60) {
    advice.push('📊 Pengeluaran cukup sehat, tapi masih bisa dioptimalkan.');
  } else if (ratio > 0) {
    advice.push('✅ Pengeluaran terkendali dengan baik! Pertahankan.');
  }
  
  if (monthExpense > monthIncome) {
    advice.push('🚨 Pengeluaran melebihi pemasukan! Cari cara mengurangi pengeluaran.');
  }
  
  var expenses = allTransactions.filter(function(t) { return t.type === 'pengeluaran' && t.transaction_date.startsWith(monthStr); });
  var categories = {};
  expenses.forEach(function(t) { categories[t.category] = (categories[t.category] || 0) + Number(t.amount); });
  var sorted = Object.entries(categories).sort(function(a, b) { return b[1] - a[1]; });
  
  if (sorted.length > 0) {
    var top = sorted[0];
    var topPercent = ((top[1] / monthExpense) * 100).toFixed(1);
    advice.push('💡 ' + top[0] + ' adalah pengeluaran terbesar (' + topPercent + '%). Coba kurangi!');
  }
  
  var result = '💡 SARAN KEUANGAN\n━━━━━━━━━━━━━━━━━━━━━\n' + advice.join('\n');
  return PERSONALITY.enhance(result, 'default', { text: result });
}

// ============================================================
// ===== LOW PRIORITY FUNCTIONS =====
// ============================================================

function getExpenseThisWeek() {
  var today = new Date();
  var startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  var startStr = startOfWeek.toISOString().split('T')[0];
  
  var expenses = allTransactions.filter(function(t) { 
    return t.type === 'pengeluaran' && t.transaction_date >= startStr;
  });
  
  if (expenses.length === 0) {
    return '📤 Tidak ada pengeluaran minggu ini.';
  }
  
  var total = expenses.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var detail = expenses.map(function(t) { return t.category + ': ' + formatRupiah(t.amount); }).join('\n');
  var result = '📤 Pengeluaran minggu ini: ' + formatRupiah(total) + '\n' + detail;
  return PERSONALITY.enhance(result, 'expense', { amount: formatRupiah(total), category: expenses.length > 0 ? expenses[0].category : '' });
}

function getIncomeThisWeek() {
  var today = new Date();
  var startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  var startStr = startOfWeek.toISOString().split('T')[0];
  
  var incomes = allTransactions.filter(function(t) { 
    return t.type === 'pemasukan' && t.transaction_date >= startStr;
  });
  
  if (incomes.length === 0) {
    return '📥 Tidak ada pemasukan minggu ini.';
  }
  
  var total = incomes.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var detail = incomes.map(function(t) { return t.category + ': ' + formatRupiah(t.amount); }).join('\n');
  var result = '📥 Pemasukan minggu ini: ' + formatRupiah(total) + '\n' + detail;
  return PERSONALITY.enhance(result, 'income', { amount: formatRupiah(total), category: incomes.length > 0 ? incomes[0].category : '' });
}

function getTransactionsToday() {
  var today = new Date().toISOString().split('T')[0];
  var transactions = allTransactions.filter(function(t) { return t.transaction_date === today; });
  
  if (transactions.length === 0) {
    return '📊 Tidak ada transaksi hari ini.';
  }
  
  var income = transactions.filter(function(t) { return t.type === 'pemasukan'; });
  var expense = transactions.filter(function(t) { return t.type === 'pengeluaran'; });
  var totalIncome = income.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var totalExpense = expense.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  
  var result = '📊 TRANSAKSI HARI INI\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📥 Pemasukan: ' + formatRupiah(totalIncome) + ' (' + income.length + ')\n';
  result += '📤 Pengeluaran: ' + formatRupiah(totalExpense) + ' (' + expense.length + ')\n';
  result += '💰 Saldo: ' + formatRupiah(totalIncome - totalExpense) + '\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  
  transactions.forEach(function(t) {
    var icon = t.type === 'pemasukan' ? '📥' : '📤';
    var amt = t.type === 'pemasukan' ? '+' : '-';
    result += icon + ' ' + t.category + ': ' + amt + formatRupiah(t.amount);
    if (t.description) result += ' (' + t.description + ')';
    result += '\n';
  });
  
  return PERSONALITY.enhance(result, 'default', { text: result });
}

function getTransactionsYesterday() {
  var yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  var yesterdayStr = yesterday.toISOString().split('T')[0];
  var transactions = allTransactions.filter(function(t) { return t.transaction_date === yesterdayStr; });
  
  if (transactions.length === 0) {
    return '📊 Tidak ada transaksi kemarin (' + yesterday.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + ').';
  }
  
  var income = transactions.filter(function(t) { return t.type === 'pemasukan'; });
  var expense = transactions.filter(function(t) { return t.type === 'pengeluaran'; });
  var totalIncome = income.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  var totalExpense = expense.reduce(function(sum, t) { return sum + Number(t.amount); }, 0);
  
  var result = '📊 TRANSAKSI KEMARIN\n';
  result += '📅 ' + yesterday.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + '\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  result += '📥 Pemasukan: ' + formatRupiah(totalIncome) + ' (' + income.length + ')\n';
  result += '📤 Pengeluaran: ' + formatRupiah(totalExpense) + ' (' + expense.length + ')\n';
  result += '💰 Saldo: ' + formatRupiah(totalIncome - totalExpense) + '\n';
  result += '━━━━━━━━━━━━━━━━━━━━━\n';
  
  transactions.forEach(function(t) {
    var icon = t.type === 'pemasukan' ? '📥' : '📤';
    var amt = t.type === 'pemasukan' ? '+' : '-';
    result += icon + ' ' + t.category + ': ' + amt + formatRupiah(t.amount) + '\n';
  });
  
  return PERSONALITY.enhance(result, 'default', { text: result });
}

// ============================================================
// ===== CRUD FUNCTIONS =====
// ============================================================

async function createTransactionWithWallet(category, amount, description, walletId) {
  description = description || '';
  
  if (!walletId) {
    if (!allWallets.length) return 'Belum ada dompet. Silakan buat dompet terlebih dahulu.';
    walletId = allWallets[0].id;
  }
  
  var wallet = allWallets.find(function(w) { return w.id === walletId; });
  var walletName = wallet ? wallet.name : 'Dompet';
  
  var type = categories.income.some(function(c) { return c.name === category; }) ? 'pemasukan' : 'pengeluaran';
  
  if (type === 'pengeluaran') {
    var validation = await validateWalletBalance(walletId, amount);
    if (!validation.valid) {
      return '❌ ' + validation.message;
    }
  }
  
  var payload = { 
    type: type, 
    amount: amount, 
    category: category, 
    description: description, 
    transaction_date: new Date().toISOString().split('T')[0], 
    wallet_id: walletId 
  };
  
  await db.from('transactions').insert([payload]);
  await fetchData();
  
  var result = 'Transaksi ' + category + ' sebesar ' + formatRupiah(amount) + ' menggunakan dompet ' + walletName + ' berhasil ditambahkan.';
  if (description) result += ' (' + description + ')';
  return PERSONALITY.enhance(result, 'expense', { amount: formatRupiah(amount), category: category });
}

async function deleteLastTransaction() {
  if (allTransactions.length === 0) return 'Tidak ada transaksi untuk dihapus.';
  var last = allTransactions[0];
  await db.from('transactions').delete().eq('id', last.id);
  await fetchData();
  var result = 'Transaksi ' + last.category + ' sebesar ' + formatRupiah(last.amount) + ' berhasil dihapus.';
  return PERSONALITY.enhance(result, 'default', { text: result });
}

async function deleteTransactionByCategory(category, amount) {
  var found = allTransactions.find(function(t) { return t.category === category && Math.abs(t.amount - amount) < 100; });
  if (!found) return 'Tidak ditemukan transaksi ' + category + ' sebesar ' + formatRupiah(amount) + '.';
  await db.from('transactions').delete().eq('id', found.id);
  await fetchData();
  var result = 'Transaksi ' + found.category + ' sebesar ' + formatRupiah(found.amount) + ' berhasil dihapus.';
  return PERSONALITY.enhance(result, 'default', { text: result });
}

async function deleteTransactionById(id) {
  var found = allTransactions.find(function(t) { return t.id === id; });
  if (!found) return 'Transaksi tidak ditemukan.';
  var category = found.category;
  var amount = found.amount;
  await db.from('transactions').delete().eq('id', id);
  await fetchData();
  var result = 'Transaksi ' + category + ' sebesar ' + formatRupiah(amount) + ' berhasil dihapus.';
  return PERSONALITY.enhance(result, 'default', { text: result });
}

async function createGoal(name, targetAmount, walletId) {
  if (!allWallets.length) return 'Belum ada dompet. Silakan buat dompet terlebih dahulu.';
  
  if (!walletId) {
    walletId = allWallets[0].id;
  }
  
  var wallet = allWallets.find(function(w) { return w.id === walletId; });
  var walletName = wallet ? wallet.name : 'Dompet';
  
  await db.from('savings_goals').insert([{ 
    name: name, 
    target_amount: targetAmount, 
    wallet_id: walletId, 
    is_completed: false,
    saved_amount: 0 
  }]);
  
  await fetchData();
  var result = 'Target tabungan ' + name + ' sebesar ' + formatRupiah(targetAmount) + ' menggunakan dompet ' + walletName + ' berhasil dibuat.';
  return PERSONALITY.enhance(result, 'default', { text: result });
}

async function topUpGoal(name, amount) {
  var goal = allGoals.find(function(g) { return g.name.toLowerCase() === name.toLowerCase(); });
  if (!goal) return 'Target tabungan ' + name + ' tidak ditemukan.';
  if (!allWallets.length) return 'Belum ada dompet. Silakan buat dompet terlebih dahulu.';
  var walletId = goal.wallet_id || allWallets[0].id;
  
  var validation = await validateWalletBalance(walletId, amount);
  if (!validation.valid) {
    return '❌ ' + validation.message;
  }
  
  var newAmount = Number(goal.saved_amount) + amount;
  await db.from('savings_goals').update({ saved_amount: newAmount }).eq('id', goal.id);
  await db.from('transactions').insert([{ type: 'pengeluaran', amount: amount, category: 'Tabungan', description: 'Isi tabungan ' + goal.name, transaction_date: new Date().toISOString().split('T')[0], wallet_id: walletId }]);
  if (newAmount >= goal.target_amount) {
    var updatedGoal = { ...goal, saved_amount: newAmount, wallet_id: walletId };
    await cairkanTabungan(updatedGoal);
    await fetchData();
    var result = '🎉 Selamat! Tabungan ' + goal.name + ' sudah mencapai target! Otomatis cair ke dompet Anda.';
    return PERSONALITY.enhance(result, 'default', { text: result });
  }
  await fetchData();
  var result = 'Tabungan ' + goal.name + ' berhasil diisi ' + formatRupiah(amount) + '. Total terkumpul ' + formatRupiah(newAmount) + '.';
  return PERSONALITY.enhance(result, 'default', { text: result });
}

async function cairkanTabungan(goal) {
  console.log('🔥 Memproses pencairan tabungan:', goal.name);
  
  var walletId = goal.wallet_id || allWallets[0]?.id;
  if (!walletId) {
    console.warn('Tidak ada dompet untuk mencairkan tabungan.');
    return;
  }
  
  var wallet = allWallets.find(function(w) { return w.id === walletId; });
  var walletName = wallet ? wallet.name : 'Dompet';
  var amount = Number(goal.saved_amount);
  
  await db.from('transactions').insert([{ 
    type: 'pemasukan', 
    amount: amount, 
    category: 'Tabungan', 
    description: 'Tabungan ' + goal.name + ' cair ke ' + walletName, 
    transaction_date: new Date().toISOString().split('T')[0], 
    wallet_id: walletId 
  }]);
  
  await db.from('savings_goals').update({ 
    is_completed: true, 
    updated_at: new Date().toISOString() 
  }).eq('id', goal.id);
  
  var synth = window.speechSynthesis;
  if (synth) {
    var utterance = new SpeechSynthesisUtterance('🎉 Selamat! Tabungan ' + goal.name + ' sebesar ' + formatRupiah(amount) + ' telah cair ke ' + walletName + '.');
    utterance.lang = 'id-ID';
    utterance.rate = 0.95;
    synth.speak(utterance);
  }
  
  await fetchData();
}

async function createSchedulePlan(title, amount, dateStr) {
  var payload = { 
    title: title, 
    amount: amount, 
    plan_date: dateStr, 
    is_paid: false,
    plan_type: 'pengeluaran',
    note: ''
  };
  await db.from('scheduled_plans').insert([payload]);
  await fetchData();
  var result = 'Rencana ' + title + ' sebesar ' + formatRupiah(amount) + ' untuk tanggal ' + new Date(dateStr).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) + ' berhasil disimpan.';
  return PERSONALITY.enhance(result, 'plan', { title: title, amount: formatRupiah(amount) });
}

// ===== TAMBAH DOMPET VIA SUARA =====
async function createWallet(name, balance) {
  if (allWallets.find(function(w) { return w.name.toLowerCase() === name.toLowerCase(); })) {
    return '❌ Dompet "' + name + '" sudah ada.';
  }
  
  var result = await db.from('wallets').insert([{
    name: name,
    icon: 'credit-card',
    balance: 0
  }]).select();
  
  var walletData = result.data;
  var walletError = result.error;
  
  if (walletError) {
    return '❌ Gagal membuat dompet: ' + walletError.message;
  }
  
  if (balance > 0 && walletData && walletData.length > 0) {
    var wallet = walletData[0];
    await db.from('transactions').insert([{
      type: 'pemasukan',
      amount: balance,
      category: 'Saldo Awal',
      description: 'Saldo awal ' + name,
      transaction_date: new Date().toISOString().split('T')[0],
      wallet_id: wallet.id
    }]);
  }
  
  await fetchData();
  var resultMsg = '✅ Dompet "' + name + '" berhasil dibuat' + (balance > 0 ? ' dengan saldo awal ' + formatRupiah(balance) : '') + '.';
  return PERSONALITY.enhance(resultMsg, 'default', { text: resultMsg });
}

// ============================================================
// ===== PARSING PERINTAH (FIX - URUTAN CRUD DI ATAS) =====
// ============================================================

function parseCommand(text) {
  var lower = text.toLowerCase()
                  .replace(/^(tolong|asisten|coba|dong|sih|eh|hai|halo|hey|yo|bro|bang|kak|mas|mbak|pak|bu|om|tante)\s+/g, '')
                  .trim();
  
  console.log('🔍 Original:', text);
  console.log('🔍 Cleaned:', lower);
  
  // ============================================================
  // 🔥 1. PERINTAH CRUD - PALING ATAS
  // ============================================================
  
  // ===== TAMBAH TRANSAKSI (DENGAN DETEKSI DOMPET) =====
  if (lower.includes('tambah transaksi') || lower.includes('tambah pengeluaran') || lower.includes('tambah pemasukan')) {
    console.log('🔍 Detected tambah transaksi:', text);
    
    // Cek dompet
    var hasWallet = false;
    var walletName = null;
    allWallets.forEach(function(w) {
      if (lower.includes(w.name.toLowerCase())) {
        hasWallet = true;
        walletName = w.name;
      }
    });
    
    var amount = extractNumberFromText(text);
    var cleanedText = text
      .replace(/tambah (transaksi|pengeluaran|pemasukan)/i, '')
      .replace(/\d+[.,]?\d*/g, '')
      .trim();
    
    cleanedText = cleanedText
      .replace(/\brupiah\b/gi, '')
      .replace(/\bribu\b/gi, '')
      .replace(/\bjuta\b/gi, '')
      .replace(/\bmiliar\b/gi, '')
      .replace(/\bmilyar\b/gi, '')
      .trim();
    
    var category = cleanedText || null;
    
    if (!allWallets.length) {
      return { action: 'error', message: 'Belum ada dompet. Silakan buat dompet terlebih dahulu.' };
    }
    
    if (!hasWallet && allWallets.length > 1) {
      pendingTransaction = { category: category, amount: amount, description: '', walletId: null };
      isWaitingForWallet = true;
      var walletList = allWallets.map(function(w) { return w.name; }).join(', ');
      askFollowUp('Pakai dompet apa? (Dompet tersedia: ' + walletList + ')');
      return null;
    }
    
    var walletId = hasWallet ? allWallets.find(function(w) { return w.name.toLowerCase() === walletName.toLowerCase(); })?.id : allWallets[0].id;
    
    if (!category && amount === 0) {
      pendingTransaction = { category: null, amount: 0, description: '', walletId: walletId };
      isWaitingForCategory = true;
      askFollowUp('Kategori dan berapa nominalnya? (contoh: Makan 25000)');
      return null;
    }
    
    if (category && amount === 0) {
      pendingTransaction = { category: category, amount: 0, description: '', walletId: walletId };
      isWaitingForAmount = true;
      askFollowUp('Berapa nominal untuk transaksi ' + category + '?');
      return null;
    }
    
    if (!category && amount > 0) {
      pendingTransaction = { category: null, amount: amount, description: '', walletId: walletId };
      isWaitingForCategory = true;
      askFollowUp('Kategori transaksi ' + formatRupiah(amount) + ' ini apa?');
      return null;
    }
    
    return { action: 'create', category: category, amount: amount, description: '', walletId: walletId };
  }
  
  // ===== HAPUS TRANSAKSI =====
  if (lower.includes('hapus transaksi')) {
    var match = lower.match(/hapus transaksi\s+([\w\s]+?)(?:\s+([\d\s]+))?/);
    if (match) {
      var category = match[1].trim();
      category = category.charAt(0).toUpperCase() + category.slice(1);
      var amount = match[2] ? extractNumberFromText(match[2]) : 0;
      
      if (amount > 0) {
        return { action: 'delete', category: category, amount: amount };
      }
      
      var found = allTransactions.filter(function(t) { 
        return t.category === category && t.type === 'pengeluaran';
      });
      
      if (found.length === 0) {
        return { action: 'error', message: 'Tidak ditemukan transaksi ' + category + '.' };
      }
      
      if (found.length === 1) {
        return { action: 'delete_with_confirm', id: found[0].id, category: category, amount: found[0].amount };
      }
      
      pendingDeleteContext = { category: category, transactions: found };
      isWaitingForDeleteDate = true;
      askFollowUp('Ada ' + found.length + ' transaksi ' + category + '. Tanggal berapa yang ingin dihapus? (contoh: kemarin, 20 Januari 2025)');
      return null;
    }
    return { action: 'error', message: 'Format: hapus transaksi [kategori]' };
  }
  
  if (lower.includes('hapus transaksi terakhir')) {
    return { action: 'delete_last' };
  }
  
  // ===== BUAT RENCANA (FIX: Ambil nominal yang benar) =====
  if (lower.includes('buat jadwal') || lower.includes('catat rencana') || lower.includes('tambah rencana') || lower.includes('buat rencana')) {
    console.log('🔍 Detected buat rencana:', text);
    
    // 🔥 EKSTRAK JUDUL: ambil setelah "buat jadwal" sampai sebelum angka/nominal
    var titleMatch = text.match(/(?:buat jadwal|catat rencana|tambah rencana|buat rencana)\s+(.+?)(?:\s+\d+|\s+[jJ]anuari|[fF]ebruari|[mM]aret|[aA]pril|[mM]ei|[jJ]uni|[jJ]uli|[aA]gustus|[sS]eptember|[oO]ktober|[nN]ovember|[dD]esember|\s*$)/);
    var title = titleMatch ? titleMatch[1].trim() : '';
    
    // 🔥 EKSTRAK SEMUA NOMINAL dari teks (ambil yang terbesar)
    var allNumbers = text.match(/\d+[.,]?\d*/g);
    var amount = 0;
    if (allNumbers) {
      for (var i = 0; i < allNumbers.length; i++) {
        var num = parseInt(allNumbers[i].replace(/[.,]/g, ''));
        if (num > amount) amount = num;
      }
    }
    
    // 🔥 EKSTRAK TANGGAL
    var dateStr = extractDateFromText(text);
    
    console.log('📂 Title:', title, 'Amount:', amount, 'Date:', dateStr);
    
    // Jika judul kosong, coba ambil dari sisa teks
    if (!title) {
      var cleaned = text.replace(/buat jadwal|catat rencana|tambah rencana|buat rencana/i, '').trim();
      cleaned = cleaned.replace(/\d+[.,]?\d*/g, '').replace(/nominalnya|rupiah|ribu|juta|rb|jt/g, '').trim();
      title = cleaned || 'Rencana';
    }
    
    if (amount === 0) {
      pendingContext = { action: 'create_plan', title: title, date: dateStr };
      isWaitingForAmount = true;
      askFollowUp('Berapa nominal untuk rencana ' + title + '?');
      return null;
    }
    
    return { action: 'create_plan', title: title, amount: amount, date: dateStr };
  }
  
  // ===== BUAT TARGET (DENGAN DETEKSI DOMPET) =====
  if (lower.includes('buat target') || lower.includes('target tabungan')) {
    var match = lower.match(/buat target\s+([\w\s]+?)(?:\s+([\d\s]+))?/);
    if (match) {
      var name = match[1].trim();
      var amount = match[2] ? extractNumberFromText(match[2]) : 0;
      
      if (!allWallets.length) {
        return { action: 'error', message: 'Belum ada dompet. Silakan buat dompet terlebih dahulu.' };
      }
      
      var hasWallet = false;
      var walletName = null;
      allWallets.forEach(function(w) {
        if (lower.includes(w.name.toLowerCase())) {
          hasWallet = true;
          walletName = w.name;
        }
      });
      
      if (!hasWallet && allWallets.length > 1) {
        pendingGoal = { name: name, amount: amount, walletId: null };
        isWaitingForGoalWallet = true;
        var walletList = allWallets.map(function(w) { return w.name; }).join(', ');
        askFollowUp('Pakai dompet apa untuk target ' + name + '? (Dompet tersedia: ' + walletList + ')');
        return null;
      }
      
      var walletId = hasWallet ? allWallets.find(function(w) { return w.name.toLowerCase() === walletName.toLowerCase(); })?.id : allWallets[0].id;
      
      if (amount === 0) {
        pendingGoal = { name: name, amount: 0, walletId: walletId };
        isWaitingForAmount = true;
        askFollowUp('Berapa nominal target ' + name + '?');
        return null;
      }
      
      return { action: 'create_goal', name: name, amount: amount, walletId: walletId };
    }
    return { action: 'error', message: 'Format: buat target [nama target] [nominal]' };
  }
  
  // ===== ISI TARGET =====
  if (lower.includes('isi target') || lower.includes('topup') || lower.includes('tambah tabungan')) {
    var match = lower.match(/(isi target|topup|tambah tabungan)\s+([\w\s]+?)\s+([\d\s]+)/);
    if (match) {
      var name = match[2].trim();
      var amount = extractNumberFromText(match[3]);
      if (amount === 0) return { action: 'error', message: 'Nominal tidak valid.' };
      return { action: 'topup_goal', name: name, amount: amount };
    }
    return { action: 'error', message: 'Format: isi target [nama target] [nominal]' };
  }
  
  // ===== TAMBAH DOMPET =====
  if (lower.includes('tambah dompet') || lower.includes('buat dompet') || lower.includes('dompet baru')) {
    var match = lower.match(/(tambah dompet|buat dompet|dompet baru)\s+(\w+)(?:\s+([\d\s]+))?/);
    if (match) {
      var name = match[2].trim();
      var balance = match[3] ? extractNumberFromText(match[3]) : 0;
      if (balance === 0) {
        pendingContext = { action: 'create_wallet', name: name, balance: 0 };
        isWaitingForBalance = true;
        askFollowUp('Berapa saldo awal untuk dompet ' + name + '?');
        return null;
      }
      return { action: 'create_wallet', name: name, balance: balance };
    }
    return { action: 'error', message: 'Format: tambah dompet [nama] [opsional saldo]' };
  }
  
  // ============================================================
  // 🔥 2. PERINTAH CEK DATA - DI BAWAH CRUD
  // ============================================================
  
  if (lower.includes('saldo') || lower.includes('total saldo') || lower.includes('uang saya') || (lower.includes('berapa') && lower.includes('saldo'))) {
    return { action: 'get_balance' };
  }
  
  if (lower.includes('pengeluaran') || lower.includes('keluar')) {
    if (lower.includes('minggu ini')) return { action: 'get_expense_week' };
    return { action: 'get_expense_today' };
  }
  
  if (lower.includes('pemasukan') || lower.includes('masuk')) {
    if (lower.includes('minggu ini')) return { action: 'get_income_week' };
    return { action: 'get_income_today' };
  }
  
  if (lower.includes('transaksi')) {
    if (lower.includes('bulan ini')) return { action: 'get_transactions_month' };
    if (lower.includes('kemarin')) return { action: 'get_transactions_yesterday' };
    return { action: 'get_transactions_today' };
  }
  
  if (lower.includes('ringkasan') || lower.includes('summary') || lower.includes('keuangan saya') || lower.includes('ringkas') || lower.includes('laporan')) {
    return { action: 'get_summary' };
  }
  
  if (lower.includes('tandai lunas') || lower.includes('lunas') || lower.includes('bayar') || lower.includes('sudah dibayar')) {
    var match = lower.match(/(tandai lunas|lunas|bayar|sudah dibayar)\s+(.+)/);
    if (match) return { action: 'mark_paid', title: match[2].trim() };
    return { action: 'error', message: 'Format: tandai lunas [nama rencana]' };
  }
  
  if (lower.includes('kirim wa') || lower.includes('kirim whatsapp') || lower.includes('tagih') || lower.includes('wa ke')) {
    var match = lower.match(/(kirim wa|kirim whatsapp|tagih|wa ke)\s+(?:ke\s+)?(.+)/);
    if (match) return { action: 'send_wa', target: match[2].trim() };
    return { action: 'error', message: 'Format: kirim wa [nama klien]' };
  }
  
  if (lower.includes('kirim wa semua') || lower.includes('kirim whatsapp semua') || lower.includes('tagih semua') || lower.includes('wa ke semua') || lower.includes('kirim ke semua')) {
    return { action: 'send_all_wa' };
  }
  
  if (lower.includes('piutang') && (lower.includes('jatuh tempo') || lower.includes('hari ini'))) {
    return { action: 'get_due_income' };
  }
  if (lower.includes('tagihan') && (lower.includes('jatuh tempo') || lower.includes('hari ini'))) {
    return { action: 'get_due_expense' };
  }
  
  if (lower.includes('saldo') && lower.includes('dompet')) {
    var match = lower.match(/saldo\s+dompet\s+(.+)/);
    if (match) return { action: 'get_wallet_balance', name: match[1].trim() };
    return { action: 'error', message: 'Format: saldo dompet [nama dompet]' };
  }
  
  if (lower.includes('semua dompet') || lower.includes('tampilkan dompet') || lower.includes('daftar dompet')) {
    return { action: 'get_all_wallets' };
  }
  
  if (lower.includes('bandingkan') || lower.includes('perbandingan') || lower.includes('bulan lalu')) {
    return { action: 'get_comparison' };
  }
  
  if (lower.includes('pengeluaran terbesar') || lower.includes('kategori terbesar') || lower.includes('paling besar')) {
    return { action: 'get_top_expense' };
  }
  if (lower.includes('pemasukan terbesar') || lower.includes('sumber terbesar')) {
    return { action: 'get_top_income' };
  }
  
  if (lower.includes('saran') || lower.includes('tips') || lower.includes('nasihat')) {
    return { action: 'get_advice' };
  }
  
  if (lower.includes('rencana') && lower.includes('tanggal')) {
    var match = lower.match(/rencana\s+tanggal\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
    if (match) {
      var day = parseInt(match[1]);
      var month = match[2].toLowerCase();
      var year = parseInt(match[3]);
      var monthMap = { 'januari':0, 'februari':1, 'maret':2, 'april':3, 'mei':4, 'juni':5, 'juli':6, 'agustus':7, 'september':8, 'oktober':9, 'november':10, 'desember':11 };
      var monthNum = monthMap[month];
      if (monthNum !== undefined) {
        var dateStr = year + '-' + String(monthNum + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        return { action: 'get_plans_by_date', date: dateStr };
      }
    }
    return { action: 'error', message: 'Format: rencana tanggal [hari] [bulan] [tahun]' };
  }
  
  if (lower.includes('rencana') && lower.includes('bulan ini')) return { action: 'get_plans_month' };
  if (lower.includes('rencana') && lower.includes('minggu ini')) return { action: 'get_plans_week' };
  
  if (lower.includes('bantuan') || lower.includes('help') || lower.includes('tolong') || lower.includes('perintah')) {
    return { action: 'show_help' };
  }
  
  if (lower.includes('ganti nama') || lower.includes('nama saya') || lower.includes('panggil')) {
    var match = lower.match(/(ganti nama|nama saya|panggil)\s+(?:jadi\s+)?(.+)/);
    if (match) return { action: 'change_name', name: match[2].trim() };
    return { action: 'error', message: 'Format: ganti nama [nama baru]' };
  }
  
  if (lower.includes('matikan suara') || lower.includes('berhenti') || lower.includes('stop') || lower.includes('mati')) {
    return { action: 'stop_assistant' };
  }
  
  if (lower.includes('tagihan') && (lower.includes('bulan depan') || lower.includes('next month'))) {
    return { action: 'get_next_bills' };
  }
  if (lower.includes('piutang') && (lower.includes('bulan depan') || lower.includes('next month'))) {
    return { action: 'get_next_receivables' };
  }
  
  return { action: 'ask' };
}

// ============================================================
// ===== PROSES PERINTAH =====
// ============================================================

async function processCommand(text) {
  console.log('🔍 processCommand received:', text);
  var parsed = parseCommand(text);
  console.log('🔍 Parsed result:', parsed);
  
  if (parsed === null) return null;
  if (parsed.action === 'error') return parsed.message;
  
  if (parsed.action === 'create') return await createTransactionWithWallet(parsed.category, parsed.amount, parsed.description || '', parsed.walletId);
  if (parsed.action === 'delete_last') return await deleteLastTransaction();
  if (parsed.action === 'delete') return await deleteTransactionByCategory(parsed.category, parsed.amount);
  if (parsed.action === 'delete_with_confirm') return await deleteTransactionById(parsed.id);
  if (parsed.action === 'create_goal') {
    if (!parsed.amount || parsed.amount === 0) {
      pendingContext = { action: 'create_goal', name: parsed.name };
      isWaitingForAmount = true;
      askFollowUp('Berapa nominal target ' + parsed.name + '?');
      return null;
    }
    return await createGoal(parsed.name, parsed.amount, parsed.walletId);
  }
  if (parsed.action === 'topup_goal') return await topUpGoal(parsed.name, parsed.amount);
  if (parsed.action === 'create_plan') {
    if (!parsed.amount || parsed.amount === 0) {
      pendingContext = { action: 'create_plan', title: parsed.title, date: parsed.date };
      isWaitingForAmount = true;
      askFollowUp('Berapa nominal untuk rencana ' + parsed.title + '?');
      return null;
    }
    return await createSchedulePlan(parsed.title, parsed.amount, parsed.date);
  }
  if (parsed.action === 'create_wallet') {
    if (parsed.balance === 0) {
      pendingContext = { action: 'create_wallet', name: parsed.name };
      isWaitingForBalance = true;
      askFollowUp('Berapa saldo awal untuk dompet ' + parsed.name + '?');
      return null;
    }
    return await createWallet(parsed.name, parsed.balance);
  }
  
  if (parsed.action === 'get_balance') return getBalance();
  if (parsed.action === 'get_expense_today') return getExpenseToday();
  if (parsed.action === 'get_income_today') return getIncomeToday();
  if (parsed.action === 'mark_paid') return await markAsPaid(parsed.title);
  if (parsed.action === 'send_wa') return await sendWACommand(parsed.target);
  if (parsed.action === 'send_all_wa') return await sendAllWABulk();
  if (parsed.action === 'get_transactions_month') return getTransactionsThisMonth();
  if (parsed.action === 'get_due_income') return getDueIncomeToday();
  if (parsed.action === 'get_due_expense') return getDueExpenseToday();
  if (parsed.action === 'get_wallet_balance') return getWalletBalance(parsed.name);
  if (parsed.action === 'get_all_wallets') return getAllWallets();
  if (parsed.action === 'get_summary') return getFinancialSummary();
  if (parsed.action === 'get_comparison') return getMonthComparison();
  if (parsed.action === 'get_top_expense') return getTopExpenseCategory();
  if (parsed.action === 'get_top_income') return getTopIncomeCategory();
  if (parsed.action === 'get_advice') return getFinancialAdvice();
  if (parsed.action === 'get_plans_by_date') return getPlansByDate(parsed.date);
  if (parsed.action === 'get_plans_month') return getPlansThisMonth();
  if (parsed.action === 'get_plans_week') return getPlansThisWeek();
  if (parsed.action === 'show_help') return showHelp();
  if (parsed.action === 'change_name') return changeAssistantName(parsed.name);
  if (parsed.action === 'stop_assistant') {
    stopAssistant();
    return '🔇 Asisten dimatikan. Klik mic untuk menghidupkan lagi.';
  }
  if (parsed.action === 'get_expense_week') return getExpenseThisWeek();
  if (parsed.action === 'get_income_week') return getIncomeThisWeek();
  if (parsed.action === 'get_transactions_today') return getTransactionsToday();
  if (parsed.action === 'get_transactions_yesterday') return getTransactionsYesterday();
  if (parsed.action === 'get_next_bills') return getNextMonthBills();
  if (parsed.action === 'get_next_receivables') return getNextMonthReceivables();
  
  return await askGemini(text);
}

// ============================================================
// ===== ASK GEMINI =====
// ============================================================

async function askGemini(text) {
  var ctx = getFinancialContext();
  
  var prompt = 'Anda adalah asisten keuangan pribadi yang ramah bernama ' + assistantName + '. Pengguna bertanya: "' + text + '".\n';
  prompt += 'Data keuangan terkini:\n';
  prompt += '- Total saldo: ' + formatRupiah(ctx.balance) + '\n';
  prompt += '- Pemasukan hari ini: ' + formatRupiah(ctx.incomeToday) + '\n';
  prompt += '- Pengeluaran hari ini: ' + formatRupiah(ctx.expenseToday) + '\n';
  prompt += '- Total pengeluaran bulan ini: ' + formatRupiah(ctx.expenseMonth) + '\n';
  prompt += '- Total pemasukan keseluruhan: ' + formatRupiah(ctx.totalIncome) + '\n';
  prompt += '- Total pengeluaran keseluruhan: ' + formatRupiah(ctx.totalExpense) + '\n';
  prompt += '- Transaksi terakhir: ' + (ctx.recent || 'Belum ada transaksi') + '\n';
  prompt += 'Jawab dengan singkat, jelas, dan dalam bahasa Indonesia. Jika pertanyaan tidak terkait keuangan, tetap bantu dengan sopan.';

  if (typeof SUPABASE_FUNCTION_URL === 'undefined' || !SUPABASE_FUNCTION_URL) {
    console.error('❌ SUPABASE_FUNCTION_URL tidak terdefinisi!');
    var fallbackMsg = getLocalFallbackResponse(text);
    return PERSONALITY.enhance(fallbackMsg, 'default', { text: fallbackMsg });
  }

  try {
    var response = await fetch(SUPABASE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });

    if (response.status === 429) {
      var errData = await response.json();
      if (errData.fallback || errData.error === 'QUOTA_EXHAUSTED') {
        var fallbackMsg = getLocalFallbackResponse(text);
        return PERSONALITY.enhance(fallbackMsg, 'default', { text: fallbackMsg });
      }
    }

    if (!response.ok) {
      var err = await response.json();
      throw new Error(err.error || 'Gagal memproses permintaan');
    }

    var data = await response.json();
    var result = data.result || 'Maaf, tidak ada jawaban.';
    return PERSONALITY.enhance(result, 'default', { text: result });
    
  } catch (error) {
    console.error('❌ Gemini proxy error:', error);
    var fallbackMsg = getLocalFallbackResponse(text);
    return PERSONALITY.enhance(fallbackMsg, 'default', { text: fallbackMsg });
  }
}

// ============================================================
// ===== PROSES DENGAN KONFIRMASI =====
// ============================================================

async function processWithConfirmation(text) {
  var parsed = parseCommand(text);
  
  if (parsed === null) return null;
  
  var noConfirmActions = [
    'get_balance', 'get_expense_today', 'get_income_today', 'get_transactions_month',
    'get_due_income', 'get_due_expense', 'get_wallet_balance', 'get_all_wallets',
    'get_summary', 'get_comparison', 'get_top_expense', 'get_top_income', 'get_advice',
    'get_plans_by_date', 'get_plans_month', 'get_plans_week', 'show_help',
    'get_expense_week', 'get_income_week', 'get_transactions_today', 'get_transactions_yesterday',
    'get_next_bills', 'get_next_receivables', 'stop_assistant'
  ];
  
  if (parsed.action === 'ask' || parsed.action === 'error') {
    var reply = await processCommand(text);
    return reply;
  }
  
  if (noConfirmActions.includes(parsed.action)) {
    return await processCommand(text);
  }
  
  var confirmMessage = '';
  
  if (parsed.action === 'create') {
    confirmMessage = 'Apakah Anda yakin ingin menambahkan transaksi ' + parsed.category + ' sebesar ' + formatRupiah(parsed.amount) + '?';
  } else if (parsed.action === 'delete_last') {
    var last = allTransactions[0];
    if (!last) return 'Tidak ada transaksi untuk dihapus.';
    confirmMessage = 'Apakah Anda yakin ingin menghapus transaksi ' + last.category + ' sebesar ' + formatRupiah(last.amount) + '?';
  } else if (parsed.action === 'delete') {
    confirmMessage = 'Apakah Anda yakin ingin menghapus transaksi ' + parsed.category + ' sebesar ' + formatRupiah(parsed.amount) + '?';
  } else if (parsed.action === 'delete_with_confirm') {
    confirmMessage = 'Apakah Anda yakin ingin menghapus transaksi ini?';
  } else if (parsed.action === 'create_goal') {
    confirmMessage = 'Apakah Anda yakin ingin membuat target ' + parsed.name + ' sebesar ' + formatRupiah(parsed.amount) + '?';
  } else if (parsed.action === 'topup_goal') {
    confirmMessage = 'Apakah Anda yakin ingin mengisi ' + parsed.name + ' sebesar ' + formatRupiah(parsed.amount) + '?';
  } else if (parsed.action === 'create_plan') {
    var dateFormatted = new Date(parsed.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
    confirmMessage = 'Apakah Anda yakin ingin membuat rencana ' + parsed.title + ' sebesar ' + formatRupiah(parsed.amount) + ' untuk tanggal ' + dateFormatted + '?';
  } else if (parsed.action === 'create_wallet') {
    confirmMessage = 'Apakah Anda yakin ingin membuat dompet "' + parsed.name + '"' + (parsed.balance > 0 ? ' dengan saldo ' + formatRupiah(parsed.balance) : '') + '?';
  } else if (parsed.action === 'mark_paid') {
    confirmMessage = 'Apakah Anda yakin ingin menandai "' + parsed.title + '" sebagai lunas?';
  } else if (parsed.action === 'send_wa') {
    confirmMessage = 'Apakah Anda yakin ingin mengirim WhatsApp ke "' + parsed.target + '"?';
  } else if (parsed.action === 'send_all_wa') {
    var today = new Date().toISOString().split('T')[0];
    var count = allScheduledPlans.filter(function(p) { return p.plan_date < today && !p.is_paid && p.plan_type === 'pemasukan' && p.wa_number; }).length;
    if (count === 0) return 'Tidak ada piutang telat yang memiliki nomor WhatsApp.';
    confirmMessage = 'Apakah Anda yakin ingin mengirim WhatsApp ke ' + count + ' klien yang telat?';
  } else {
    return await processCommand(text);
  }
  
  if (confirmMessage) {
    speak(confirmMessage + ' Jawab ya atau tidak.', function() { 
      isWaitingForConfirm = true; 
      if (isAssistantOn) setTimeout(function() { startListening(); }, 500); 
    });
    window._pendingCommand = parsed;
    return null;
  }
  
  return await processCommand(text);
}

console.log('🤖 AI Assistant ready - Fleksibel + Follow-up + Supabase Edge Function!');