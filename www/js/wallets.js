// ============================================
// WALLETS - Manajemen Dompet
// ============================================

let allWallets = [];

// ===== RENDER WALLETS & SUMMARY =====
function renderWalletsAndSummary(transactions) {
  let totalIncome = 0, totalExpense = 0, incomeToday = 0, expenseToday = 0;
  const today = new Date().toISOString().split('T')[0];

  transactions.forEach(t => {
    const inputDate = t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : t.transaction_date;
    if (t.type === 'pemasukan') {
      totalIncome += Number(t.amount);
      if (inputDate === today) incomeToday += Number(t.amount);
    } else {
      totalExpense += Number(t.amount);
      if (inputDate === today) expenseToday += Number(t.amount);
    }
  });

  const walletBalances = {};
  allWallets.forEach(w => {
    let wBalance = 0;
    transactions.forEach(t => {
      if (t.wallet_id === w.id) {
        if (t.type === 'pemasukan') wBalance += Number(t.amount);
        else wBalance -= Number(t.amount);
      }
    });
    walletBalances[w.id] = wBalance;
  });

  const select = document.getElementById('walletSelect');
  select.innerHTML = '';
  allWallets.forEach(w => select.innerHTML += `<option value="${w.id}">${w.name}</option>`);

  document.getElementById('incomeToday').textContent = formatRupiah(incomeToday);
  document.getElementById('expenseToday').textContent = formatRupiah(expenseToday);

  const goalSelect = document.getElementById('goalWalletSelect');
  if (goalSelect) {
    goalSelect.innerHTML = '<option value="">Pilih Dompet</option>';
    allWallets.forEach(w => goalSelect.innerHTML += `<option value="${w.id}">${w.name}</option>`);
  }

  const paySelect = document.getElementById('payWalletSelect');
  if (paySelect) {
    paySelect.innerHTML = '<option value="">Pilih Dompet</option>';
    allWallets.forEach(w => paySelect.innerHTML += `<option value="${w.id}">${w.name}</option>`);
  }

  renderWalletList(walletBalances);
}

// ===== RENDER WALLET LIST =====
function renderWalletList(walletBalances) {
  const listContainer = document.getElementById('walletListVertical');
  listContainer.innerHTML = '';
  
  let totalFromWallets = 0;
  allWallets.forEach(w => totalFromWallets += walletBalances[w.id] || 0);

  const allItem = document.createElement('div');
  allItem.className = 'wallet-list-item';
  allItem.innerHTML = `<div class="w-item-left"><div class="w-item-icon"><i data-lucide="layers" width="20" height="20"></i></div><span class="w-item-name">Semua Dompet</span></div><span class="w-item-bal">${formatRupiah(totalFromWallets)}</span>`;
  allItem.onclick = () => {
    document.getElementById('activeWalletLabel').textContent = 'Semua Dompet';
    document.getElementById('activeWalletBalance').textContent = formatRupiah(totalFromWallets);
    document.getElementById('walletSelectorIcon').setAttribute('data-lucide', 'layers');
    walletSelectModal.classList.remove('open');
    lucide.createIcons();
  };
  listContainer.appendChild(allItem);

  allWallets.forEach(w => {
    const item = document.createElement('div');
    item.className = 'wallet-list-item';
    item.innerHTML = `<div class="w-item-left"><div class="w-item-icon"><i data-lucide="${w.icon}" width="20" height="20"></i></div><span class="w-item-name">${w.name}</span></div><span class="w-item-bal">${formatRupiah(walletBalances[w.id])}</span>`;
    item.onclick = () => {
      document.getElementById('activeWalletLabel').textContent = w.name;
      document.getElementById('activeWalletBalance').textContent = formatRupiah(walletBalances[w.id]);
      document.getElementById('walletSelectorIcon').setAttribute('data-lucide', w.icon);
      walletSelectModal.classList.remove('open');
      lucide.createIcons();
    };
    listContainer.appendChild(item);
  });

  document.getElementById('activeWalletLabel').textContent = 'Semua Dompet';
  document.getElementById('activeWalletBalance').textContent = formatRupiah(totalFromWallets);
  lucide.createIcons();
}

// ===== VALIDASI SALDO =====
async function validateWalletBalance(walletId, amount) {
  const wallet = allWallets.find(w => w.id === walletId);
  if (!wallet) return { valid: false, message: 'Dompet tidak ditemukan.' };
  let balance = 0;
  allTransactions.forEach(t => {
    if (t.wallet_id === walletId) {
      if (t.type === 'pemasukan') balance += Number(t.amount);
      else balance -= Number(t.amount);
    }
  });
  if (balance < amount) {
    return {
      valid: false,
      message: `❌ Saldo dompet "${wallet.name}" tidak mencukupi.\nSaldo: ${formatRupiah(balance)}\nDibutuhkan: ${formatRupiah(amount)}`,
      balance: balance
    };
  }
  return { valid: true, balance: balance };
}

// ===== EVENT LISTENER: TAMBAH DOMPET =====
document.getElementById('walletForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('walletNameInput').value;
  const balance = parseFloat(document.getElementById('walletBalanceInput').value) || 0;
  const btn = document.getElementById('saveWalletBtn');
  btn.innerHTML = 'Menyimpan...'; btn.disabled = true;

  const { data: walletData, error: walletError } = await db.from('wallets').insert([{
    name: name,
    icon: 'credit-card',
    balance: 0
  }]).select();

  if (walletError) {
    console.error('Gagal buat dompet:', walletError);
    btn.innerHTML = 'Simpan Dompet'; btn.disabled = false;
    alert('Gagal membuat dompet. Silakan coba lagi.');
    return;
  }

  if (balance > 0 && walletData && walletData.length > 0) {
    const wallet = walletData[0];
    await db.from('transactions').insert([{
      type: 'pemasukan',
      amount: balance,
      category: 'Saldo Awal',
      description: `Saldo awal ${name}`,
      transaction_date: new Date().toISOString().split('T')[0],
      wallet_id: wallet.id
    }]);
  }

  btn.innerHTML = 'Simpan Dompet'; btn.disabled = false;
  walletModal.classList.remove('open');
  document.getElementById('walletForm').reset();
  document.getElementById('walletBalanceInput').value = '';
  fetchData();
});

// ===== EVENT LISTENER: BUKA MODAL WALLET =====
document.getElementById('walletSelectorBtn').addEventListener('click', () => walletSelectModal.classList.add('open'));
document.getElementById('closeWalletSelectModal').addEventListener('click', () => walletSelectModal.classList.remove('open'));

document.getElementById('btnOpenAddWallet').addEventListener('click', () => {
  walletSelectModal.classList.remove('open');
  walletModal.classList.add('open');
});
document.getElementById('closeWalletModal').addEventListener('click', () => walletModal.classList.remove('open'));