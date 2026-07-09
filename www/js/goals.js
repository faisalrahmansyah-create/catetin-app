// ============================================
// GOALS - Manajemen Target Tabungan
// ============================================

let allGoals = [];
let currentGoalId = null;

// ===== RENDER GOALS =====
function renderGoals() {
  var container = document.getElementById('goalsContainer');
  container.innerHTML = '';
  var activeGoals = allGoals.filter(function(g) { return !g.is_completed; });
  
  if (activeGoals.length === 0) {
    container.innerHTML = '<p style="padding:0 20px; color:#7A8DA0; font-size:14px;">Belum ada target tabungan yang aktif.</p>';
    return;
  }
  
  activeGoals.forEach(function(g) {
    var percent = (g.saved_amount / g.target_amount) * 100;
    if (percent > 100) percent = 100;
    var wallet = allWallets.find(function(w) { return w.id === g.wallet_id; });
    var walletName = wallet ? wallet.name : 'Dompet tidak ditemukan';
    
    var card = document.createElement('div');
    card.className = 'goal-card';
    
    // 🔥 TOMBOL HAPUS (hanya jika saved_amount === 0)
    var deleteButton = '';
    if (g.saved_amount === 0) {
      deleteButton = '<button class="btn-delete-goal" onclick="deleteGoal(\'' + g.id + '\', \'' + g.name + '\')" title="Hapus target (belum terisi)">✕</button>';
    }
    
    card.innerHTML = `
      <div class="goal-top">
        <div>
          <div class="goal-title">${g.name}</div>
          <div class="goal-amount">${formatRupiah(g.saved_amount)} / ${formatRupiah(g.target_amount)}</div>
          <div style="font-size:11px; color:#7A8DA0; margin-top:2px;">📱 ${walletName}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${deleteButton}
          <button class="btn-topup" onclick="openTopupModal('${g.id}', '${g.name}')">Isi</button>
        </div>
      </div>
      <div class="goal-progress-bg"><div class="goal-progress-fill" style="width:${percent}%;"></div></div>
      <div class="goal-percentage">${percent.toFixed(1)}% Terkumpul</div>
    `;
    container.appendChild(card);
  });
  
  // Refresh icons
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// ===== RENDER COMPLETED GOALS =====
function renderCompletedGoals() {
  var container = document.getElementById('historyContainer');
  container.innerHTML = '';
  var completedGoals = allGoals.filter(function(g) { return g.is_completed; });
  
  if (completedGoals.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#7A8DA0; padding:20px;">Belum ada tabungan yang selesai.</p>';
    return;
  }
  
  completedGoals.forEach(function(g) {
    var wallet = allWallets.find(function(w) { return w.id === g.wallet_id; });
    var walletName = wallet ? wallet.name : 'Dompet tidak ditemukan';
    var card = document.createElement('div');
    card.className = 'goal-card completed-goal';
    card.style.opacity = '0.85';
    card.innerHTML = `
      <div class="goal-top">
        <div>
          <div class="goal-title" style="color:#3CB371;">✅ ${g.name}</div>
          <div class="goal-amount" style="color:#3CB371;">${formatRupiah(g.saved_amount)} / ${formatRupiah(g.target_amount)}</div>
          <div style="font-size:11px; color:#7A8DA0; margin-top:2px;">📱 ${walletName}</div>
        </div>
        <span style="background:#3CB371; color:white; padding:4px 12px; border-radius:50px; font-size:11px; font-weight:600;">Selesai</span>
      </div>
      <div class="goal-progress-bg"><div class="goal-progress-fill" style="width:100%; background:#3CB371;"></div></div>
      <div class="goal-percentage" style="color:#3CB371;">100% Terkumpul ✅</div>
      <div style="font-size:12px; color:#7A8DA0; margin-top:4px;">Cair: ${new Date(g.updated_at || g.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</div>
    `;
    container.appendChild(card);
  });
}

// ===== HAPUS TARGET TABUNGAN (HANYA JIKA SALDO 0) =====
async function deleteGoal(id, name) {
  var goal = allGoals.find(function(g) { return g.id === id; });
  
  if (!goal) {
    alert('❌ Target tidak ditemukan.');
    return;
  }
  
  // Cek apakah saldo masih 0
  if (goal.saved_amount > 0) {
    alert('❌ Target "' + name + '" sudah terisi ' + formatRupiah(goal.saved_amount) + '. Tidak bisa dihapus!');
    return;
  }
  
  if (confirm('Apakah Anda yakin ingin menghapus target "' + name + '"?')) {
    try {
      await db.from('savings_goals').delete().eq('id', id);
      await fetchData();
      
      if (typeof PERSONALITY !== 'undefined') {
        var msg = PERSONALITY.enhance('✅ Target "' + name + '" berhasil dihapus!', 'default', { text: '✅ Target "' + name + '" berhasil dihapus!' });
        alert(msg);
      } else {
        alert('✅ Target "' + name + '" berhasil dihapus!');
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('❌ Gagal menghapus target. Silakan coba lagi.');
    }
  }
}

// ===== CAIRKAN TABUNGAN OTOMATIS =====
async function cairkanTabungan(goal) {
  console.log('🔥 Memproses pencairan tabungan:', goal.name);
  if (!allWallets.length) { 
    console.warn('Tidak ada dompet untuk mencairkan tabungan.'); 
    return; 
  }
  
  var walletId = goal.wallet_id || allWallets[0].id;
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
  
  // ===== PERSONALITY DI CAIRKAN =====
  if (typeof PERSONALITY !== 'undefined') {
    var msg = PERSONALITY.enhance(
      '🎉 Selamat! Tabungan ' + goal.name + ' sebesar ' + formatRupiah(amount) + ' telah cair ke ' + walletName + '.',
      'default',
      { text: '🎉 Selamat! Tabungan ' + goal.name + ' sebesar ' + formatRupiah(amount) + ' telah cair ke ' + walletName + '.' }
    );
    alert(msg);
  } else {
    alert('🎉 Selamat! Tabungan "' + goal.name + '" sebesar ' + formatRupiah(amount) + ' telah cair ke ' + walletName + '.');
  }
  await fetchData();
}

// ===== OPEN TOPUP MODAL =====
window.openTopupModal = function(id, name) {
  currentGoalId = id;
  document.getElementById('topupGoalName').textContent = 'Menabung untuk: ' + name;
  document.getElementById('topupForm').reset();
  topupModal.classList.add('open');
};

// ===== OPEN HISTORY MODAL =====
function openHistoryModal() {
  document.getElementById('historyModal').classList.add('open');
  renderCompletedGoals();
  closeSidebar();
}

// ===== EVENT LISTENER: TAMBAH GOAL =====
document.getElementById('btnAddGoal').addEventListener('click', function() {
  var goalSelect = document.getElementById('goalWalletSelect');
  if (goalSelect) {
    goalSelect.innerHTML = '<option value="">Pilih Dompet</option>';
    allWallets.forEach(function(w) {
      goalSelect.innerHTML += '<option value="' + w.id + '">' + w.name + '</option>';
    });
  }
  goalModal.classList.add('open');
});

document.getElementById('closeGoalModal').addEventListener('click', function() {
  goalModal.classList.remove('open');
});

document.getElementById('closeTopupModal').addEventListener('click', function() {
  topupModal.classList.remove('open');
});

// ===== EVENT LISTENER: SUBMIT GOAL =====
document.getElementById('goalForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var name = document.getElementById('goalNameInput').value;
  var target = parseFloat(document.getElementById('goalTargetInput').value);
  var walletId = document.getElementById('goalWalletSelect').value;
  
  if (!walletId) { 
    alert('Silakan pilih dompet sumber terlebih dahulu.'); 
    return; 
  }
  
  var btn = document.getElementById('saveGoalBtn');
  btn.innerHTML = 'Menyimpan...'; 
  btn.disabled = true;
  
  try {
    await db.from('savings_goals').insert([{ 
      name: name, 
      target_amount: target, 
      wallet_id: walletId, 
      is_completed: false,
      saved_amount: 0
    }]);
    
    btn.innerHTML = 'Buat Target'; 
    btn.disabled = false;
    goalModal.classList.remove('open');
    document.getElementById('goalForm').reset();
    await fetchData();
    
    if (typeof PERSONALITY !== 'undefined') {
      var msg = PERSONALITY.enhance(
        'Target tabungan ' + name + ' sebesar ' + formatRupiah(target) + ' berhasil dibuat!',
        'default',
        { text: 'Target tabungan ' + name + ' sebesar ' + formatRupiah(target) + ' berhasil dibuat!' }
      );
      alert(msg);
    }
  } catch (error) {
    console.error('Error creating goal:', error);
    btn.innerHTML = 'Buat Target'; 
    btn.disabled = false;
    alert('❌ Gagal membuat target. Silakan coba lagi.');
  }
});

// ===== EVENT LISTENER: SUBMIT TOPUP =====
document.getElementById('topupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  var addAmount = parseFloat(document.getElementById('topupAmountInput').value);
  var btn = document.getElementById('saveTopupBtn');
  btn.innerHTML = 'Menyimpan...'; 
  btn.disabled = true;
  
  var goal = allGoals.find(function(g) { return g.id === currentGoalId; });
  if (!goal) { 
    alert('Target tabungan tidak ditemukan.'); 
    btn.innerHTML = 'Simpan Uang'; 
    btn.disabled = false; 
    return; 
  }
  
  var newAmount = Number(goal.saved_amount) + addAmount;
  var walletId = goal.wallet_id || allWallets[0]?.id;
  
  if (!walletId) { 
    alert('Dompet sumber tidak ditemukan. Silakan buat dompet terlebih dahulu.'); 
    btn.innerHTML = 'Simpan Uang'; 
    btn.disabled = false; 
    return; 
  }
  
  var validation = await validateWalletBalance(walletId, addAmount);
  if (!validation.valid) {
    alert(validation.message);
    btn.innerHTML = 'Simpan Uang'; 
    btn.disabled = false;
    return;
  }
  
  try {
    await db.from('savings_goals').update({ saved_amount: newAmount }).eq('id', currentGoalId);
    await db.from('transactions').insert([{ 
      type: 'pengeluaran', 
      amount: addAmount, 
      category: 'Tabungan', 
      description: 'Isi tabungan ' + goal.name, 
      transaction_date: new Date().toISOString().split('T')[0], 
      wallet_id: walletId 
    }]);
    
    btn.innerHTML = 'Simpan Uang'; 
    btn.disabled = false;
    topupModal.classList.remove('open');
    
    if (newAmount >= goal.target_amount) {
      var updatedGoal = { ...goal, saved_amount: newAmount, wallet_id: walletId };
      await cairkanTabungan(updatedGoal);
      return;
    }
    
    await fetchData();
    
    if (typeof PERSONALITY !== 'undefined') {
      var msg = PERSONALITY.enhance(
        'Tabungan ' + goal.name + ' berhasil diisi ' + formatRupiah(addAmount) + '!',
        'default',
        { text: 'Tabungan ' + goal.name + ' berhasil diisi ' + formatRupiah(addAmount) + '!' }
      );
      alert(msg);
    }
  } catch (error) {
    console.error('Error topup goal:', error);
    btn.innerHTML = 'Simpan Uang'; 
    btn.disabled = false;
    alert('❌ Gagal mengisi tabungan. Silakan coba lagi.');
  }
});