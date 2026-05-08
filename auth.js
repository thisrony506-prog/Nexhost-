/**
 * ═══════════════════════════════════════════════════════════
 * ADLY - Authentication Module
 * ═══════════════════════════════════════════════════════════
 */

// ══════ Auth State ═════
let currentUser = null;
let authStateListener = null;

// ══════ Initialize Auth ═════
const initAuth = () => {
  // Auth state listener
  authStateListener = auth.onAuthStateChanged(async (user) => {
    if (user) {
      // User signed in - load data from Firestore
      const result = await DB.getUser(user.uid);
      if (result.success) {
        currentUser = result.data;
        loadUserData(currentUser);
        launchApp();
      } else {
        // Fallback: create minimal user object
        currentUser = {
          uid: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL
        };
        launchApp();
      }
    } else {
      // User signed out
      currentUser = null;
      showAuthScreen();
    }
  });
  
  // Setup PIN input
  setupPINInput('regPin');
  
  // Setup password strength
  $('#regPassword')?.addEventListener('input', updatePasswordStrength);
};

// ══════ Auth Tab Switching ═════
const switchAuthTab = (tab) => {
  // Update tabs
  $$('.auth-tab').forEach(t => t.classList.remove('active'));
  $(`.auth-tab[data-tab="${tab}"]`)?.classList.add('active');  
  // Update indicator
  const indicator = $('#tabIndicator');
  if (indicator) {
    indicator.style.transform = tab === 'register' ? 'translateX(100%)' : 'translateX(0)';
  }
  
  // Show/hide forms
  $('#loginForm')?.classList.toggle('active', tab === 'login');
  $('#registerForm')?.classList.toggle('active', tab === 'register');
  
  // Clear errors
  $$('.error-message').forEach(el => {
    el.textContent = '';
    el.classList.remove('show');
  });
  $$('.input-field').forEach(el => el.classList.remove('error'));
};

// ══════ Password Strength ═════
const updatePasswordStrength = () => {
  const password = $('#regPassword')?.value || '';
  const strength = calculatePasswordStrength(password);
  
  const fill = $('#strengthFill');
  const text = $('#strengthText');
  
  if (fill) {
    fill.className = 'strength-fill ' + strength.level;
    fill.style.width = strength.width + '%';
  }
  if (text) {
    text.textContent = password ? strength.text : '';
    text.style.color = strength.color;
  }
};

// ══════ Validation ═════
const validateLoginForm = () => {
  const identifier = $('#loginIdentifier')?.value.trim();
  const password = $('#loginPassword')?.value;
  let valid = true;
  
  if (!identifier) {
    showError('loginIdentifier', 'ইমেইল বা ফোন নম্বর দিন');
    valid = false;
  } else if (identifier.includes('@') && !validateEmail(identifier)) {
    showError('loginIdentifier', 'সঠিক ইমেইল ফরম্যাট দিন');
    valid = false;
  } else if (!identifier.includes('@') && !validatePhone(identifier, $('#loginCountry')?.value)) {    showError('loginIdentifier', 'সঠিক ফোন নম্বর দিন');
    valid = false;
  }
  
  if (!password || password.length < 6) {
    showError('loginPassword', 'পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর)');
    valid = false;
  }
  
  return valid;
};

const validateRegisterForm = () => {
  const name = $('#regName')?.value.trim();
  const email = $('#regEmail')?.value.trim();
  const phone = $('#regPhone')?.value.trim();
  const password = $('#regPassword')?.value;
  const confirm = $('#regConfirmPassword')?.value;
  const pin = $('#regPin')?.value;
  const referral = $('#regReferral')?.value.trim();
  const agree = $('#agreeTerms')?.checked;
  
  let valid = true;
  
  if (name.length < 2) {
    showError('regName', 'নাম দিন (কমপক্ষে ২ অক্ষর)');
    valid = false;
  }
  
  if (email && !validateEmail(email)) {
    showError('regEmail', 'সঠিক ইমেইল ফরম্যাট দিন');
    valid = false;
  }
  
  if (!validatePhone(phone, $('#regCountry')?.value)) {
    showError('regPhone', 'সঠিক ফোন নম্বর দিন');
    valid = false;
  }
  
  if (!validatePassword(password)) {
    showError('regPassword', 'কমপক্ষে ৮ অক্ষর, সংখ্যা ও অক্ষর মিলিয়ে দিন');
    valid = false;
  }
  
  if (password !== confirm) {
    showError('regConfirmPassword', 'পাসওয়ার্ড মিলছে না');
    valid = false;
  }
  
  if (!validatePIN(pin)) {    showError('regPin', 'ঠিক ৬ সংখ্যা দিন');
    valid = false;
  }
  
  if (referral && !validateReferralCode(referral)) {
    showError('regReferral', 'অবৈধ রেফারেল কোড');
    valid = false;
  }
  
  if (!agree) {
    showError('agreeTerms', 'Terms মেনে নিন');
    valid = false;
  }
  
  return valid;
};

// ══════ Login Handler ═════
const handleLogin = async (event) => {
  event.preventDefault();
  
  if (!validateLoginForm()) return;
  
  const btn = $('#loginBtn');
  const identifier = $('#loginIdentifier').value.trim();
  const password = $('#loginPassword').value;
  
  btn.classList.add('loading');
  btn.disabled = true;
  
  try {
    let userCredential;
    
    if (identifier.includes('@')) {
      // Email login
      userCredential = await auth.signInWithEmailAndPassword(identifier, password);
    } else {
      // Phone login - custom implementation
      const countryCode = $('#loginCountry')?.value || '+880';
      const phoneNum = countryCode + identifier.replace(/\D/g, '');
      
      // Find user by phone in Firestore
      const query = await db.collection('users')
        .where('phone', '==', phoneNum)
        .limit(1)
        .get();
      
      if (query.empty) {
        throw new Error('এই নম্বরে কোনো অ্যাকাউন্ট নেই');
      }      
      const userData = query.docs[0].data();
      
      // Verify password (hashed comparison in production)
      if (userData.passwordHash !== await hashPassword(password)) {
        throw new Error('ভুল পাসওয়ার্ড');
      }
      
      // Sign in with custom token or simulate
      userCredential = { user: { uid: query.docs[0].id, ...userData } };
    }
    
    // Update last login
    await DB.updateUser(userCredential.user.uid, {
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    toastOk('সফলভাবে লগইন হয়েছে!');
    
  } catch (error) {
    console.error('Login error:', error);
    let msg = 'লগইন করতে সমস্যা হয়েছে';
    
    if (error.code === 'auth/user-not-found') msg = 'এই অ্যাকাউন্ট নেই';
    else if (error.code === 'auth/wrong-password') msg = 'ভুল পাসওয়ার্ড';
    else if (error.code === 'auth/invalid-email') msg = 'অবৈধ ইমেইল';
    else if (error.code === 'auth/too-many-requests') msg = 'অতিরিক্ত চেষ্টা, পরে আবার চেষ্টা করুন';
    else msg = error.message || msg;
    
    toastErr(msg);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
};

// ══════ Register Handler ═════
const handleRegister = async (event) => {
  event.preventDefault();
  
  if (!validateRegisterForm()) return;
  
  const btn = $('#registerBtn');
  btn.classList.add('loading');
  btn.disabled = true;
  
  try {
    const name = $('#regName').value.trim();
    const email = $('#regEmail').value.trim();
    const countryCode = $('#regCountry').value;    const phone = $('#regPhone').value.trim();
    const password = $('#regPassword').value;
    const pin = $('#regPin').value;
    const referral = $('#regReferral').value.trim();
    
    const phoneNum = countryCode + phone.replace(/\D/g, '');
    const uid = email ? (await auth.createUserWithEmailAndPassword(email, password)).user.uid : generateUID();
    const refCode = generateRefCode();
    
    // Hash password for phone-only accounts
    const passwordHash = await hashPassword(password);
    
    // Prepare user data
    const userData = {
      uid,
      name,
      phone: phoneNum,
      cc: countryCode,
      email: email || null,
      passwordHash,
      refCode,
      referredBy: referral || null,
      securityPIN: pin,
      balance: 0,
      todayEarnings: 0,
      totalEarnings: 0,
      totalInvested: 0,
      totalDeposited: 0,
      totalWithdrawn: 0,
      currentPlanIndex: -1,
      internshipUsed: false,
      checkedInToday: false,
      checkInStreak: 1,
      aiProfit: 0,
      dailyAds: [],
      transactionLogs: [],
      team: [],
      lastDevice: generateDeviceFingerprint(),
      isVerified: false
    };
    
    // Create user in Firestore
    const result = await DB.createUser(userData);
    if (!result.success) throw new Error(result.error);
    
    // Process referral if provided
    if (referral) {
      await DB.processReferral(referral, uid);
    }
        // Give referral bonus
    if (referral && validateReferralCode(referral)) {
      await DB.incrementField(uid, 'balance', APP.REFERRAL_BONUS);
      await DB.incrementField(uid, 'totalEarnings', APP.REFERRAL_BONUS);
    }
    
    // Set current user
    currentUser = {
      uid,
      name,
      phone: phoneNum,
      cc: countryCode,
      refCode,
      email
    };
    
    toastOk(`স্বাগতম ${name}! অ্যাকাউন্ট তৈরি হয়েছে!`);
    launchApp();
    
  } catch (error) {
    console.error('Registration error:', error);
    let msg = 'রেজিস্ট্রেশন করতে সমস্যা হয়েছে';
    
    if (error.code === 'auth/email-already-in-use') msg = 'এই ইমেইল ইতিমধ্যে ব্যবহৃত';
    else if (error.code === 'auth/invalid-email') msg = 'অবৈধ ইমেইল ফরম্যাট';
    else if (error.code === 'auth/weak-password') msg = 'পাসওয়ার্ড খুব দুর্বল';
    else msg = error.message || msg;
    
    toastErr(msg);
  } finally {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
};

// ══════ Password Hashing ═════
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'adly-salt-2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// ══════ Social Login ═════
const socialLogin = async (provider) => {
  try {
    let result;
        if (provider === 'google') {
      const googleProvider = new firebase.auth.GoogleAuthProvider();
      result = await auth.signInWithPopup(googleProvider);
    } else if (provider === 'facebook') {
      const fbProvider = new firebase.auth.FacebookAuthProvider();
      result = await auth.signInWithPopup(fbProvider);
    }
    
    const user = result.user;
    
    // Check if user exists in Firestore
    const doc = await db.collection('users').doc(user.uid).get();
    
    if (!doc.exists) {
      // Create new user
      await DB.createUser({
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        photoURL: user.photoURL,
        phone: null,
        cc: '+880',
        refCode: generateRefCode(),
        securityPIN: '',
        balance: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });
    }
    
    toastOk('সফলভাবে লগইন হয়েছে!');
    
  } catch (error) {
    console.error('Social login error:', error);
    toastErr('সোশ্যাল লগইন ব্যর্থ হয়েছে');
  }
};

// ══════ Forgot Password ═════
const openForgotModal = () => {
  openModal('forgot');
  
  $('#modalBody').innerHTML = `
    <h3 class="text-lg font-bold mb-3 text-center">পাসওয়ার্ড রিসেট</h3>
    <div class="space-y-4">
      <div>
        <label class="input-label">ইমেইল বা ফোন নম্বর</label>
        <input type="text" class="input-field" id="forgotIdentifier" placeholder="example@email.com / 01XXXXXXXXX">
      </div>      <div class="alert alert-warning">
        <i class="fas fa-info-circle mr-2"></i>
        OTP আপনার নম্বরে বা ইমেইলে পাঠানো হবে
      </div>
      <button class="btn-primary" onclick="sendResetCode()">
        <i class="fas fa-paper-plane mr-2"></i>OTP পাঠান
      </button>
      <button class="btn-secondary" onclick="closeModal()">বাতিল</button>
    </div>
  `;
};

const sendResetCode = async () => {
  const identifier = $('#forgotIdentifier')?.value.trim();
  if (!identifier) {
    toastErr('ইমেইল বা ফোন নম্বর দিন');
    return;
  }
  
  try {
    if (identifier.includes('@')) {
      await auth.sendPasswordResetEmail(identifier);
      toastOk('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে!');
    } else {
      // Phone OTP - implement with Firebase Phone Auth
      toastOk('OTP আপনার নম্বরে পাঠানো হয়েছে (Demo)');
    }
    closeModal();
  } catch (error) {
    toastErr('সমস্যা হয়েছে: ' + (error.message || 'Unknown error'));
  }
};

// ══════ Logout ═════
const handleLogout = async () => {
  try {
    await auth.signOut();
    
    // Clear local state
    currentUser = null;
    storage.clear();
    
    // Reset UI
    showAuthScreen();
    
    toastOk('সফলভাবে লগ আউট হয়েছে');
  } catch (error) {
    console.error('Logout error:', error);
    toastErr('লগ আউট করতে সমস্যা হয়েছে');
  }};

// ══════ UI Helpers ═════
const showAuthScreen = () => {
  $('#splash')?.classList.add('hide');
  $('#authScreen')?.classList.remove('hidden');
  $('#mainApp')?.classList.add('hidden');
  $('#mainNav')?.classList.add('hidden');
};

const launchApp = () => {
  $('#authScreen')?.classList.add('hidden');
  $('#mainApp')?.classList.remove('hidden');
  $('#mainNav')?.classList.remove('hidden');
  
  // Update profile UI
  updateProfileUI();
  
  // Load initial data
  loadDashboard();
};

const updateProfileUI = () => {
  if (!currentUser) return;
  
  // Avatar
  const avatar = $('#profileAvatar');
  if (avatar && currentUser.name) {
    avatar.textContent = currentUser.name.charAt(0).toUpperCase();
  }
  
  // Name & Info
  if ($('#profileName')) $('#profileName').textContent = currentUser.name || 'User';
  if ($('#profileUID')) $('#profileUID').textContent = `UID: ${currentUser.uid}`;
  if ($('#profilePhone')) $('#profilePhone').textContent = currentUser.phone || '';
  if ($('#myRefCode')) $('#myRefCode').textContent = currentUser.refCode || generateRefCode();
  
  // Update greeting
  if ($('#greetingTime')) {
    $('#greetingTime').textContent = getCurrentGreeting();
  }
};

// ══════ Load User Data ═════
const loadUserData = (user) => {
  // Update global state
  balance = user.balance || 0;
  todayE = user.todayEarnings || 0;
  cumE = user.totalEarnings || 0;
  curPlanIdx = user.currentPlanIndex ?? -1;  totalInv = user.totalInvested || 0;
  totalDep = user.totalDeposited || 0;
  totalWd = user.totalWithdrawn || 0;
  internUsed = user.internshipUsed || false;
  checkedIn = user.checkedInToday || false;
  ciDay = user.checkInStreak || 1;
  secPIN = user.securityPIN || '';
  aiProfit = user.aiProfit || 0;
  dailyAds = user.dailyAds || [];
  
  // Update UI
  syncBal();
  updateProfileUI();
  loadAds();
  updPlanUI();
};

// ══════ Export ═════
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initAuth, switchAuthTab, handleLogin, handleRegister,
    socialLogin, openForgotModal, handleLogout,
    loadUserData, updateProfileUI
  };
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initAuth);