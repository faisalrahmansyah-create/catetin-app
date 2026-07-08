// ============================================
// AUTHENTICATION
// ============================================

let currentUser = null;
let isLoggedIn = false;

// ===== CHECK AUTH =====
async function checkAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    currentUser = session.user;
    isLoggedIn = true;
    showAppContent();
  } else {
    showLoginModal();
  }
}

// ===== LOGIN =====
function showLoginModal() {
  document.getElementById('loginModal').classList.add('open');
  document.getElementById('appContent').classList.remove('visible');
}

function showAppContent() {
  document.getElementById('loginModal').classList.remove('open');
  document.getElementById('appContent').classList.add('visible');
  updateUserProfile();
  fetchData();
}

async function loginWithGoogle() {
  try {
    const { error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) throw error;
  } catch (error) {
    console.error('Login error:', error);
    alert('Gagal login: ' + error.message);
  }
}

// ===== LOGOUT =====
async function logout() {
  await db.auth.signOut();
  isLoggedIn = false;
  currentUser = null;
  allTransactions = [];
  allScheduledPlans = [];
  allWallets = [];
  allGoals = [];
  closeSidebar();
  showLoginModal();
}

// ===== UPDATE PROFILE =====
function updateUserProfile() {
  const avatarEl = document.getElementById('sidebarAvatar');
  const nameEl = document.getElementById('sidebarName');
  const emailEl = document.getElementById('sidebarEmail');
  if (currentUser) {
    const name = currentUser.user_metadata?.full_name || currentUser.email || 'Pengguna';
    const email = currentUser.email || 'user@email.com';
    const photoUrl = currentUser.user_metadata?.avatar_url;
    if (photoUrl) {
      avatarEl.innerHTML = `<img src="${photoUrl}" alt="${name}">`;
    } else {
      avatarEl.textContent = name.charAt(0).toUpperCase();
    }
    nameEl.textContent = name;
    emailEl.textContent = email;
  }
}