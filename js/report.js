// ============================================
// REPORT - Laporan Transaksi & Perbandingan
// ============================================

let comparisonChartInstance = null;

// ============================================================
// ===== BUKA LAPORAN TRANSAKSI =====
// ============================================================

function openReportTransactions() {
  var modal = document.getElementById('reportTransactionsModal');
  if (!modal) return;
  
  // Isi filter dompet
  var filterSelect = document.getElementById('reportWalletFilter');
  if (filterSelect) {
    filterSelect.innerHTML = '<option value="all">Semua Dompet</option>';
    allWallets.forEach(function(w) {
      filterSelect.innerHTML += '<option value="' + w.id + '">' + w.name + '</option>';
    });
  }
  
  // Set default month ke bulan ini
  var monthInput = document.getElementById('reportMonthFilter');
  if (monthInput) {
    var now = new Date();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    monthInput.value = now.getFullYear() + '-' + month;
  }
  
  modal.classList.add('open');
  renderReportTransactions();
  closeSidebar();
}

// ============================================================
// ===== RENDER LAPORAN TRANSAKSI =====
// ============================================================

function renderReportTransactions() {
  var container = document.getElementById('reportTransactionsContainer');
  if (!container) return;
  
  var walletId = document.getElementById('reportWalletFilter').value;
  var month = document.getElementById('reportMonthFilter').value;
  
  // Filter transaksi
  var filtered = allTransactions.slice(); // copy array
  
  if (walletId !== 'all') {
    filtered = filtered.filter(function(t) { return t.wallet_id === walletId; });
  }
  
  if (month) {
    filtered = filtered.filter(function(t) { return t.transaction_date && t.transaction_date.startsWith(month); });
  }
  
  // Urutkan dari yang terbaru
  filtered.sort(function(a, b) { 
    if (a.transaction_date !== b.transaction_date) {
      return b.transaction_date.localeCompare(a.transaction_date);
    }
    return b.created_at ? b.created_at.localeCompare(a.created_at) : 0;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="report-empty">📭 Tidak ada transaksi</div>';
    return;
  }
  
  var html = '';
  filtered.forEach(function(t) {
    var isIncome = t.type === 'pemasukan';
    var wallet = allWallets.find(function(w) { return w.id === t.wallet_id; });
    var walletName = wallet ? wallet.name : 'Dompet';
    var date = new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    
    html += `
      <div class="report-transaction-item">
        <div>
          <span class="rt-category">${t.category}</span>
          <span class="rt-wallet">📱 ${walletName}</span>
        </div>
        <div style="text-align:right;">
          <span class="rt-amount ${isIncome ? 'income' : 'expense'}">
            ${isIncome ? '+' : '-'} ${formatRupiah(t.amount)}
          </span>
          <div class="rt-wallet">${date}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

// ============================================================
// ===== BUKA LAPORAN PERBANDINGAN =====
// ============================================================

function openReportComparison() {
  var modal = document.getElementById('reportComparisonModal');
  if (!modal) return;
  
  modal.classList.add('open');
  renderComparisonChart();
  closeSidebar();
}

// ============================================================
// ===== RENDER CHART PERBANDINGAN =====
// ============================================================

function renderComparisonChart() {
  var now = new Date();
  var currentMonth = now.getMonth();
  var currentYear = now.getFullYear();
  var lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  var lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  var currentMonthStr = currentYear + '-' + String(currentMonth + 1).padStart(2, '0');
  var lastMonthStr = lastMonthYear + '-' + String(lastMonth + 1).padStart(2, '0');
  
  // Hitung data
  function calcMonth(monthStr) {
    var income = 0, expense = 0;
    allTransactions.forEach(function(t) {
      if (t.transaction_date && t.transaction_date.startsWith(monthStr)) {
        if (t.type === 'pemasukan') income += Number(t.amount);
        else expense += Number(t.amount);
      }
    });
    return { income: income, expense: expense, balance: income - expense };
  }
  
  var current = calcMonth(currentMonthStr);
  var last = calcMonth(lastMonthStr);
  
  // Update summary
  document.getElementById('compIncome').textContent = formatRupiah(current.income);
  document.getElementById('compExpense').textContent = formatRupiah(current.expense);
  document.getElementById('compBalance').textContent = formatRupiah(current.balance);
  
  // Hitung perubahan
  function calcChange(currentVal, lastVal) {
    if (lastVal === 0) {
      if (currentVal === 0) return { text: '+0%', class: 'positive' };
      return { text: '+100%', class: 'positive' };
    }
    var change = ((currentVal - lastVal) / lastVal) * 100;
    var sign = change >= 0 ? '+' : '';
    return { 
      text: sign + change.toFixed(1) + '%', 
      class: change >= 0 ? 'positive' : 'negative' 
    };
  }
  
  var incomeChange = calcChange(current.income, last.income);
  var expenseChange = calcChange(current.expense, last.expense);
  var balanceChange = calcChange(current.balance, last.balance);
  
  document.getElementById('incomeChange').textContent = incomeChange.text;
  document.getElementById('incomeChange').className = 'change ' + incomeChange.class;
  document.getElementById('expenseChange').textContent = expenseChange.text;
  document.getElementById('expenseChange').className = 'change ' + expenseChange.class;
  document.getElementById('balanceChange').textContent = balanceChange.text;
  document.getElementById('balanceChange').className = 'change ' + balanceChange.class;
  
  // ===== RENDER CHART =====
  var ctx = document.getElementById('comparisonChart');
  if (!ctx) return;
  
  // Load Chart.js jika belum
  if (typeof Chart === 'undefined') {
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = function() { 
      renderChartData(ctx, current, last, currentMonth, lastMonth, currentYear, lastMonthYear); 
    };
    document.head.appendChild(script);
    return;
  }
  
  renderChartData(ctx, current, last, currentMonth, lastMonth, currentYear, lastMonthYear);
}

// ============================================================
// ===== RENDER CHART DATA =====
// ============================================================

function renderChartData(ctx, current, last, currentMonth, lastMonth, currentYear, lastMonthYear) {
  var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  
  if (comparisonChartInstance) {
    comparisonChartInstance.destroy();
    comparisonChartInstance = null;
  }
  
  // Cek apakah ada data
  var hasData = (last.income > 0 || last.expense > 0 || current.income > 0 || current.expense > 0);
  
  if (!hasData) {
    // Tampilkan pesan jika tidak ada data
    var parent = ctx.parentNode;
    var msg = document.createElement('div');
    msg.style.cssText = 'text-align:center; padding:40px 20px; color:#8A8A8A; font-weight:500;';
    msg.textContent = '📊 Belum ada data transaksi untuk bulan ini dan bulan lalu.';
    
    // Hapus pesan lama jika ada
    var oldMsg = parent.querySelector('.chart-empty-msg');
    if (oldMsg) oldMsg.remove();
    
    msg.className = 'chart-empty-msg';
    parent.appendChild(msg);
    
    // Sembunyikan canvas
    ctx.style.display = 'none';
    return;
  }
  
  // Tampilkan canvas
  ctx.style.display = 'block';
  
  // Hapus pesan kosong jika ada
  var parent = ctx.parentNode;
  var oldMsg = parent.querySelector('.chart-empty-msg');
  if (oldMsg) oldMsg.remove();
  
  var isDark = document.body.classList.contains('dark');
  var textColor = isDark ? '#EAEAEA' : '#1A1A1A';
  var gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  
  comparisonChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        monthNames[lastMonth] + ' ' + lastMonthYear, 
        monthNames[currentMonth] + ' ' + currentYear
      ],
      datasets: [
        {
          label: '📥 Pemasukan',
          data: [last.income, current.income],
          backgroundColor: ['#34D399', '#06D6A0'],
          borderColor: '#1A1A1A',
          borderWidth: 3,
          borderRadius: 0,
          hoverBackgroundColor: ['#2ECC71', '#05C48A'],
        },
        {
          label: '📤 Pengeluaran',
          data: [last.expense, current.expense],
          backgroundColor: ['#F87171', '#EF476F'],
          borderColor: '#1A1A1A',
          borderWidth: 3,
          borderRadius: 0,
          hoverBackgroundColor: ['#E06060', '#D63A5A'],
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            font: { size: 12, weight: 'bold' },
            color: textColor,
            boxWidth: 16,
            padding: 16,
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: gridColor,
            drawBorder: false,
          },
          ticks: {
            font: { size: 11, weight: '600' },
            color: isDark ? '#AAAAAA' : '#4A4A4A',
            callback: function(value) {
              if (value >= 1000000000) return (value / 1000000000) + 'M';
              if (value >= 1000000) return (value / 1000000) + 'jt';
              if (value >= 1000) return (value / 1000) + 'rb';
              return value;
            }
          }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 13, weight: '700' },
            color: textColor,
          }
        }
      },
      // Animasi
      animation: {
        duration: 800,
        easing: 'easeOutQuart'
      }
    }
  });
}

// ============================================================
// ===== REFRESH CHART SAAT DARK MODE BERUBAH =====
// ============================================================

// Jika dark mode berubah, refresh chart (jika terbuka)
document.addEventListener('DOMContentLoaded', function() {
  var darkToggle = document.getElementById('darkModeToggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', function() {
      var modal = document.getElementById('reportComparisonModal');
      if (modal && modal.classList.contains('open')) {
        // Refresh chart setelah dark mode berubah
        setTimeout(function() {
          renderComparisonChart();
        }, 100);
      }
    });
  }
});

// ============================================================
// ===== CLOSE LISTENER UNTUK MODAL LAPORAN (FIX) =====
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  
  // ===== CLOSE MODAL LAPORAN TRANSAKSI =====
  var closeTxBtn = document.getElementById('closeReportTransactionsModal');
  if (closeTxBtn) {
    closeTxBtn.addEventListener('click', function() {
      var modal = document.getElementById('reportTransactionsModal');
      if (modal) modal.classList.remove('open');
    });
  }
  
  // ===== CLOSE MODAL PERBANDINGAN =====
  var closeCompBtn = document.getElementById('closeReportComparisonModal');
  if (closeCompBtn) {
    closeCompBtn.addEventListener('click', function() {
      var modal = document.getElementById('reportComparisonModal');
      if (modal) modal.classList.remove('open');
    });
  }
  
  // ===== CLOSE VIA OVERLAY (klik di luar modal) =====
  document.addEventListener('click', function(e) {
    var txModal = document.getElementById('reportTransactionsModal');
    var compModal = document.getElementById('reportComparisonModal');
    
    if (txModal && e.target === txModal) {
      txModal.classList.remove('open');
    }
    if (compModal && e.target === compModal) {
      compModal.classList.remove('open');
    }
  });
  
  // ===== CLOSE VIA TOMBOL "Terapkan" =====
  var applyBtn = document.getElementById('applyReportFilter');
  if (applyBtn) {
    applyBtn.addEventListener('click', function() {
      renderReportTransactions();
    });
  }
  
  // ===== CLOSE VIA ESC KEY =====
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var txModal = document.getElementById('reportTransactionsModal');
      var compModal = document.getElementById('reportComparisonModal');
      
      if (txModal && txModal.classList.contains('open')) {
        txModal.classList.remove('open');
      }
      if (compModal && compModal.classList.contains('open')) {
        compModal.classList.remove('open');
      }
    }
  });
  
  console.log('✅ Report modal close listeners attached');
});

console.log('✅ Report module loaded with fixes');