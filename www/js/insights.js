// ============================================
// INSIGHTS - Laporan & Analisis
// ============================================

let pieChartInstance = null;
let chartJsLoaded = false;

// ===== LAZY LOAD CHART.JS =====
async function loadChartJS() {
  if (chartJsLoaded) return;
  if (typeof Chart !== 'undefined') {
    chartJsLoaded = true;
    return;
  }
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = () => {
      chartJsLoaded = true;
      resolve();
    };
    script.onerror = () => {
      console.error('❌ Gagal load Chart.js');
      resolve();
    };
    document.head.appendChild(script);
  });
}

// ===== UPDATE INSIGHT =====
function updateInsight() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const currentMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const lastMonthStr = `${lastMonthYear}-${String(lastMonth + 1).padStart(2, '0')}`;
  
  // Data bulan ini
  const currentIncome = allTransactions.filter(t => t.type === 'pemasukan' && t.transaction_date.startsWith(currentMonthStr));
  const currentExpense = allTransactions.filter(t => t.type === 'pengeluaran' && t.transaction_date.startsWith(currentMonthStr));
  const lastIncome = allTransactions.filter(t => t.type === 'pemasukan' && t.transaction_date.startsWith(lastMonthStr));
  const lastExpense = allTransactions.filter(t => t.type === 'pengeluaran' && t.transaction_date.startsWith(lastMonthStr));
  
  const currentIncomeTotal = currentIncome.reduce((sum, t) => sum + Number(t.amount), 0);
  const lastIncomeTotal = lastIncome.reduce((sum, t) => sum + Number(t.amount), 0);
  const currentExpenseTotal = currentExpense.reduce((sum, t) => sum + Number(t.amount), 0);
  const lastExpenseTotal = lastExpense.reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Hitung saldo dan rasio
  const totalBalance = currentIncomeTotal - currentExpenseTotal;
  const expenseRatio = currentIncomeTotal > 0 ? (currentExpenseTotal / currentIncomeTotal) * 100 : 0;
  
  // ============================================================
  // ===== INSIGHT PEMASUKAN =====
  // ============================================================
  const incomeBadge = document.getElementById('incomeBadge');
  const incomeInsight = document.getElementById('incomeInsightText');
  
  if (incomeBadge) {
    let badgeText = '';
    let badgeColor = '';
    let badgeBg = '';
    
    if (lastIncomeTotal === 0 && currentIncomeTotal > 0) {
      badgeText = '📊 Baru';
      badgeColor = '#3CB371';
      badgeBg = 'rgba(60,179,113,0.15)';
    } else if (lastIncomeTotal > 0) {
      const change = ((currentIncomeTotal - lastIncomeTotal) / lastIncomeTotal) * 100;
      if (change > 0) {
        badgeText = `▲ ${change.toFixed(1)}%`;
        badgeColor = '#3CB371';
        badgeBg = 'rgba(60,179,113,0.15)';
      } else if (change < 0) {
        badgeText = `▼ ${Math.abs(change).toFixed(1)}%`;
        badgeColor = '#E86868';
        badgeBg = 'rgba(232,104,104,0.15)';
      } else {
        badgeText = '– 0%';
        badgeColor = '#7A8DA0';
        badgeBg = 'rgba(122,141,160,0.15)';
      }
    } else {
      badgeText = '– 0%';
      badgeColor = '#7A8DA0';
      badgeBg = 'rgba(122,141,160,0.15)';
    }
    
    incomeBadge.textContent = badgeText;
    incomeBadge.style.color = badgeColor;
    incomeBadge.style.background = badgeBg;
  }
  
  if (incomeInsight) {
    let insights = [];
    
    if (currentIncome.length === 0) {
      insights.push('Belum ada pemasukan bulan ini.');
    } else {
      // 1. Total & perubahan
      let changeText = '';
      if (lastIncomeTotal === 0 && currentIncomeTotal > 0) {
        changeText = '📊 ini adalah bulan pertama Anda mencatat pemasukan';
      } else if (lastIncomeTotal > 0) {
        const change = ((currentIncomeTotal - lastIncomeTotal) / lastIncomeTotal) * 100;
        if (change > 0) {
          changeText = `📈 naik ${change.toFixed(1)}% dari bulan lalu`;
        } else if (change < 0) {
          changeText = `📉 turun ${Math.abs(change).toFixed(1)}% dari bulan lalu`;
        } else {
          changeText = '📊 stabil dari bulan lalu';
        }
      } else {
        changeText = '📊 data baru';
      }
      insights.push(`▸ Total: ${formatRupiah(currentIncomeTotal)} (${changeText})`);
      
      // 2. Kategori terbesar
      const categoryMap = {};
      currentIncome.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
      });
      const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        const top = sorted[0];
        const topPercent = ((top[1] / currentIncomeTotal) * 100).toFixed(0);
        insights.push(`▸ Sumber terbesar: ${top[0]} (${formatRupiah(top[1])} - ${topPercent}%)`);
        
        // 3. Perubahan kategori dari bulan lalu
        if (lastIncomeTotal > 0) {
          const lastCategoryMap = {};
          lastIncome.forEach(t => {
            lastCategoryMap[t.category] = (lastCategoryMap[t.category] || 0) + Number(t.amount);
          });
          const lastTop = lastCategoryMap[top[0]] || 0;
          if (lastTop > 0) {
            const categoryChange = ((top[1] - lastTop) / lastTop) * 100;
            if (Math.abs(categoryChange) > 10) {
              const catChangeText = categoryChange > 0 ? `naik ${categoryChange.toFixed(1)}%` : `turun ${Math.abs(categoryChange).toFixed(1)}%`;
              insights.push(`▸ ${top[0]} ${catChangeText} dari bulan lalu`);
            }
          }
        }
      }
      
      // 4. Pencapaian (jika ada target tersimpan)
      if (allGoals && allGoals.length > 0) {
        const totalTarget = allGoals.reduce((sum, g) => sum + Number(g.target_amount), 0);
        if (totalTarget > 0 && currentIncomeTotal >= totalTarget) {
          insights.push(`🎉 Selamat! Pemasukan bulan ini mencapai total target tabungan Anda!`);
        } else if (totalTarget > 0) {
          const targetPercent = ((currentIncomeTotal / totalTarget) * 100).toFixed(0);
          insights.push(`📊 Pemasukan mencapai ${targetPercent}% dari total target tabungan (${formatRupiah(totalTarget)})`);
        }
      }
    }
    
    incomeInsight.innerHTML = insights.join('<br>');
  }
  
  // ============================================================
  // ===== INSIGHT PENGELUARAN =====
  // ============================================================
  const expenseBadge = document.getElementById('expenseBadge');
  const expenseInsight = document.getElementById('expenseInsightText');
  
  if (expenseBadge) {
    let badgeText = '';
    let badgeColor = '';
    let badgeBg = '';
    
    if (lastExpenseTotal === 0 && currentExpenseTotal > 0) {
      badgeText = '📊 Baru';
      badgeColor = '#E86868';
      badgeBg = 'rgba(232,104,104,0.15)';
    } else if (lastExpenseTotal > 0) {
      const change = ((currentExpenseTotal - lastExpenseTotal) / lastExpenseTotal) * 100;
      if (change > 0) {
        badgeText = `▲ ${change.toFixed(1)}%`;
        badgeColor = '#E86868';
        badgeBg = 'rgba(232,104,104,0.15)';
      } else if (change < 0) {
        badgeText = `▼ ${Math.abs(change).toFixed(1)}%`;
        badgeColor = '#3CB371';
        badgeBg = 'rgba(60,179,113,0.15)';
      } else {
        badgeText = '– 0%';
        badgeColor = '#7A8DA0';
        badgeBg = 'rgba(122,141,160,0.15)';
      }
    } else {
      badgeText = '– 0%';
      badgeColor = '#7A8DA0';
      badgeBg = 'rgba(122,141,160,0.15)';
    }
    
    expenseBadge.textContent = badgeText;
    expenseBadge.style.color = badgeColor;
    expenseBadge.style.background = badgeBg;
  }
  
  if (expenseInsight) {
    let insights = [];
    
    if (currentExpense.length === 0) {
      insights.push('Belum ada pengeluaran bulan ini.');
    } else {
      // 1. Total & perubahan
      let changeText = '';
      if (lastExpenseTotal === 0 && currentExpenseTotal > 0) {
        changeText = '📊 ini adalah bulan pertama Anda mencatat pengeluaran';
      } else if (lastExpenseTotal > 0) {
        const change = ((currentExpenseTotal - lastExpenseTotal) / lastExpenseTotal) * 100;
        if (change > 0) {
          changeText = `📈 naik ${change.toFixed(1)}% dari bulan lalu`;
        } else if (change < 0) {
          changeText = `📉 turun ${Math.abs(change).toFixed(1)}% dari bulan lalu`;
        } else {
          changeText = '📊 stabil dari bulan lalu';
        }
      } else {
        changeText = '📊 data baru';
      }
      insights.push(`▸ Total: ${formatRupiah(currentExpenseTotal)} (${changeText})`);
      
      // 2. Kategori terbesar
      const categoryMap = {};
      currentExpense.forEach(t => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + Number(t.amount);
      });
      const sorted = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        const top = sorted[0];
        const topPercent = ((top[1] / currentExpenseTotal) * 100).toFixed(0);
        insights.push(`▸ Kategori terbesar: ${top[0]} (${formatRupiah(top[1])} - ${topPercent}%)`);
        
        // 3. Saran penghematan
        if (top[1] / currentExpenseTotal > 0.4) {
          insights.push(`💡 ${top[0]} mengambil ${topPercent}% dari total pengeluaran. Coba kurangi!`);
        }
        
        // 4. Perubahan kategori dari bulan lalu
        if (lastExpenseTotal > 0) {
          const lastCategoryMap = {};
          lastExpense.forEach(t => {
            lastCategoryMap[t.category] = (lastCategoryMap[t.category] || 0) + Number(t.amount);
          });
          const lastTop = lastCategoryMap[top[0]] || 0;
          if (lastTop > 0) {
            const categoryChange = ((top[1] - lastTop) / lastTop) * 100;
            if (Math.abs(categoryChange) > 10) {
              const catChangeText = categoryChange > 0 ? `naik ${categoryChange.toFixed(1)}%` : `turun ${Math.abs(categoryChange).toFixed(1)}%`;
              insights.push(`▸ ${top[0]} ${catChangeText} dari bulan lalu`);
            }
          }
        }
      }
      
      // 5. Peringatan jika pengeluaran > pemasukan
      if (currentExpenseTotal > currentIncomeTotal) {
        const deficit = currentExpenseTotal - currentIncomeTotal;
        insights.push(`🚨 Pengeluaran melebihi pemasukan sebesar ${formatRupiah(deficit)}!`);
        if (sorted.length > 0) {
          insights.push(`💡 Coba kurangi ${sorted[0][0]} untuk menyeimbangkan keuangan.`);
        }
      }
      
      // 6. Peringatan jika rasio pengeluaran tinggi
      if (expenseRatio > 80) {
        insights.push(`⚠️ Pengeluaran ${expenseRatio.toFixed(0)}% dari pemasukan. Terlalu tinggi!`);
      } else if (expenseRatio > 60) {
        insights.push(`📊 Pengeluaran ${expenseRatio.toFixed(0)}% dari pemasukan. Cukup sehat.`);
      } else if (expenseRatio > 0 && expenseRatio <= 60) {
        insights.push(`✅ Pengeluaran hanya ${expenseRatio.toFixed(0)}% dari pemasukan. Bagus!`);
      }
      
      // 7. Peringatan saldo menipis
      if (currentIncomeTotal > 0 && totalBalance < currentIncomeTotal * 0.2) {
        insights.push(`⚠️ Saldo Anda hanya ${formatRupiah(totalBalance)}. Hanya tersisa ${((totalBalance/currentIncomeTotal)*100).toFixed(0)}% dari pemasukan.`);
      }
    }
    
    expenseInsight.innerHTML = insights.join('<br>');
  }
}

// ===== UPDATE SUMMARY CHART =====
function updateSummaryChart() {
  const val = document.getElementById('summaryMonth').value;
  if (!val) return;
  const [year, month] = val.split('-');
  const expenses = allTransactions.filter(t => t.type === 'pengeluaran' && t.transaction_date.startsWith(`${year}-${month}`));
  const container = document.getElementById('summaryContent');
  if (expenses.length === 0) { container.innerHTML = `<div class="empty-summary">Tidak ada pengeluaran</div>`; return; }
  const byCategory = {};
  expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount); });
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const max = sorted[0][1], total = sorted.reduce((sum, [, v]) => sum + v, 0);
  const colors = ['#4F46E5','#7C3AED','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#8B5CF6'];
  let html = `<div class="summary-total">Total: ${formatRupiah(total)}</div><div class="bar-chart">`;
  sorted.forEach(([cat, amt], i) => { const p = max > 0 ? (amt/max)*100 : 0; html += `<div class="bar-item"><div class="bar-label">${cat}</div><div class="bar-track"><div class="bar-fill" style="width:${p}%; background:${colors[i%colors.length]};">${p>=15?Math.round((amt/total)*100)+'%':''}</div></div><div class="bar-amount">${formatRupiah(amt)}</div></div>`; });
  container.innerHTML = html + `</div>`;
}

// ===== OPEN SUMMARY MODAL =====
function openSummaryModal() {
  const now = new Date();
  document.getElementById('summaryMonth').value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  updateSummaryChart();
  document.getElementById('summaryModal').classList.add('open');
  closeSidebar();
}

// ===== OPEN PIE CHART MODAL =====
function openPieChartModal() {
  const now = new Date();
  const monthInput = document.getElementById('pieChartMonth');
  monthInput.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  document.getElementById('pieChartModal').classList.add('open');
  renderPieChart();
  closeSidebar();
}

// ===== RENDER PIE CHART =====
async function renderPieChart() {
  await loadChartJS();
  
  const monthVal = document.getElementById('pieChartMonth').value;
  if (!monthVal) return;
  const [year, month] = monthVal.split('-');
  const expenses = allTransactions.filter(t => t.type === 'pengeluaran' && t.transaction_date.startsWith(`${year}-${month}`));
  const container = document.getElementById('pieChartLegend');
  const totalEl = document.getElementById('pieChartTotal');
  
  if (expenses.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#7A8DA0; grid-column:1/-1;">Tidak ada pengeluaran bulan ini</p>';
    totalEl.textContent = 'Total: Rp0';
    if (pieChartInstance) { pieChartInstance.destroy(); pieChartInstance = null; }
    return;
  }
  
  const byCategory = {};
  expenses.forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount); });
  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, v]) => sum + v, 0);
  totalEl.textContent = `Total: ${formatRupiah(total)}`;
  
  const colors = ['#4F46E5','#7C3AED','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#8B5CF6','#14B8A6','#F472B6'];
  const data = sorted.map(([cat, amt], i) => ({ label: cat, value: amt, color: colors[i % colors.length] }));
  
  container.innerHTML = '';
  data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'legend-item';
    div.innerHTML = `<span class="legend-color" style="background:${item.color};"></span><span class="legend-label">${item.label}</span><span class="legend-value">${formatRupiah(item.value)}</span>`;
    container.appendChild(div);
  });
  
  const ctx = document.getElementById('pieChartCanvas').getContext('2d');
  if (pieChartInstance) { pieChartInstance.destroy(); }
  
  if (typeof Chart === 'undefined') {
    console.error('❌ Chart.js not loaded');
    return;
  }
  
  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.label),
      datasets: [{ data: data.map(d => d.value), backgroundColor: data.map(d => d.color), borderWidth: 2, borderColor: '#E0E5EC' }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${formatRupiah(context.parsed)} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '60%'
    },
    plugins: [{
      id: 'centerText',
      beforeDraw: function(chart) {
        const { width, height, ctx } = chart;
        ctx.save();
        const text = formatRupiah(total);
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#2D4059';
        ctx.fillText(text, width / 2, height / 2);
        ctx.restore();
      }
    }]
  });
  
  const isDark = document.body.classList.contains('dark');
  const textColor = isDark ? '#EAEAEA' : '#2D4059';
  if (pieChartInstance) {
    pieChartInstance.options.plugins.legend.labels.color = textColor;
    pieChartInstance.update();
  }
}

// ===== EVENT LISTENER: CLOSE PIE CHART =====
document.getElementById('closePieChartModal').addEventListener('click', function() {
  document.getElementById('pieChartModal').classList.remove('open');
  if (pieChartInstance) { pieChartInstance.destroy(); pieChartInstance = null; }
});
document.getElementById('pieChartMonth').addEventListener('change', renderPieChart);

// ===== EVENT LISTENER: CLOSE SUMMARY =====
document.getElementById('closeSummaryModal').addEventListener('click', function() {
  document.getElementById('summaryModal').classList.remove('open');
});
document.getElementById('summaryMonth').addEventListener('change', updateSummaryChart);