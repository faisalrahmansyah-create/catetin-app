// ============================================
// SCHEDULE - Manajemen Rencana & Kalender
// ============================================

let allScheduledPlans = [];
let currentModalPlans = [];
let currentModalDate = null;
let selectedDateForSchedule = null;
let selectedScheduleType = 'pengeluaran';
let pendingPayPlan = null;
let currDate = new Date();
let currMonth = currDate.getMonth();
let currYear = currDate.getFullYear();

// ============================================================
// ===== SEND WHATSAPP MESSAGE (FIXED) =====
// ============================================================

async function sendWAMessage(waNumber, clientName, amount, date, note) {
  // 1. Validasi nomor WA
  if (!waNumber || waNumber.trim().length === 0) {
    console.error('âŒ Nomor WhatsApp tidak valid');
    alert('âŒ Nomor WhatsApp tidak valid. Silakan isi nomor WA di rencana.');
    return;
  }

  // 2. Bersihkan nomor WA (hapus spasi, tanda hubung, +, dll)
  var cleanNumber = waNumber.replace(/[\s\-()]/g, '');
  
  // 3. ðŸ”¥ PERBAIKAN: Hapus '+' jika ada di awal
  cleanNumber = cleanNumber.replace(/^\+/g, '');
  
  // 4. ðŸ”¥ PERBAIKAN: Jika nomor dimulai dengan '0', ganti dengan '62'
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '62' + cleanNumber.substring(1);
  }
  
  // 5. ðŸ”¥ PERBAIKAN: Jika nomor sudah memiliki '62' di awal, biarkan saja
  // Jika tidak, tambahkan '62'
  if (!cleanNumber.startsWith('62')) {
    cleanNumber = '62' + cleanNumber;
  }

  // 6. Validasi panjang nomor (minimal 10 digit, maksimal 15)
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    console.error('âŒ Nomor WA tidak valid (panjang:', cleanNumber.length, ')');
    alert('âŒ Nomor WhatsApp tidak valid. Pastikan nomor benar (contoh: 81234567890)');
    return;
  }

  // 7. Format tanggal
  var formattedDate = new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // 8. Ambil template dari localStorage atau default
  var template = getWATemplate();
  
  // 9. Ganti placeholder
  var message = template
    .replace(/{nama_klien}/g, clientName || 'Klien')
    .replace(/{nominal}/g, formatRupiah(amount))
    .replace(/{tanggal}/g, formattedDate)
    .replace(/{catatan}/g, note || '');

  // 10. Encode message untuk URL
  var encodedMessage = encodeURIComponent(message);
  
  // 11. Buat URL WhatsApp (tanpa '+', hanya angka)
  var waUrl = 'https://api.whatsapp.com/send?phone=' + cleanNumber + '&text=' + encodedMessage;
  
  console.log('ðŸ“¤ Membuka WhatsApp untuk:', cleanNumber);
  console.log('ðŸ“ Pesan:', message);
  console.log('ðŸ”— URL:', waUrl);
  
  // 12. Buka WhatsApp di tab baru atau mobile app
  window.open(waUrl, '_blank');
  
  return true;
}

// ===== GET TEMPLATE WA =====
function getWATemplate() {
  var template = localStorage.getItem('wa_template');
  if (template && template.trim().length > 0) {
    return template;
  }
  // Default template
  return 'Kepada Yth, {nama_klien}\n\n' +
         'Kami mengingatkan tagihan sebesar {nominal} yang jatuh tempo pada {tanggal}.\n\n' +
         'Catatan: {catatan}\n\n' +
         'Mohon segera dibayar. Terima kasih.\n\n' +
         '--\n' +
         'Dikirim dari aplikasi CatetIn';
}

// ===== RENDER KALENDER =====
function renderCalendar() {
  var monthYearDisplay = document.getElementById('monthYearDisplay');
  var calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';
  monthYearDisplay.textContent = monthNames[currMonth] + ' ' + currYear;
  
  var firstDay = new Date(currYear, currMonth, 1).getDay();
  var daysInMonth = new Date(currYear, currMonth + 1, 0).getDate();
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];
  
  for (var i = 0; i < firstDay; i++) {
    var emptyDiv = document.createElement('div');
    emptyDiv.className = 'cal-day empty';
    calendarGrid.appendChild(emptyDiv);
  }
  
  for (var i = 1; i <= daysInMonth; i++) {
    var dayDiv = document.createElement('div');
    dayDiv.className = 'cal-day';
    dayDiv.textContent = i;
    var dateStr = currYear + '-' + String(currMonth + 1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
    if (dateStr === todayStr) dayDiv.classList.add('today');
    
    var plansOnThisDate = allScheduledPlans.filter(function(p) { return p.plan_date === dateStr; });
    if (plansOnThisDate.length > 0) {
      var dot = document.createElement('div');
      dot.className = 'cal-indicator';
      dayDiv.appendChild(dot);
    }
    dayDiv.addEventListener('click', function(date, plans) {
      return function() { openScheduleModal(date, plans); };
    }(dateStr, plansOnThisDate));
    calendarGrid.appendChild(dayDiv);
  }
  updateTotalScheduleAmount();
}

// ===== UPDATE SCHEDULE BADGE =====
function updateScheduleBadge() {
  var badge = document.getElementById('scheduleBadge');
  if (!badge) return;
  var count = allScheduledPlans.filter(function(p) { return !p.is_paid; }).length;
  if (count > 0) {
    badge.style.display = 'inline';
    badge.textContent = count;
  } else {
    badge.style.display = 'none';
  }
}

// ===== UPDATE TOTAL SCHEDULE AMOUNT =====
function updateTotalScheduleAmount() {
  var totalEl = document.getElementById('totalScheduleAmount');
  if (!totalEl) return;
  var monthStr = currYear + '-' + String(currMonth + 1).padStart(2, '0');
  var plansThisMonth = allScheduledPlans.filter(function(p) { 
    return p.plan_date.startsWith(monthStr) && !p.is_paid; 
  });
  
  var totalIncome = plansThisMonth
    .filter(function(p) { return p.plan_type === 'pemasukan'; })
    .reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
    
  var totalExpense = plansThisMonth
    .filter(function(p) { return p.plan_type === 'pengeluaran'; })
    .reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
  
  var html = '';
  if (totalIncome > 0) {
    html += '<span style="color:#3CB371;">ðŸ“¥ ' + formatRupiah(totalIncome) + '</span>';
  }
  if (totalIncome > 0 && totalExpense > 0) {
    html += ' / ';
  }
  if (totalExpense > 0) {
    html += '<span style="color:#E86868;">ðŸ“¤ ' + formatRupiah(totalExpense) + '</span>';
  }
  if (totalIncome === 0 && totalExpense === 0) {
    html = '<span style="color:#7A8DA0;">Rp0</span>';
  }
  
  totalEl.innerHTML = html;
}

// ===== OPEN SCHEDULE MODAL =====
function openScheduleModal(dateStr, plans) {
  currentModalDate = dateStr;
  currentModalPlans = plans.filter(function(p) { return !p.is_paid; });
  selectedDateForSchedule = dateStr;
  var tglFormat = new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('scheduleModalTitle').textContent = 'Jadwal: ' + tglFormat;
  renderScheduleModal();
  document.getElementById('scheduleForm').reset();
  document.getElementById('scheduleNote').value = '';
  var scheduleDateInput = document.getElementById('scheduleDateInput');
  if (scheduleDateInput) {
    var today = new Date().toISOString().split('T')[0];
    scheduleDateInput.min = today;
    scheduleDateInput.value = today;
  }
  
  selectedScheduleType = 'pengeluaran';
  var expenseRadio = document.getElementById('scheduleTypeExpenseRadio');
  var incomeRadio = document.getElementById('scheduleTypeIncomeRadio');
  if (expenseRadio) expenseRadio.checked = true;
  if (incomeRadio) incomeRadio.checked = false;
  document.getElementById('scheduleClientField').style.display = 'none';
  document.getElementById('scheduleWANumberField').style.display = 'none';
  
  scheduleModal.classList.add('open');
}

// ===== RENDER SCHEDULE MODAL =====
function renderScheduleModal() {
  var container = document.getElementById('scheduleListContainer');
  container.innerHTML = '';
  
  if (currentModalPlans.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#94A3B8; font-size:14px; padding:20px 0;">Tidak ada tagihan/rencana.</p>';
    return;
  }
  
  currentModalPlans.forEach(function(plan) {
    var isIncome = plan.plan_type === 'pemasukan';
    var icon = isIncome ? 'ðŸ“¥' : 'ðŸ“¤';
    var typeLabel = isIncome ? 'Piutang' : 'Tagihan';
    var amountColor = isIncome ? '#3CB371' : '#E86868';
    var noteHtml = plan.note ? '<span style="font-size:11px; color:#94A3B8; margin-top:2px; display:block;">ðŸ“ ' + plan.note + '</span>' : '';
    
    var waButton = '';
    if (isIncome && plan.wa_number) {
      var clientName = plan.client_name || '';
      var noteForWA = plan.note || '';
      var waNumber = plan.wa_number || '';
      waButton = `
        <button class="btn-wa" onclick="sendWAMessage('${waNumber}', '${clientName}', ${plan.amount}, '${plan.plan_date}', '${noteForWA}')">
          <i data-lucide="message-circle" width="14" height="14"></i> WA
        </button>
      `;
    }
    
    var payIcon = isIncome ? 'check-circle' : 'check-square';
    var payLabel = isIncome ? 'Terbayar' : 'Tandai Lunas';
    
    container.innerHTML += `
      <div class="schedule-item" style="margin-bottom:12px;">
        <div class="sch-info">
          <span class="sch-title">${icon} ${plan.title}</span>
          ${noteHtml}
          <span class="sch-amount" style="color:${amountColor};">
            ${isIncome ? '+' : '-'} ${formatRupiah(plan.amount)}
          </span>
          <span style="font-size:11px; color:#7A8DA0;">${typeLabel} â€¢ ${new Date(plan.plan_date).toLocaleDateString('id-ID')}</span>
        </div>
        <div class="sch-actions">
          ${waButton}
          <button class="btn-pay" onclick="openPayModal('${plan.id}', '${plan.title}', ${plan.amount}, '${plan.plan_date}')">
            <i data-lucide="${payIcon}" width="14" height="14"></i> ${payLabel}
          </button>
        </div>
      </div>
    `;
  });
  
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// ===== CEK RENCANA TERLEWAT =====
function checkOverduePlans() {
  var badge = document.getElementById('overdueBadge');
  var countEl = document.getElementById('overdueCount');
  var tooltip = document.getElementById('overdueTooltip');
  if (!badge || !countEl) return;
  
  var today = new Date();
  var todayStr = today.toISOString().split('T')[0];
  var overduePlans = allScheduledPlans.filter(function(p) { 
    return p.plan_date < todayStr && !p.is_paid; 
  });
  var count = overduePlans.length;
  
  var lastOverdueNotified = localStorage.getItem('last_overdue_notified_date');
  if (count > 0 && lastOverdueNotified !== todayStr) {
    var incomePlans = overduePlans.filter(function(p) { return p.plan_type === 'pemasukan'; });
    var expensePlans = overduePlans.filter(function(p) { return p.plan_type === 'pengeluaran'; });
    var totalAmount = overduePlans.reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
    
    var message = '';
    if (incomePlans.length > 0) {
      message += incomePlans.length + ' piutang jatuh tempo: ' + incomePlans.map(function(p) { return p.title; }).join(', ') + '. ';
    }
    if (expensePlans.length > 0) {
      message += expensePlans.length + ' tagihan jatuh tempo: ' + expensePlans.map(function(p) { return p.title; }).join(', ') + '. ';
    }
    message += 'Total: ' + formatRupiah(totalAmount);
    
    sendBrowserNotification('âš ï¸ Rencana Terlewat!', message);
    localStorage.setItem('last_overdue_notified_date', todayStr);
  }
  
  if (count > 0) {
    badge.style.display = 'flex';
    countEl.textContent = count > 9 ? '9+' : count;
    if (tooltip) {
      var listEl = tooltip.querySelector('.tooltip-list');
      if (listEl) {
        listEl.innerHTML = '';
        overduePlans.slice(0, 5).forEach(function(p) {
          var days = Math.floor((today - new Date(p.plan_date)) / (1000 * 60 * 60 * 24));
          var typeIcon = p.plan_type === 'pemasukan' ? 'ðŸ“¥' : 'ðŸ“¤';
          var item = document.createElement('div');
          item.className = 'tooltip-item';
          item.innerHTML = '<span class="item-name">' + typeIcon + ' ' + p.title + '</span><span class="item-days">Terlewat ' + days + ' hari</span>';
          listEl.appendChild(item);
        });
        if (overduePlans.length > 5) {
          var more = document.createElement('div');
          more.className = 'tooltip-item';
          more.style.justifyContent = 'center';
          more.style.color = '#7A8DA0';
          more.style.fontSize = '12px';
          more.textContent = '+ ' + (overduePlans.length - 5) + ' rencana lainnya';
          listEl.appendChild(more);
        }
      }
    }
  } else {
    badge.style.display = 'none';
    if (tooltip) tooltip.classList.remove('show');
  }
}

// ===== CEK PENGINGAT =====
function checkReminders() {
  var todayStr = new Date().toISOString().split('T')[0];
  var todaysPlans = allScheduledPlans.filter(function(p) { return p.plan_date === todayStr; });

  if (todaysPlans.length > 0) {
    var lastNotified = localStorage.getItem('last_notified_date');
    if (lastNotified !== todayStr) {
      var container = document.getElementById('reminderListContainer');
      container.innerHTML = '';
      todaysPlans.forEach(function(plan) {
        var typeIcon = plan.plan_type === 'pemasukan' ? 'ðŸ“¥' : 'ðŸ“¤';
        var noteHtml = plan.note ? '<div style="font-size:12px; color:#7A8DA0; margin-top:2px;">ðŸ“ ' + plan.note + '</div>' : '';
        container.innerHTML += `
          <div style="background:#F8FAFC; padding:12px; border-radius:12px; margin-bottom:8px; border:1px solid #E2E8F0;">
            <div style="font-weight:600; color:#1F2937;">${typeIcon} ${plan.title}</div>
            ${noteHtml}
            <div style="color:${plan.plan_type === 'pemasukan' ? '#3CB371' : '#EF4444'}; font-weight:700;">${formatRupiah(plan.amount)}</div>
          </div>
        `;
      });
      document.getElementById('reminderModal').classList.add('open');
      
      var totalAmount = todaysPlans.reduce(function(sum, p) { return sum + Number(p.amount); }, 0);
      var incomePlans = todaysPlans.filter(function(p) { return p.plan_type === 'pemasukan'; });
      var expensePlans = todaysPlans.filter(function(p) { return p.plan_type === 'pengeluaran'; });
      var message = '';
      if (incomePlans.length > 0) {
        message += incomePlans.length + ' piutang jatuh tempo hari ini. ';
      }
      if (expensePlans.length > 0) {
        message += expensePlans.length + ' tagihan jatuh tempo hari ini. ';
      }
      message += 'Total: ' + formatRupiah(totalAmount);
      
      sendBrowserNotification('ðŸ”” Rencana Jatuh Tempo!', message);
      
      if ("Notification" in window) Notification.requestPermission();
      localStorage.setItem('last_notified_date', todayStr);
    }
  }
}

// ===== MODAL TANDAI LUNAS =====
function openPayModal(id, title, amount, date) {
  pendingPayPlan = { id: id, title: title, amount: amount, date: date };
  document.getElementById('payPlanTitle').textContent = title;
  document.getElementById('payPlanAmount').textContent = formatRupiah(amount);
  
  var today = new Date().toISOString().split('T')[0];
  var payDateInput = document.getElementById('payDateInput');
  if (payDateInput) {
    payDateInput.min = today;
    payDateInput.value = today;
  }
  
  var select = document.getElementById('payWalletSelect');
  if (select) {
    select.innerHTML = '<option value="">Pilih Dompet</option>';
    allWallets.forEach(function(w) {
      select.innerHTML += '<option value="' + w.id + '">' + w.name + '</option>';
    });
  }
  
  document.getElementById('payModal').classList.add('open');
}

// ===== EVENT LISTENER: KALENDER =====
document.getElementById('prevMonth').addEventListener('click', function() { 
  currMonth--; 
  if (currMonth < 0) { currMonth = 11; currYear--; } 
  scheduleModal.classList.remove('open'); 
  renderCalendar(); 
});

document.getElementById('nextMonth').addEventListener('click', function() { 
  currMonth++; 
  if (currMonth > 11) { currMonth = 0; currYear++; } 
  scheduleModal.classList.remove('open'); 
  renderCalendar(); 
});

// ===== EVENT LISTENER: TAMBAH RENCANA =====
document.getElementById('addScheduleBtn').addEventListener('click', function() {
  var today = new Date().toISOString().split('T')[0];
  var scheduleDateInput = document.getElementById('scheduleDateInput');
  if (scheduleDateInput) {
    scheduleDateInput.min = today;
    scheduleDateInput.value = today;
  }
  
  selectedScheduleType = 'pengeluaran';
  var expenseRadio = document.getElementById('scheduleTypeExpenseRadio');
  var incomeRadio = document.getElementById('scheduleTypeIncomeRadio');
  if (expenseRadio) expenseRadio.checked = true;
  if (incomeRadio) incomeRadio.checked = false;
  document.getElementById('scheduleClientField').style.display = 'none';
  document.getElementById('scheduleWANumberField').style.display = 'none';
  document.getElementById('scheduleClientName').value = '';
  document.getElementById('scheduleWANumber').value = '';
  document.getElementById('scheduleNote').value = '';
  
  var plans = allScheduledPlans.filter(function(p) { return p.plan_date === today; });
  openScheduleModal(today, plans);
});

// ===== EVENT LISTENER: TOGGLE JENIS RENCANA =====
document.querySelectorAll('input[name="scheduleType"]').forEach(function(radio) {
  radio.addEventListener('change', function() {
    selectedScheduleType = this.value;
    
    if (this.value === 'pemasukan') {
      document.getElementById('scheduleClientField').style.display = 'block';
      document.getElementById('scheduleWANumberField').style.display = 'block';
    } else {
      document.getElementById('scheduleClientField').style.display = 'none';
      document.getElementById('scheduleWANumberField').style.display = 'none';
    }
  });
});

// ===== EVENT LISTENER: SUBMIT RENCANA =====
document.getElementById('scheduleForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var btn = document.getElementById('saveScheduleBtn');
  btn.innerHTML = 'Menyimpan...'; 
  btn.disabled = true;
  
  var title = document.getElementById('scheduleTitle').value;
  var amount = parseFloat(document.getElementById('scheduleAmount').value);
  var planDate = document.getElementById('scheduleDateInput').value;
  var note = document.getElementById('scheduleNote').value || '';
  
  var payload = {
    plan_date: planDate,
    title: title,
    amount: amount,
    plan_type: selectedScheduleType,
    is_paid: false,
    note: note
  };
  
  if (selectedScheduleType === 'pemasukan') {
    payload.client_name = document.getElementById('scheduleClientName').value || '';
    payload.wa_number = document.getElementById('scheduleWANumber').value || '';
  }
  
  try {
    await db.from('scheduled_plans').insert([payload]);
    btn.innerHTML = 'Simpan Rencana'; 
    btn.disabled = false;
    scheduleModal.classList.remove('open');
    await fetchData();
    
    if (typeof PERSONALITY !== 'undefined') {
      var msg = PERSONALITY.enhance(
        'Rencana berhasil disimpan!', 
        'plan', 
        { title: title, amount: formatRupiah(amount) }
      );
      alert(msg);
    }
  } catch (error) {
    console.error('Error saving plan:', error);
    btn.innerHTML = 'Simpan Rencana'; 
    btn.disabled = false;
    alert('âŒ Gagal menyimpan rencana. Silakan coba lagi.');
  }
});

// ===== EVENT LISTENER: TANDAI LUNAS =====
document.getElementById('closePayModal').addEventListener('click', function() {
  document.getElementById('payModal').classList.remove('open');
  pendingPayPlan = null;
});

document.getElementById('payForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  if (!pendingPayPlan) return;
  
  var walletId = document.getElementById('payWalletSelect').value;
  var transactionDate = document.getElementById('payDateInput').value;
  if (!walletId) { alert('Silakan pilih dompet sumber.'); return; }
  
  var plan = allScheduledPlans.find(function(p) { return p.id === pendingPayPlan.id; });
  var isIncome = plan ? plan.plan_type === 'pemasukan' : false;
  
  if (!isIncome) {
    var validation = await validateWalletBalance(walletId, pendingPayPlan.amount);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
  }
  
  var btn = document.getElementById('savePayBtn');
  btn.innerHTML = 'Memproses...'; 
  btn.disabled = true;
  
  var id = pendingPayPlan.id;
  var title = pendingPayPlan.title;
  var amount = pendingPayPlan.amount;
  
  try {
    await db.from('scheduled_plans').update({ is_paid: true }).eq('id', id);
    await db.from('transactions').insert([{ 
      type: isIncome ? 'pemasukan' : 'pengeluaran', 
      amount: amount, 
      category: isIncome ? 'Piutang' : 'Tagihan', 
      description: title, 
      transaction_date: transactionDate, 
      wallet_id: walletId 
    }]);
    
    allScheduledPlans = allScheduledPlans.filter(function(p) { return p.id !== id; });
    currentModalPlans = currentModalPlans.filter(function(p) { return p.id !== id; });
    updateScheduleBadge();
    updateTotalScheduleAmount();
    renderCalendar();
    renderScheduleModal();
    checkOverduePlans();
    
    btn.innerHTML = 'âœ… Tandai Lunas'; 
    btn.disabled = false;
    document.getElementById('payModal').classList.remove('open');
    pendingPayPlan = null;
    await fetchData();
    
    if (typeof PERSONALITY !== 'undefined') {
      var msg = PERSONALITY.enhance(
        isIncome ? 'Piutang berhasil ditandai lunas!' : 'Tagihan berhasil ditandai lunas!',
        'paid',
        { title: title }
      );
      alert(msg);
    }
  } catch (error) {
    console.error('Error marking paid:', error);
    btn.innerHTML = 'âœ… Tandai Lunas'; 
    btn.disabled = false;
    alert('âŒ Gagal menandai lunas. Silakan coba lagi.');
  }
});

// ===== EVENT LISTENER: CLOSE SCHEDULE MODAL =====
document.getElementById('closeScheduleModal').addEventListener('click', function() {
  scheduleModal.classList.remove('open');
});

// ===== EVENT LISTENER: CLOSE REMINDER =====
document.getElementById('closeReminderModal').addEventListener('click', function() {
  document.getElementById('reminderModal').classList.remove('open');
});

// ===== TOGGLE CALENDAR COLLAPSE =====
var toggleCalendarBtn = document.getElementById('toggleCalendarBtn');
var toggleCalendarIcon = document.getElementById('toggleCalendarIcon');
var calendarBody = document.getElementById('calendarBody');

if (toggleCalendarBtn && toggleCalendarIcon && calendarBody) {
  var isCalendarCollapsed = localStorage.getItem('calendarCollapsed') === 'true';
  
  function updateCalendarVisibility() {
    if (isCalendarCollapsed) {
      calendarBody.classList.add('collapsed');
      toggleCalendarIcon.setAttribute('data-lucide', 'chevron-down');
    } else {
      calendarBody.classList.remove('collapsed');
      toggleCalendarIcon.setAttribute('data-lucide', 'chevron-up');
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  }
  
  toggleCalendarBtn.addEventListener('click', function() {
    isCalendarCollapsed = !isCalendarCollapsed;
    localStorage.setItem('calendarCollapsed', isCalendarCollapsed);
    updateCalendarVisibility();
  });
  
  updateCalendarVisibility();
}

console.log('âœ… Schedule module loaded with WA function');
