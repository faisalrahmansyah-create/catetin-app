// ============================================
// UI - User Interface Helpers
// ============================================

// ===== SIDEBAR =====
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

function toggleSidebar() {
  if (document.getElementById('sidebar').classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

// ===== SET MIN DATE =====
function setMinDateForInputs() {
  const today = new Date().toISOString().split('T')[0];
  
  const transactionInputs = ['dateInput'];
  transactionInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.removeAttribute('min');
      el.value = today;
    }
  });
  
  const scheduleInputs = ['scheduleDateInput', 'payDateInput'];
  scheduleInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.min = today;
      el.value = today;
    }
  });
}

// ===== SETUP TABS =====
function setupTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = {
    transactions: document.getElementById('transactionsTab'),
    calendar: document.getElementById('calendarTab')
  };
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      Object.values(panels).forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      const target = this.dataset.tab;
      if (panels[target]) panels[target].classList.add('active');
      if (target === 'calendar') renderCalendar();
    });
  });
}

// ===== DARK MODE =====
function initDarkMode() {
  const darkToggle = document.getElementById('darkModeToggle');
  if (localStorage.getItem('darkMode') === 'enabled') { 
    document.body.classList.add('dark'); 
    document.getElementById('darkIcon').setAttribute('data-lucide', 'sun'); 
  }
  if (darkToggle) {
    darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      if (document.body.classList.contains('dark')) { 
        localStorage.setItem('darkMode', 'enabled'); 
        document.getElementById('darkIcon').setAttribute('data-lucide', 'sun'); 
      } else { 
        localStorage.setItem('darkMode', 'disabled'); 
        document.getElementById('darkIcon').setAttribute('data-lucide', 'moon'); 
      }
      lucide.createIcons();
    });
  }
}

// ===== TEMPLATE WA =====
function openWATemplateModal() {
  const textarea = document.getElementById('waTemplateInput');
  if (textarea) {
    textarea.value = getWATemplate();
  }
  document.getElementById('waTemplateModal').classList.add('open');
  closeSidebar();
}

function saveWATemplate(template) {
  localStorage.setItem('wa_template', template);
}

function getWATemplate() {
  return localStorage.getItem('wa_template') || DEFAULT_WA_TEMPLATE;
}

// ===== NOTIFIKASI BROWSER =====
function sendBrowserNotification(title, message) {
  if (!("Notification" in window)) {
    console.log('Browser tidak mendukung notifikasi.');
    return;
  }
  
  if (Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showNotification(title, message);
      }
    });
  } else if (Notification.permission === 'granted') {
    showNotification(title, message);
  }
}

function showNotification(title, message) {
  try {
    const notification = new Notification(title, {
      body: message,
      icon: '/favicon.ico'
    });
    
    notification.onclick = function() {
      window.focus();
      this.close();
    };
    
    setTimeout(() => notification.close(), 10000);
  } catch (error) {
    console.warn('Gagal menampilkan notifikasi:', error);
  }
}

// ===== FETCH DATA =====
async function fetchData() {
  if (!isLoggedIn) return;
  
  const loading = document.getElementById('loadingOverlay');
  if (loading) loading.style.display = 'flex';
  
  try {
    const resWallets = await db.from('wallets').select('*').order('created_at', { ascending: true });
    if (!resWallets.error) {
      allWallets = resWallets.data;
      renderWalletsAndSummary(allTransactions);
    }

    const resTx = await db.from('transactions').select('*').order('transaction_date', { ascending: false }).order('created_at', { ascending: false });
    if (!resTx.error) {
      allTransactions = resTx.data;
      renderTransactions(allTransactions);
      renderWalletsAndSummary(allTransactions);
      updateInsight();
    }

    const resPlan = await db.from('scheduled_plans').select('*').eq('is_paid', false);
    if (!resPlan.error) {
      allScheduledPlans = resPlan.data;
      renderCalendar();
      checkReminders();
      updateScheduleBadge();
      updateTotalScheduleAmount();
      checkOverduePlans();
    }

    const resGoals = await db.from('savings_goals').select('*').order('created_at', { ascending: false });
    if (!resGoals.error) {
      allGoals = resGoals.data;
      renderGoals();
    }
    
    if (typeof PERSONALITY !== 'undefined') {
      const successMsg = PERSONALITY.enhance('Data keuangan berhasil dimuat!', 'default', { text: 'Data keuangan berhasil dimuat!' });
      console.log('✅', successMsg);
    }
    
  } catch (error) {
    console.error('Error fetching data:', error);
    if (typeof PERSONALITY !== 'undefined') {
      const errorMsg = PERSONALITY.enhance('Gagal memuat data. Coba refresh ya!', 'default', { text: 'Gagal memuat data. Coba refresh ya!' });
      alert(errorMsg);
    } else {
      alert('Gagal memuat data. Silakan refresh halaman.');
    }
  } finally {
    if (loading) loading.style.display = 'none';
    lucide.createIcons();
  }
}

// ============================================
// VOICE GUIDE - TABBED CATEGORIES
// ============================================

function openVoiceGuideModal() {
  var categories = [
    {
      id: 'transaksi',
      icon: '💰',
      label: 'Transaksi',
      commands: [
        '"Tambah pengeluaran Makan 25000"',
        '"Tambah pemasukan Gaji 5 juta"',
        '"Tambah transaksi Beli baju 150000"',
        '"Hapus transaksi terakhir"',
        '"Hapus transaksi Makan"',
        '"Hapus transaksi Makan 25000"'
      ]
    },
    {
      id: 'cek-data',
      icon: '📊',
      label: 'Cek Data',
      commands: [
        '"Saldo saya berapa?"',
        '"Saldo dompet OVO"',
        '"Tampilkan semua dompet"',
        '"Pemasukan hari ini"',
        '"Pengeluaran hari ini"',
        '"Pemasukan minggu ini"',
        '"Pengeluaran minggu ini"',
        '"Transaksi hari ini"',
        '"Transaksi kemarin"',
        '"Ringkasan keuangan"',
        '"Bandingkan dengan bulan lalu"',
        '"Pengeluaran terbesar"',
        '"Pemasukan terbesar"',
        '"Saran keuangan"'
      ]
    },
    {
      id: 'dompet',
      icon: '💳',
      label: 'Dompet',
      commands: [
        '"Tambah dompet OVO"',
        '"Tambah dompet BCA 500000"',
        '"Tambah dompet [nama] [saldo]"'
      ]
    },
    {
      id: 'rencana',
      icon: '📅',
      label: 'Rencana & Jadwal',
      commands: [
        '"Buat rencana Bayar listrik 200000 besok"',
        '"Buat rencana Gaji masuk 5 juta 25 Januari"',
        '"Buat jadwal Beli HP 3 juta minggu depan"',
        '"Catat rencana Bayar kos 1 juta 1 Februari"',
        '"Tandai lunas Bayar listrik"',
        '"Terbayar Gaji masuk"',
        '"Rencana tanggal 20 Januari 2026"',
        '"Rencana bulan ini"',
        '"Rencana minggu ini"'
      ]
    },
    {
      id: 'target',
      icon: '🎯',
      label: 'Target Tabungan',
      commands: [
        '"Buat target Liburan 10 juta"',
        '"Buat target [nama] [nominal]"',
        '"Isi target Liburan 500000"',
        '"Topup Liburan 1 juta"'
      ]
    },
    {
      id: 'wa',
      icon: '💬',
      label: 'WhatsApp',
      commands: [
        '"Kirim WA ke Andi"',
        '"Tagih Budi"',
        '"Kirim whatsapp ke [nama]"',
        '"Kirim WA semua"',
        '"Kirim whatsapp semua"',
        '"Tagih semua"'
      ]
    },
    {
      id: 'piutang-tagihan',
      icon: '📋',
      label: 'Piutang & Tagihan',
      commands: [
        '"Piutang jatuh tempo"',
        '"Tagihan jatuh tempo"',
        '"Tagihan bulan depan"',
        '"Piutang bulan depan"'
      ]
    },
    {
      id: 'format',
      icon: '📝',
      label: 'Format Nominal & Tanggal',
      commands: [
        'Rp25.000 → "25 ribu" atau "25rb"',
        'Rp5.000.000 → "5 juta" atau "5jt"',
        'Rp2.000.000.000 → "2 miliar" atau "2m"',
        'Rp100.000 → "cepek" atau "seratus ribu"',
        'Rp500.000 → "gopek" atau "lima ratus ribu"',
        'Tanggal → "hari ini", "besok", "lusa"',
        'Tanggal → "20 Januari 2026"',
        'Tanggal → "20/01/2026"'
      ]
    },
    {
      id: 'lainnya',
      icon: '⚙️',
      label: 'Lainnya',
      commands: [
        '"Matikan suara" atau "Stop"',
        '"Berhenti" atau "Mati"',
        '"Ganti nama jadi Siti"',
        '"Panggil [nama]"'
      ]
    }
  ];

  var tabsHTML = categories.map(function(cat, index) {
    var active = index === 0 ? 'active' : '';
    return `
      <button class="voice-tab ${active}" data-tab="${cat.id}">
        ${cat.icon} ${cat.label}
      </button>
    `;
  }).join('');

  var panelsHTML = categories.map(function(cat, index) {
    var active = index === 0 ? 'active' : '';
    var commandsHTML = cat.commands.map(function(cmd) {
      return `<code class="voice-command">${cmd}</code>`;
    }).join('');
    
    return `
      <div class="voice-panel ${active}" id="voicePanel_${cat.id}">
        <h4 class="voice-panel-title">📌 ${cat.label}</h4>
        <div class="voice-commands">${commandsHTML}</div>
      </div>
    `;
  }).join('');

  var modal = document.createElement('div');
  modal.className = 'modal open';
  modal.id = 'voiceGuideModal';
  modal.innerHTML = `
    <div class="modal-content" style="max-width:500px; max-height:85vh; overflow:hidden; display:flex; flex-direction:column; background:var(--bg-secondary);">
      <div class="modal-header">
        <h3>🎤 Panduan AI Voice</h3>
        <button onclick="document.getElementById('voiceGuideModal').remove()" class="icon-btn">
          <i data-lucide="x"></i>
        </button>
      </div>
      <div class="voice-tabs">${tabsHTML}</div>
      <div class="voice-panels" style="flex:1; overflow-y:auto; padding:16px 0;">
        ${panelsHTML}
      </div>
      <div style="padding:12px 0 0; border-top:2px solid var(--border-color);">
        <p style="text-align:center; font-weight:600; color:var(--text-secondary); font-size:13px;">
          💡 Coba katakan salah satu perintah di atas!
        </p>
        <button onclick="document.getElementById('voiceGuideModal').remove()" 
                class="btn-save" 
                style="margin-top:8px; background:#8338EC; color:white; border:4px solid var(--border-color);">
          ✅ Saya Mengerti
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelectorAll('.voice-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var targetId = this.dataset.tab;
      
      modal.querySelectorAll('.voice-tab').forEach(function(t) {
        t.classList.remove('active');
      });
      this.classList.add('active');
      
      modal.querySelectorAll('.voice-panel').forEach(function(p) {
        p.classList.remove('active');
      });
      
      var panel = modal.querySelector('#voicePanel_' + targetId);
      if (panel) panel.classList.add('active');
    });
  });

  lucide.createIcons();
  closeSidebar();
}

// ============================================
// WHATS NEW
// ============================================

function openWhatsNewModal() {
  alert(
    '📢 WHATS NEW - CatetIn v2.0\n\n' +
    '✨ Fitur Baru:\n' +
    '• 🎤 AI Voice Assistant (bisa ngobrol!)\n' +
    '• 📊 Laporan Perbandingan bulanan\n' +
    '• 💳 Multi-dompet dengan validasi saldo\n' +
    '• 📅 Kalender Rencana + Pengingat\n' +
    '• 📱 Template WhatsApp otomatis\n' +
    '• 🎯 Target Tabungan dengan progress\n' +
    '• 🌙 Dark Mode\n\n' +
    '🛠️ Perbaikan:\n' +
    '• Optimasi loading data\n' +
    '• Perbaikan UI Neo-Brutalism\n\n' +
    '📌 Selamat mencatat keuangan!'
  );
  closeSidebar();
}

console.log('✅ UI module loaded with Voice Guide & Whats New');

