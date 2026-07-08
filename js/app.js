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

