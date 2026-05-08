/**
 * ═══════════════════════════════════════════════════════════
 * ADLY - Utility Functions
 * ═══════════════════════════════════════════════════════════
 */

// ══════ DOM Helpers ═════
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

const createElement = (tag, classes = '', attributes = {}) => {
  const el = document.createElement(tag);
  if (classes) el.className = classes;
  Object.entries(attributes).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
  return el;
};

// ══════ Formatting ═════
const formatCurrency = (amount, currency = 'USDT') => {
  return `$${parseFloat(amount).toFixed(4)}`;
};

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const formatShortTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const getCurrentGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'শুভ সকাল';
  if (hour < 17) return 'শুভ দুপুর';
  return 'শুভ সন্ধ্যা';
};
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

// ══════ Validation ═════
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePhone = (phone, countryCode = '+880') => {
  const clean = phone.replace(/\D/g, '');
  const expectedLength = COUNTRY_CODES[countryCode]?.phoneLength || 10;
  return clean.length >= expectedLength - 2; // Allow some flexibility
};

const validatePassword = (password) => {
  return password.length >= 8 &&
         /[a-zA-Z]/.test(password) &&
         /[0-9]/.test(password);
};

const validatePIN = (pin) => {
  return /^\d{6}$/.test(pin);
};

const validateReferralCode = (code) => {
  return /^ADL-\d{6}$/.test(code);
};

// ══════ Password Strength ═════
const calculatePasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score <= 2) return { level: 'weak', text: 'দুর্বল', color: 'var(--dn)', width: 25 };
  if (score === 3) return { level: 'fair', text: 'মাঝারি', color: 'var(--wr)', width: 50 };
  if (score === 4) return { level: 'good', text: 'ভালো', color: 'var(--gd)', width: 75 };
  return { level: 'strong', text: 'শক্তিশালী', color: 'var(--em)', width: 100 };
};

// ══════ Random Generators ═════
const generateUID = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const generateRefCode = () => {
  return 'ADL-' + Math.floor(100000 + Math.random() * 900000);
};

const generateDeviceFingerprint = () => {
  const ua = navigator.userAgent;
  const screen = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const lang = navigator.language;
  
  let hash = 0;
  const str = ua + screen + timezone + lang;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).substring(0, 16);
};

// ══════ Toast Notifications ═════
const showToast = (message, type = 'info', duration = 3200) => {
  const container = $('#toastContainer');
  if (!container) return;
  
  const toast = createElement('div', `toast ${type}`);
  toast.innerHTML = `
    <i class="fas ${
      type === 'success' ? 'fa-check-circle text-em' :
      type === 'error' ? 'fa-exclamation-triangle text-dn' :
      type === 'warning' ? 'fa-shield-halved text-wr' :
      'fa-info-circle text-if'
    }"></i>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 240);
    }
  }, duration);
};

const toastOk = (msg) => showToast(msg, 'success');
const toastErr = (msg) => showToast(msg, 'error');
const toastWrn = (msg) => showToast(msg, 'warning');
// ══════ Modal Functions ═════
const openModal = (contentId) => {
  const modal = $('#modalOverlay');
  const content = $('#modalContent');
  const body = $('#modalBody');
  
  if (!modal || !content || !body) return;
  
  // Load content from predefined sections or custom HTML
  if (contentId === 'terms') {
    body.innerHTML = `
      <h3 class="text-lg font-bold mb-3">Terms of Service</h3>
      <div class="text-xs text-ts space-y-2">
        <p>1. Users must be 18+ to use this platform.</p>
        <p>2. One account per person. Multiple accounts will result in permanent ban.</p>
        <p>3. Withdrawals require 6-digit security PIN verification.</p>
        <p>4. We reserve the right to modify terms at any time.</p>
        <p>5. By using Adly, you agree to these terms.</p>
      </div>
      <button class="btn-primary mt-4" onclick="closeModal('infoModal')">I Agree</button>
    `;
  } else if (contentId === 'privacy') {
    body.innerHTML = `
      <h3 class="text-lg font-bold mb-3">Privacy Policy</h3>
      <div class="text-xs text-ts space-y-2">
        <p>• We collect minimal data: name, phone, email (optional).</p>
        <p>• Your data is encrypted and never sold to third parties.</p>
        <p>• Device fingerprinting is used for fraud prevention.</p>
        <p>• You can request data deletion anytime via support.</p>
        <p>• Cookies are used only for session management.</p>
      </div>
      <button class="btn-primary mt-4" onclick="closeModal('infoModal')">Understood</button>
    `;
  }
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

const closeModal = (modalId = 'modalOverlay') => {
  const modal = $('#' + modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
};

const closeModalOnOverlay = (event) => {
  if (event.target.id === 'modalOverlay') {    closeModal();
  }
};

// ══════ Dropdown Functions ═════
const toggleDropdown = (dropdownId) => {
  const menu = $('#' + dropdownId + 'Menu');
  if (menu) {
    menu.classList.toggle('show');
  }
};

const closeDropdowns = () => {
  $$('.dropdown-menu').forEach(menu => {
    menu.classList.remove('show');
  });
};

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown-wrapper')) {
    closeDropdowns();
  }
});

// ══════ Input Helpers ═════
const clearError = (fieldId) => {
  const field = $('#' + fieldId);
  const error = $('#' + fieldId + 'Error');
  if (field) field.classList.remove('error');
  if (error) {
    error.textContent = '';
    error.classList.remove('show');
  }
};

const showError = (fieldId, message) => {
  const field = $('#' + fieldId);
  const error = $('#' + fieldId + 'Error');
  if (field) field.classList.add('error');
  if (error) {
    error.textContent = message;
    error.classList.add('show');
  }
};

const togglePassword = (fieldId, btn) => {
  const field = $('#' + fieldId);
  const icon = btn.querySelector('i');
  if (!field || !icon) return;  
  if (field.type === 'password') {
    field.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    field.type = 'password';
    icon.className = 'fas fa-eye';
  }
};

// ══════ PIN Input Handler ═════
const setupPINInput = (inputId) => {
  const input = $('#' + inputId);
  const dots = input?.parentElement?.querySelectorAll('.pin-dot');
  if (!input || !dots) return;
  
  input.addEventListener('input', (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    e.target.value = value;
    
    dots.forEach((dot, index) => {
      dot.classList.toggle('filled', index < value.length);
    });
  });
};

// ══════ Animation Helpers ═════
const animateValue = (element, start, end, duration, prefix = '', suffix = '') => {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = start + (end - start) * progress;
    element.textContent = prefix + formatNumber(value) + suffix;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
};

const animateElement = (element, value, animation = 'bUp') => {
  if (!element) return;
  element.textContent = value;
  element.classList.remove(animation);
  void element.offsetWidth; // Trigger reflow
  element.classList.add(animation);
};

// ══════ Coin Fly Animation ═════const flyCoins = (element, count = 6, targetSelector = '#walletBalance') => {
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  const target = $(targetSelector);
  if (!target) return;
  
  const targetRect = target.getBoundingClientRect();
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const coin = createElement('div', 'coin');
      coin.textContent = '$';
      
      // Random start position within element
      const startX = rect.left + Math.random() * rect.width - 10;
      const startY = rect.top + Math.random() * Math.min(rect.height, 40);
      
      coin.style.left = startX + 'px';
      coin.style.top = startY + 'px';
      
      // Random trajectory
      const offsetX = (Math.random() - 0.5) * 80;
      const offsetY = (Math.random() - 0.5) * 60 - 40;
      
      coin.style.setProperty('--tx', offsetX + 'px');
      coin.style.setProperty('--ty', offsetY + 'px');
      
      // Target position
      const targetX = targetRect.left - rect.left + Math.random() * 24 - 12;
      const targetY = targetRect.top - rect.top;
      
      coin.style.setProperty('--tx2', targetX + 'px');
      coin.style.setProperty('--ty2', targetY + 'px');
      
      document.body.appendChild(coin);
      
      setTimeout(() => {
        if (coin.parentNode) coin.remove();
      }, 900);
    }, i * 60);
  }
};

// ══════ Celebration Effect ═════
const celebrate = (element) => {
  if (!element) return;
  
  const rect = element.getBoundingClientRect();
  const symbols = ['★', '◆', '●', '✦', '✿'];  const colors = ['var(--em)', 'var(--gd)', 'var(--if)', 'var(--pp)', 'var(--wr)'];
  
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const particle = createElement('div', 'celebration');
      particle.textContent = symbols[i % symbols.length];
      particle.style.color = colors[i % colors.length];
      
      const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 140;
      const y = rect.top + 10;
      
      particle.style.left = x + 'px';
      particle.style.top = y + 'px';
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) particle.remove();
      }, 1100);
    }, i * 40);
  }
};

// ══════ QR Code Generator (Simple) ═════
const generateQR = (canvasId, text, size = 128) => {
  const canvas = $('#' + canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const cellSize = 2.4;
  const cells = Math.floor(size / cellSize);
  
  // Clear canvas
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  
  // Generate simple pattern (not real QR, for demo)
  ctx.fillStyle = '#000';
  
  // Position detection patterns
  const drawFinder = (x, y) => {
    ctx.fillStyle = '#000';
    ctx.fillRect(x, y, 7 * cellSize, 7 * cellSize);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + cellSize, y + cellSize, 5 * cellSize, 5 * cellSize);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 2 * cellSize, y + 2 * cellSize, 3 * cellSize, 3 * cellSize);
  };
  
  drawFinder(0, 0);  drawFinder((cells - 7) * cellSize, 0);
  drawFinder(0, (cells - 7) * cellSize);
  
  // Fill with pseudo-random data
  let hash = 0;
  for (let c of text) {
    hash = ((hash << 5) - hash) + c.charCodeAt(0);
    hash |= 0;
  }
  
  ctx.fillStyle = '#000';
  for (let i = 0; i < cells; i++) {
    for (let j = 0; j < cells; j++) {
      // Skip finder pattern areas
      if ((i < 8 && j < 8) || (i < 8 && j >= cells - 8) || (i >= cells - 8 && j < 8)) continue;
      
      hash = ((hash << 3) ^ (hash >> 2)) ^ (i * 31 + j * 17);
      if (Math.abs(hash) % 3 === 0) {
        ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      }
    }
  }
  
  // Center logo
  const logoSize = 16;
  const lx = size / 2 - logoSize / 2;
  const ly = size / 2 - logoSize / 2;
  
  ctx.fillStyle = '#000';
  ctx.fillRect(lx - 2, ly - 2, logoSize + 4, logoSize + 4);
  ctx.fillStyle = '#00FF88';
  ctx.fillRect(lx, ly, logoSize, logoSize);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 11px Outfit';
  ctx.textAlign = 'center';
  ctx.fillText('A', size / 2, size / 2 + 4);
};

// ══════ Copy to Clipboard ═════
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);    textarea.focus();
    textarea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch (e) {
      document.body.removeChild(textarea);
      return false;
    }
  }
};

// ══════ Share Functions ═════
const shareReferral = (platform, code, url) => {
  const text = `Join Adly and earn USDT! 🚀\nReferral Code: ${code}\n${url}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  
  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent('Adly Referral: ' + code)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  };
  
  if (shareUrls[platform]) {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  }
};

// ══════ Storage Helpers ═════
const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage set error:', e);
    }
  },
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },
  remove: (key) => {    localStorage.removeItem(key);
  },
  clear: () => {
    localStorage.clear();
  }
};

// ══════ Debounce/Throttle ═════
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ══════ Export ═════
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    $, $$, createElement,
    formatCurrency, formatNumber, formatTime, formatShortTime,
    getCurrentGreeting, getCurrentTime,
    validateEmail, validatePhone, validatePassword, validatePIN, validateReferralCode,
    calculatePasswordStrength,
    generateUID, generateRefCode, generateDeviceFingerprint,
    showToast, toastOk, toastErr, toastWrn,
    openModal, closeModal, closeModalOnOverlay,
    toggleDropdown, closeDropdowns,
    clearError, showError, togglePassword, setupPINInput,
    animateValue, animateElement,
    flyCoins, celebrate,
    generateQR, copyToClipboard, shareReferral,
    storage, debounce, throttle
  };
}