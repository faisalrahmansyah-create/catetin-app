// ============================================
// APP - Entry Point (Semua Inisialisasi)
// ============================================

console.log('📦 Cashflow App - Starting...');

// ===== INISIALISASI SEMUA MODUL =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 DOM Ready - Initializing all modules...');
  
  // ===== 1. SETUP TABS =====
  setupTabs();
  console.log('✅ Tabs initialized');
  
  // ===== 2. SET MIN DATE =====
  setMinDateForInputs();
  console.log('✅ Min date set');
  
  // ===== 3. DARK MODE =====
  initDarkMode();
  console.log('✅ Dark mode initialized');
  
  // ===== 4. SIDEBAR =====
  const hamburger = document.getElementById('hamburgerBtn');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const overlay = document.getElementById('sidebarOverlay');
  if (hamburger) hamburger.addEventListener('click', toggleSidebar);
  if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
  console.log('✅ Sidebar initialized');
  
  // ===== 4.5. DROPDOWN LAPORAN =====
  const menuReports = document.getElementById('menuReports');
  const dropdownReports = document.getElementById('dropdownReports');
  
  if (menuReports && dropdownReports) {
    const dropdownArrow = menuReports.querySelector('.dropdown-arrow');
    
    menuReports.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownReports.classList.toggle('open');
      if (dropdownArrow) {
        dropdownArrow.classList.toggle('open');
      }
    });

    document.addEventListener('click', function(e) {
      if (!menuReports.contains(e.target) && !dropdownReports.contains(e.target)) {
        dropdownReports.classList.remove('open');
        if (dropdownArrow) {
          dropdownArrow.classList.remove('open');
        }
      }
    });
  }
  console.log('✅ Report dropdown initialized');
  
  // ===== 5. SIDEBAR MENU =====
  const summaryMenu = document.querySelector('.sidebar-menu-item[data-menu="summary"]');
  const categoryMenu = document.querySelector('.sidebar-menu-item[data-menu="category"]');
  const historyMenu = document.querySelector('.sidebar-menu-item[data-menu="history"]');
  const waMenu = document.querySelector('.sidebar-menu-item[data-menu="wa-template"]');
  const voiceGuideMenu = document.querySelector('.sidebar-menu-item[data-menu="voice-guide"]');
  const whatsNewMenu = document.querySelector('.sidebar-menu-item[data-menu="whats-new"]');

  // ===== SUB MENU LAPORAN =====
  const reportTransactions = document.querySelector('.sidebar-menu-item[data-menu="transactions-report"]');
  const reportIncomeExpense = document.querySelector('.sidebar-menu-item[data-menu="income-expense-report"]');
  const reportCategory = document.querySelector('.sidebar-menu-item[data-menu="category-report"]');

  if (summaryMenu) summaryMenu.addEventListener('click', openSummaryModal);
  if (categoryMenu) categoryMenu.addEventListener('click', openPieChartModal);
  if (historyMenu) historyMenu.addEventListener('click', openHistoryModal);
  if (waMenu) waMenu.addEventListener('click', openWATemplateModal);
  if (voiceGuideMenu) voiceGuideMenu.addEventListener('click', openVoiceGuideModal);
  if (whatsNewMenu) whatsNewMenu.addEventListener('click', openWhatsNewModal);

  // ===== EVENT LISTENER UNTUK SUB MENU LAPORAN =====
  if (reportTransactions) reportTransactions.addEventListener('click', openReportTransactions);
  if (reportIncomeExpense) reportIncomeExpense.addEventListener('click', openReportComparison);
  if (reportCategory) reportCategory.addEventListener('click', openPieChartModal);
  console.log('✅ Sidebar menu initialized with all items');
  
  // ===== 6. LOGOUT =====
  const logoutBtn = document.getElementById('sidebarLogoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  console.log('✅ Logout button attached');
  
  // ===== 7. LOGIN GOOGLE =====
  const googleBtn = document.getElementById('googleLoginBtn');
  if (googleBtn) googleBtn.addEventListener('click', loginWithGoogle);
  console.log('✅ Google login button attached');
  
  // ===== 8. GO TO RENCANA =====
  const goToRencana = document.getElementById('goToRencanaBtn');
  if (goToRencana) {
    goToRencana.addEventListener('click', function() {
      const tabBtn = document.querySelector('.tab-btn[data-tab="calendar"]');
      if (tabBtn) tabBtn.click();
      const tooltip = document.getElementById('overdueTooltip');
      if (tooltip) tooltip.classList.remove('show');
    });
  }
  console.log('✅ Go to rencana button attached');
  
  // ===== 9. OVERDUE BADGE =====
  const overdueBadge = document.getElementById('overdueBadge');
  const overdueTooltip = document.getElementById('overdueTooltip');
  if (overdueBadge && overdueTooltip) {
    overdueBadge.addEventListener('click', function(e) {
      e.stopPropagation();
      overdueTooltip.classList.toggle('show');
    });
    document.addEventListener('click', function() {
      overdueTooltip.classList.remove('show');
    });
  }
  console.log('✅ Overdue badge initialized');
  
  // ===== 10. INSIGHT CARD =====
  const incomeCard = document.getElementById('incomeCard');
  const expenseCard = document.getElementById('expenseCard');
  const incomeInsight = document.getElementById('incomeInsight');
  const expenseInsight = document.getElementById('expenseInsight');
  if (incomeCard) {
    incomeCard.addEventListener('click', function(e) {
      e.stopPropagation();
      if (expenseInsight) expenseInsight.classList.remove('active');
      if (incomeInsight) incomeInsight.classList.toggle('active');
    });
  }
  if (expenseCard) {
    expenseCard.addEventListener('click', function(e) {
      e.stopPropagation();
      if (incomeInsight) incomeInsight.classList.remove('active');
      if (expenseInsight) expenseInsight.classList.toggle('active');
    });
  }
  document.addEventListener('click', function() {
    if (incomeInsight) incomeInsight.classList.remove('active');
    if (expenseInsight) expenseInsight.classList.remove('active');
  });
  console.log('✅ Insight cards initialized');
  
  // ===== 11. TEMPLATE WA =====
  const waForm = document.getElementById('waTemplateForm');
  if (waForm) {
    waForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const template = document.getElementById('waTemplateInput').value;
      if (template.trim().length === 0) {
        alert('Template tidak boleh kosong.');
        return;
      }
      saveWATemplate(template);
      document.getElementById('waTemplateModal').classList.remove('open');
      alert('✅ Template WhatsApp berhasil disimpan!');
    });
  }
  const closeWaModal = document.getElementById('closeWATemplateModal');
  if (closeWaModal) {
    closeWaModal.addEventListener('click', function() {
      document.getElementById('waTemplateModal').classList.remove('open');
    });
  }
  console.log('✅ WA Template initialized');
  
  // ===== 12. CLOSE HISTORY =====
  const closeHistory = document.getElementById('closeHistoryModal');
  if (closeHistory) {
    closeHistory.addEventListener('click', function() {
      document.getElementById('historyModal').classList.remove('open');
    });
  }
  console.log('✅ History modal initialized');
  
  // ===== 13. ASSISTANT TOGGLE =====
  const assistantToggle = document.getElementById('assistantToggle');
  if (assistantToggle) {
    assistantToggle.addEventListener('click', function() {
      console.log('🔄 Assistant toggle clicked');
      if (isAssistantOn) {
        stopAssistant();
      } else {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(() => {
              console.log('✅ Microphone permission granted');
              startAssistant();
            })
            .catch((err) => {
              console.error('❌ Microphone permission denied:', err);
              alert('Izin mikrofon diperlukan untuk menggunakan asisten suara.\n\nSilakan:\n1. Klik ikon gembok di address bar\n2. Izinkan akses mikrofon\n3. Refresh halaman');
            });
        } else {
          alert('Browser Anda tidak mendukung akses mikrofon.');
        }
      }
    });
    console.log('✅ Assistant toggle button attached');
  } else {
    console.warn('⚠️ Assistant toggle button not found');
  }
  
  // ===== 14. CHECK BROWSER SUPPORT (ASSISTANT) =====
  checkBrowserSupport();
  const status = document.getElementById('assistantStatus');
  if (status && !status.textContent.includes('Tidak Support')) {
    status.textContent = 'OFF';
  }
  console.log('✅ Assistant status initialized');
  
  // ===== 15. CHECK AUTH =====
  checkAuth();
  console.log('✅ Auth check completed');
  
  // ===== 15.5 SETUP APP LISTENER (UNTUK DEEP LINK) =====
  if (typeof setupAppListener === 'function') {
    setTimeout(setupAppListener, 1000);
    console.log('✅ App listener setup called');
  } else {
    console.warn('⚠️ setupAppListener not available');
  }
  
  // ===== 16. DEFAULT TAB =====
  const defaultTab = document.querySelector('.tab-btn[data-tab="transactions"]');
  if (defaultTab) defaultTab.click();
  console.log('✅ Default tab set');
  
  // ===== 17. REFRESH ICONS =====
  lucide.createIcons();
  console.log('✅ Icons refreshed');
  
  console.log('✅✅✅ Cashflow App Fully Loaded!');
});

console.log('📦 Cashflow App - All modules ready');

// ============================================================
// NOTIFICATION LISTENER - OTOMATIS CATAT DARI NOTIFIKASI
// ============================================================

let notifListener = null;

async function startNotificationListener() {
  try {
    // Cek apakah running di native Android
    if (typeof Capacitor === 'undefined' || !Capacitor.isNative) {
      console.log('📱 Not running in native app, skipping notification listener');
      return;
    }

    // Import plugin
    const { NotificationsListener } = await import('capacitor-notifications-listener');
    const listener = NotificationsListener;
    notifListener = listener;

    // Cek izin
    const isListening = await listener.isListening();
    console.log('📱 Is listening:', isListening);

    if (!isListening) {
      await listener.requestPermission();
      // User harus aktifkan manual di: Settings → Apps → Special access → Notification access
    }

    // Mulai listening
    await listener.startListening({
      packagesWhitelist: [
        'com.bca',
        'com.dana',
        'com.ovo',
        'com.shopee',
        'com.gopay',
        'com.mandiri',
        'com.bni',
        'com.bri'
      ]
    });

    console.log('✅ Notification listener started');

    // Tangkap notifikasi
    listener.addListener('notificationReceivedEvent', (notification) => {
      console.log('📱 Notifikasi tertangkap:', notification);

      const combined = [
        notification.apptitle || '',
        notification.title || '',
        notification.text || '',
        ...(notification.textlines || [])
      ].join(' ');

      const result = parseNotificationText(combined);
      
      if (result && result.amount > 0) {
        showNotifConfirmation(result);
      }
    });

  } catch (error) {
    console.warn('⚠️ Notification listener error:', error);
  }
}

// ===== PARSE NOTIFIKASI =====
function parseNotificationText(text) {
  if (!text || text.trim().length === 0) return null;

  const lower = text.toLowerCase();
  const result = {
    type: 'pengeluaran',
    amount: 0,
    category: null,
    wallet: null,
    walletName: null,
    merchant: null
  };

  // Deteksi jenis
  const incomeKeywords = ['masuk', 'diterima', 'transfer masuk', 'kredit', 'topup', 'gaji', 'bonus'];
  const expenseKeywords = ['keluar', 'terbayar', 'transfer keluar', 'debit', 'pembayaran', 'belanja', 'bayar'];
  
  let incomeScore = 0, expenseScore = 0;
  incomeKeywords.forEach(kw => { if (lower.includes(kw)) incomeScore++; });
  expenseKeywords.forEach(kw => { if (lower.includes(kw)) expenseScore++; });

  // Ekstrak nominal
  const amount = extractNumberFromText(text);
  result.amount = amount;

  // Deteksi dompet
  const walletKeywords = ['dana', 'ovo', 'shopeepay', 'gopay', 'bca', 'bni', 'bri', 'mandiri'];
  let detectedWallet = null;
  for (const kw of walletKeywords) {
    if (lower.includes(kw)) {
      detectedWallet = kw;
      break;
    }
  }
  if (detectedWallet) {
    const found = allWallets.find(w => w.name.toLowerCase() === detectedWallet);
    if (found) {
      result.wallet = found.id;
      result.walletName = found.name;
    }
  }

  // Ekstrak merchant
  const patterns = [
    /(?:ke|di|pada|untuk)\s+([a-zA-Z\s]+?)(?:\s+sebesar|\s+senilai|\s*$)/i,
    /pembayaran\s+([a-zA-Z\s]+?)(?:\s+sebesar|\s*$)/i,
    /belanja\s+(?:di|pada)\s+([a-zA-Z\s]+?)(?:\s+sebesar|\s*$)/i
  ];
  let merchant = null;
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      merchant = match[1].trim();
      break;
    }
  }
  if (merchant) {
    result.merchant = merchant;
    result.category = merchant;
  }

  // Tentukan jenis
  if (incomeScore > expenseScore) result.type = 'pemasukan';
  else if (expenseScore > incomeScore) result.type = 'pengeluaran';
  else {
    if (lower.includes('bayar') || lower.includes('belanja')) result.type = 'pengeluaran';
    else if (lower.includes('gaji') || lower.includes('bonus')) result.type = 'pemasukan';
  }

  if (result.amount === 0) return null;
  return result;
}

// ===== POPUP KONFIRMASI =====
function showNotifConfirmation(data) {
  const msg = '📱 Notifikasi Terdeteksi!\n\n' +
    (data.type === 'pemasukan' ? '📥' : '📤') + ' ' + formatRupiah(data.amount) + '\n' +
    'Kategori: ' + (data.category || 'Tidak terdeteksi') + '\n' +
    'Dompet: ' + (data.walletName || 'Belum ada dompet') + '\n\n' +
    'Simpan transaksi ini?';
  
  if (confirm(msg)) {
    saveNotificationTransaction(data);
  }
}

// ===== SIMPAN TRANSAKSI =====
async function saveNotificationTransaction(data) {
  try {
    let walletId = data.wallet;
    if (!walletId && allWallets.length > 0) {
      walletId = allWallets[0].id;
    }
    if (!walletId) {
      alert('❌ Belum ada dompet. Silakan buat dompet terlebih dahulu.');
      return;
    }

    await db.from('transactions').insert([{
      type: data.type,
      amount: data.amount,
      category: data.category || 'Notifikasi',
      description: 'Dari notifikasi',
      transaction_date: new Date().toISOString().split('T')[0],
      wallet_id: walletId
    }]);

    await fetchData();
    alert('✅ Transaksi dari notifikasi berhasil disimpan!');
  } catch (error) {
    console.error('Error saving notification:', error);
    alert('❌ Gagal menyimpan transaksi.');
  }
}

// ===== EKSPOR GLOBAL =====
window.startNotificationListener = startNotificationListener;
window.parseNotificationText = parseNotificationText;
window.saveNotificationTransaction = saveNotificationTransaction;
window.showNotifConfirmation = showNotifConfirmation;

console.log('✅ Notification listener module loaded');
