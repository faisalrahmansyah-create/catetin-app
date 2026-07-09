// ============================================
// TRANSACTIONS - Manajemen Transaksi
// ============================================

let allTransactions = [];
let selectedType = 'expense';
let selectedCategory = 'Makan';
let detailTransactionId = null;

// ===== RENDER TRANSAKSI =====
function renderTransactions(transactionsToRender) {
  const container = document.getElementById('transactionsContainer');
  const emptyState = document.getElementById('emptyState');
  container.innerHTML = '';
  if (transactionsToRender.length === 0) { emptyState.style.display = 'flex'; return; }
  emptyState.style.display = 'none';
  
  const grouped = {};
  transactionsToRender.forEach(t => { if (!grouped[t.transaction_date]) grouped[t.transaction_date] = []; grouped[t.transaction_date].push(t); });
  
  for (const [date, items] of Object.entries(grouped)) {
    const dateHeader = document.createElement('div');
    dateHeader.className = 'date-header-sticky';
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    if (date === todayStr) dateHeader.textContent = '📌 Hari Ini';
    else if (date === yesterdayStr) dateHeader.textContent = '📆 Kemarin';
    else dateHeader.textContent = new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    container.appendChild(dateHeader);
    items.forEach(t => {
      const isIncome = t.type === 'pemasukan';
      const iconClass = isIncome ? 'income-icon' : 'expense-icon';
      const catType = isIncome ? 'income' : 'expense';
      const iconName = (categories[catType].find(c => c.name === t.category) || {}).icon || 'circle';
      const timeString = new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const walletName = allWallets.find(w => w.id === t.wallet_id)?.name || 'Dompet';
      
      const item = document.createElement('div');
      item.className = 'transaction-item';
      item.innerHTML = `
        <div class="transaction-icon ${iconClass}"><i data-lucide="${iconName}" width="22" height="22"></i></div>
        <div class="transaction-info">
          <span class="category">${t.category}</span>
          ${t.description ? `<span class="note">${t.description} • ${walletName}</span>` : `<span class="note">${walletName}</span>`}
          <span class="date">${timeString}</span>
        </div>
        <span class="transaction-amount ${isIncome ? 'income' : 'expense'}">${isIncome ? '+' : '-'} ${formatRupiah(t.amount)}</span>
        <div class="transaction-actions">
          <button class="edit-btn" data-id="${t.id}"><i data-lucide="pencil" width="18" height="18"></i></button>
          <button class="delete-btn" data-id="${t.id}"><i data-lucide="trash-2" width="18" height="18"></i></button>
        </div>
      `;
      item.addEventListener('click', function(e) {
        if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
        openDetailModal(t.id);
      });
      container.appendChild(item);
    });
  }
  lucide.createIcons();
  attachActionListeners();
}

// ===== ATTACH ACTION LISTENERS =====
function attachActionListeners() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('Hapus transaksi ini?')) { 
        await db.from('transactions').delete().eq('id', btn.dataset.id); 
        fetchData();
        if (typeof PERSONALITY !== 'undefined') {
          const msg = PERSONALITY.enhance('Transaksi berhasil dihapus!', 'default', { text: 'Transaksi berhasil dihapus!' });
          alert(msg);
        }
      }
    });
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const trans = allTransactions.find(t => t.id === id);
      if (!trans) return;
      selectedType = trans.type === 'pemasukan' ? 'income' : 'expense';
      selectedCategory = trans.category;
      document.getElementById('amountInput').value = trans.amount;
      document.getElementById('dateInput').value = trans.transaction_date;
      document.getElementById('dateInput').removeAttribute('min');
      document.getElementById('noteInput').value = trans.description || '';
      document.getElementById('walletSelect').value = trans.wallet_id;
      updateTypeToggle();
      renderCategoryGrid();
      document.getElementById('transactionForm').dataset.editId = id;
      document.getElementById('modalTitle').textContent = 'Edit Transaksi';
      document.getElementById('addModal').classList.add('open');
    });
  });
}

// ===== MODAL DETAIL TRANSAKSI =====
function openDetailModal(id) {
  const trans = allTransactions.find(t => t.id === id);
  if (!trans) return;
  
  detailTransactionId = id;
  const isIncome = trans.type === 'pemasukan';
  const iconName = (categories[isIncome ? 'income' : 'expense'].find(c => c.name === trans.category) || {}).icon || 'circle';
  const walletName = allWallets.find(w => w.id === trans.wallet_id)?.name || 'Dompet tidak ditemukan';
  
  document.getElementById('detailCategory').textContent = trans.category;
  document.getElementById('detailType').textContent = isIncome ? '📥 Pemasukan' : '📤 Pengeluaran';
  document.getElementById('detailType').style.color = isIncome ? '#3CB371' : '#E86868';
  document.getElementById('detailAmount').textContent = formatRupiah(trans.amount);
  document.getElementById('detailAmount').style.color = isIncome ? '#3CB371' : '#E86868';
  document.getElementById('detailDate').textContent = new Date(trans.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  document.getElementById('detailWallet').textContent = walletName;
  document.getElementById('detailNote').textContent = trans.description || '-';
  
  const iconEl = document.getElementById('detailIcon');
  iconEl.innerHTML = `<i data-lucide="${iconName}" width="28" height="28"></i>`;
  iconEl.style.color = isIncome ? '#3CB371' : '#E86868';
  lucide.createIcons();
  
  document.getElementById('detailModal').classList.add('open');
}

// ===== RENDER CATEGORY GRID =====
function renderCategoryGrid() {
  const grid = document.getElementById('categoryGrid');
  grid.innerHTML = '';
  const list = selectedType === 'income' ? categories.income : categories.expense;
  list.forEach(cat => {
    const btn = document.createElement('div');
    btn.className = `category-option${cat.name === selectedCategory ? ' selected' : ''}`;
    btn.innerHTML = `<i data-lucide="${cat.icon}"></i><span>${cat.name}</span>`;
    btn.addEventListener('click', () => { selectedCategory = cat.name; renderCategoryGrid(); });
    grid.appendChild(btn);
  });
  lucide.createIcons();
}

// ===== UPDATE TYPE TOGGLE =====
function updateTypeToggle() {
  document.getElementById('typeExpense').classList.toggle('active', selectedType === 'expense');
  document.getElementById('typeIncome').classList.toggle('active', selectedType === 'income');
}

// ===== RENDER FILTERED TRANSACTIONS =====
function renderFilteredTransactions() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const month = document.getElementById('filterMonth').value;
  let filtered = allTransactions;
  if (month) filtered = filtered.filter(t => t.transaction_date.split('-')[1] === month);
  if (search) filtered = filtered.filter(t => t.category.toLowerCase().includes(search) || (t.description && t.description.toLowerCase().includes(search)));
  renderTransactions(filtered);
}

// ===== SCAN STRUK =====
document.getElementById('scanReceiptBtn').addEventListener('click', function() {
  document.getElementById('receiptInput').click();
});

document.getElementById('receiptInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file) {
    console.log('📷 File dipilih:', file.name);
    if (typeof PERSONALITY !== 'undefined') {
      const msg = PERSONALITY.enhance('Struk berhasil diupload!', 'default', { text: 'Struk berhasil diupload!' });
      alert(msg);
    } else {
      alert('📷 File terpilih: ' + file.name);
    }
    this.value = '';
  }
});

// ===== EVENT LISTENER: TAMBAH TRANSAKSI =====
document.getElementById('fabAdd').addEventListener('click', () => {
  document.getElementById('transactionForm').reset();
  delete document.getElementById('transactionForm').dataset.editId;
  document.getElementById('modalTitle').textContent = 'Tambah Transaksi';
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('dateInput');
  if (dateInput) { 
    dateInput.removeAttribute('min');
    dateInput.value = today; 
  }
  selectedType = 'expense';
  selectedCategory = categories.expense[0].name;
  updateTypeToggle();
  renderCategoryGrid();
  document.getElementById('addModal').classList.add('open');
});

document.getElementById('closeModal').addEventListener('click', () => addModal.classList.remove('open'));

document.getElementById('typeExpense').addEventListener('click', () => { selectedType = 'expense'; selectedCategory = categories.expense[0].name; updateTypeToggle(); renderCategoryGrid(); });
document.getElementById('typeIncome').addEventListener('click', () => { selectedType = 'income'; selectedCategory = categories.income[0].name; updateTypeToggle(); renderCategoryGrid(); });

document.getElementById('transactionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const amount = parseFloat(document.getElementById('amountInput').value);
  const walletId = document.getElementById('walletSelect').value;
  const type = selectedType === 'income' ? 'pemasukan' : 'pengeluaran';
  
  if (type === 'pengeluaran') {
    const validation = await validateWalletBalance(walletId, amount);
    if (!validation.valid) {
      alert(validation.message);
      return;
    }
  }
  
  const editId = document.getElementById('transactionForm').dataset.editId;
  const payload = {
    type: type,
    amount: amount,
    category: selectedCategory,
    description: document.getElementById('noteInput').value,
    transaction_date: document.getElementById('dateInput').value,
    wallet_id: walletId
  };
  const btn = document.getElementById('saveBtn');
  btn.innerHTML = 'Menyimpan...'; btn.disabled = true;
  if (editId) await db.from('transactions').update(payload).eq('id', editId);
  else await db.from('transactions').insert([payload]);
  btn.innerHTML = 'Simpan Transaksi'; btn.disabled = false;
  document.getElementById('addModal').classList.remove('open');
  fetchData();
  
  // ===== PERSONALITY DI SAVE TRANSAKSI =====
  if (typeof PERSONALITY !== 'undefined') {
    const msg = PERSONALITY.enhance(
      editId ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil disimpan!', 
      editId ? 'default' : 'expense', 
      { text: editId ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil disimpan!', amount: formatRupiah(amount), category: selectedCategory }
    );
    alert(msg);
  }
});

// ===== DETAIL MODAL EVENT LISTENERS =====
document.getElementById('closeDetailModal').addEventListener('click', function() {
  document.getElementById('detailModal').classList.remove('open');
  detailTransactionId = null;
});

document.getElementById('detailEditBtn').addEventListener('click', function() {
  if (!detailTransactionId) return;
  document.getElementById('detailModal').classList.remove('open');
  const trans = allTransactions.find(t => t.id === detailTransactionId);
  if (!trans) return;
  
  selectedType = trans.type === 'pemasukan' ? 'income' : 'expense';
  selectedCategory = trans.category;
  document.getElementById('amountInput').value = trans.amount;
  document.getElementById('dateInput').value = trans.transaction_date;
  document.getElementById('dateInput').removeAttribute('min');
  document.getElementById('noteInput').value = trans.description || '';
  document.getElementById('walletSelect').value = trans.wallet_id;
  updateTypeToggle();
  renderCategoryGrid();
  document.getElementById('transactionForm').dataset.editId = trans.id;
  document.getElementById('modalTitle').textContent = 'Edit Transaksi';
  document.getElementById('addModal').classList.add('open');
  detailTransactionId = null;
});

document.getElementById('detailDeleteBtn').addEventListener('click', async function() {
  if (!detailTransactionId) return;
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    await db.from('transactions').delete().eq('id', detailTransactionId);
    document.getElementById('detailModal').classList.remove('open');
    detailTransactionId = null;
    fetchData();
    if (typeof PERSONALITY !== 'undefined') {
      const msg = PERSONALITY.enhance('Transaksi berhasil dihapus!', 'default', { text: 'Transaksi berhasil dihapus!' });
      alert(msg);
    }
  }
});

document.getElementById('detailModal').addEventListener('click', function(e) {
  if (e.target === this) {
    this.classList.remove('open');
    detailTransactionId = null;
  }
});

// ===== SEARCH & FILTER EVENT LISTENERS =====
document.getElementById('searchInput').addEventListener('input', renderFilteredTransactions);
document.getElementById('filterMonth').addEventListener('change', renderFilteredTransactions);

const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
months.forEach((m, i) => { const option = document.createElement('option'); option.value = String(i+1).padStart(2,'0'); option.textContent = m; document.getElementById('filterMonth').appendChild(option); });

const toggleFilterBtn = document.getElementById('toggleFilterBtn');
const filterSection = document.getElementById('filterSection');
const filterIcon = document.getElementById('filterIcon');
toggleFilterBtn.addEventListener('click', () => {
  filterSection.classList.toggle('collapsed');
  if (filterSection.classList.contains('collapsed')) { filterIcon.setAttribute('data-lucide', 'search'); toggleFilterBtn.style.color = ''; } 
  else { filterIcon.setAttribute('data-lucide', 'x'); toggleFilterBtn.style.color = '#EF4444'; setTimeout(() => document.getElementById('searchInput').focus(), 300); }
  lucide.createIcons();
});