/**
 * ═══════════════════════════════════════════════════════════
 * ADLY - Firebase Configuration & Constants
 * ═══════════════════════════════════════════════════════════
 */

// ══════ FIREBASE CONFIG ═════
// ⚠️ Replace with your actual Firebase config from console.firebase.google.com
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // Optional
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence().catch(err => {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.log('Browser does not support offline persistence.');
  }
});

// ══════ APP CONSTANTS ═════
const APP = {
  NAME: 'Adly',
  VERSION: '1.0.0',
  CURRENCY: 'USDT',
  MIN_DEPOSIT: 12,
  MIN_WITHDRAW: 1,
  WITHDRAW_FEE: 0.01, // 1%
  REFERRAL_BONUS: 0.50,
  CHECKIN_REWARDS: [0.02, 0.03, 0.05, 0.08, 0.10, 0.15, 0.20],
  COMMISSION_RATES: { L1: 0.04, L2: 0.02, L3: 0.01, MANAGER: 0.01 },
  PIN_LENGTH: 6,
  MAX_LOGIN_ATTEMPTS: 5,  PIN_LOCK_DURATION: 120000, // 2 minutes
  SESSION_TIMEOUT: 3600000 // 1 hour
};

// ══════ PLAN LEVELS ═════
const PLANS = [
  {
    id: 'intern',
    name: { bn: 'ইন্টার্নশিপ', en: 'Internship' },
    icon: 'fa-seedling',
    tasks: 1,
    validity: 2,
    dailyEarning: 0.05,
    unlockAmount: 0,
    color: 'var(--wr)',
    colorHex: '#FF6B35'
  },
  {
    id: 'p1',
    name: { bn: 'P1 নিয়মিত', en: 'P1 Regular' },
    icon: 'fa-star',
    tasks: 3,
    validity: 1116,
    dailyEarning: 0.36,
    unlockAmount: 12,
    color: 'var(--em)',
    colorHex: '#00FF88'
  },
  {
    id: 'p2',
    name: { bn: 'P2 আনুষ্ঠানিক', en: 'P2 Official' },
    icon: 'fa-crown',
    tasks: 4,
    validity: 1200,
    dailyEarning: 0.80,
    unlockAmount: 30,
    color: 'var(--if)',
    colorHex: '#00D4FF'
  },
  {
    id: 'p3',
    name: { bn: 'P3 সিনিয়র', en: 'P3 Senior' },
    icon: 'fa-gem',
    tasks: 5,
    validity: 1200,
    dailyEarning: 1.60,
    unlockAmount: 60,
    color: 'var(--pp)',
    colorHex: '#BD00FF'
  },  {
    id: 'p4',
    name: { bn: 'P4 ম্যানেজার', en: 'P4 Manager' },
    icon: 'fa-bullhorn',
    tasks: 10,
    validity: 1200,
    dailyEarning: 5.00,
    unlockAmount: 180,
    color: 'var(--wr)',
    colorHex: '#FF6B35'
  },
  {
    id: 'p5',
    name: { bn: 'P5 এজেন্ট', en: 'P5 Agent' },
    icon: 'fa-map-marker-alt',
    tasks: 10,
    validity: 1200,
    dailyEarning: 14.00,
    unlockAmount: 500,
    color: 'var(--em)',
    colorHex: '#00FF88'
  },
  {
    id: 'p6',
    name: { bn: 'P6 সাধারণ এজেন্ট', en: 'P6 General Agent' },
    icon: 'fa-building',
    tasks: 15,
    validity: 1200,
    dailyEarning: 30.00,
    unlockAmount: 1000,
    color: 'var(--if)',
    colorHex: '#00D4FF'
  },
  {
    id: 'p7',
    name: { bn: 'P7 সিনিয়র এজেন্ট', en: 'P7 Senior Agent' },
    icon: 'fa-city',
    tasks: 30,
    validity: 1200,
    dailyEarning: 90.00,
    unlockAmount: 3000,
    color: 'var(--pp)',
    colorHex: '#BD00FF'
  },
  {
    id: 'p8',
    name: { bn: 'P8 শহর অংশীদার', en: 'P8 City Partner' },
    icon: 'fa-handshake',
    tasks: 30,
    validity: 1200,    dailyEarning: 186.00,
    unlockAmount: 6000,
    color: 'var(--gd)',
    colorHex: '#FFD700'
  },
  {
    id: 'p9',
    name: { bn: 'P9 শীর্ষ অংশীদার', en: 'P9 Top Partner' },
    icon: 'fa-trophy',
    tasks: 40,
    validity: 1200,
    dailyEarning: 480.00,
    unlockAmount: 15000,
    color: 'var(--wr)',
    colorHex: '#FF6B35'
  }
];

// ══════ SAMPLE ADS ═════
const SAMPLE_ADS = [
  { brand: 'Corning Glass', category: 'Tech', duration: 8 },
  { brand: 'PlayStation 5', category: 'Gaming', duration: 10 },
  { brand: 'Renault Megane', category: 'Auto', duration: 9 },
  { brand: 'Oppenheimer', category: 'Film', duration: 12 },
  { brand: 'Samsung Galaxy', category: 'Tech', duration: 8 },
  { brand: 'Nike Air Max', category: 'Fashion', duration: 7 },
  { brand: 'Red Bull Racing', category: 'Sports', duration: 10 },
  { brand: 'Mercedes EQS', category: 'Auto', duration: 11 },
  { brand: 'Dyson V15', category: 'Home', duration: 8 },
  { brand: 'Lego Technic', category: 'Toys', duration: 7 }
];

// ══════ COUNTRY CODES ═════
const COUNTRY_CODES = {
  '+880': { flag: '🇧🇩', name: 'Bangladesh', phoneLength: 10 },
  '+1': { flag: '🇺🇸', name: 'USA/Canada', phoneLength: 10 },
  '+44': { flag: '🇬🇧', name: 'UK', phoneLength: 10 },
  '+91': { flag: '🇮🇳', name: 'India', phoneLength: 10 },
  '+92': { flag: '🇵🇰', name: 'Pakistan', phoneLength: 10 },
  '+966': { flag: '🇸🇦', name: 'Saudi Arabia', phoneLength: 9 },
  '+971': { flag: '🇦🇪', name: 'UAE', phoneLength: 9 },
  '+60': { flag: '🇲🇾', name: 'Malaysia', phoneLength: 9 },
  '+63': { flag: '🇵🇭', name: 'Philippines', phoneLength: 10 },
  '+62': { flag: '🇮🇩', name: 'Indonesia', phoneLength: 9 },
  '+90': { flag: '🇹🇷', name: 'Turkey', phoneLength: 10 },
  '+20': { flag: '🇪🇬', name: 'Egypt', phoneLength: 10 }
};

// ══════ LANGUAGE STRINGS ═════
const LANG = {  bn: {
    welcome: 'স্বাগতম',
    earnings: 'আয়',
    balance: 'ব্যালেন্স',
    tasks: 'টাস্ক',
    withdraw: 'প্রত্যাহার',
    deposit: 'জমা',
    plans: 'প্ল্যান',
    referral: 'রেফারেল',
    profile: 'প্রোফাইল',
    logout: 'প্রস্থান',
    // ... add more translations
  },
  en: {
    welcome: 'Welcome',
    earnings: 'Earnings',
    balance: 'Balance',
    tasks: 'Tasks',
    withdraw: 'Withdraw',
    deposit: 'Deposit',
    plans: 'Plans',
    referral: 'Referral',
    profile: 'Profile',
    logout: 'Logout',
    // ... add more translations
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { firebaseConfig, APP, PLANS, SAMPLE_ADS, COUNTRY_CODES, LANG };
}