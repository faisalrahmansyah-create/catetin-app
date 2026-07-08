// ============================================
// AUTHENTICATION
// ============================================

let currentUser = null;
let isLoggedIn = false;

// ===== CHECK AUTH =====
async function checkAuth() {
  console.log('🔐 Checking auth...');
  
  try {
    const { data: { session }, error } = await db.auth.getSession();
    console.log('📦 Session:', session);
    
    if (error) {
      console.error('❌ Session error:', error);
    }
    
    if (session) {
      currentUser = session.user;
      isLoggedIn = true;
      console.log('✅ User logged in:', currentUser.email);
      showAppContent();
    } else {
      console.log('ℹ️ No session found, showing login');
      showLoginModal();
    }
  } catch (error) {
    console.error('❌ Check auth error:', error);
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
  
  // ===== START NOTIFICATION LISTENER =====
  if (typeof startNotificationListener === 'function') {
    setTimeout(startNotificationListener, 2000);
  }
}

async function loginWithGoogle() {
  console.log('🔐 Login with Google clicked');
  
  // ===== PASTIKAN APP_URL TERSEDIA =====
  let redirectUrl;
  if (typeof APP_URL !== 'undefined' && APP_URL) {
    redirectUrl = APP_URL;
  } else {
    redirectUrl = window.location.origin + window.location.pathname;
    console.warn('⚠️ APP_URL not defined, using fallback:', redirectUrl);
  }
  console.log('📍 Redirect to:', redirectUrl);
  
  try {
    const { data, error } = await db.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: redirectUrl
      }
    });
    
    console.log('📦 Login response:', { data, error });
    
    if (error) throw error;
  } catch (error) {
    console.error('❌ Login error:', error);
    alert('Gagal login: ' + error.message);
  }
}

// ===== LOGOUT =====
async function logout() {
  console.log('🚪 Logging out...');
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

// ===== EKSPOR GLOBAL =====
window.loginWithGoogle = loginWithGoogle;
window.checkAuth = checkAuth;
window.logout = logout;
