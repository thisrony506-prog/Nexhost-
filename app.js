/**
 * ═══════════════════════════════════════════════════════════
 * ADLY - Main Application Logic
 * ═══════════════════════════════════════════════════════════
 */

// Global State
let balance = 0, todayE = 0, cumE = 0, curPlanIdx = -1;
let totalInv = 0, totalDep = 0, totalWd = 0, aiProfit = 0;
let internUsed = false, checkedIn = false, ciDay = 1, secPIN = '';
let dailyAds = [], logs = [], adWatching = {};
let countdownSec = 86400, currentSlide = 0, lang = 'bn';

// ══════ Navigation ═════
const navigateTo = (page) => {
  // Hide all pages
  $$('.page').forEach(p => p.classList.remove('active'));
  $(`#page-${page}`)?.classList.add('active');
  
  // Update nav
  $$('.nav-item').forEach(n => n.classList.remove('active'));
  $(`.nav-item[data-page="${page}"]`)?.classList.add('active');
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Load page-specific data
  if (page === 'jobs') loadPlans();
  if (page === 'invite') loadTeam();
};

// ══════ Banner Carousel ═════
const initBanner = () => {
  setInterval(() => {
    currentSlide = (currentSlide + 1) % 3;
    updateBanner();
  }, 5000);
};

const goToSlide = (index) => {
  currentSlide = index;
  updateBanner();
};

const updateBanner = () => {
  const track = $('#bannerTrack');
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
  
  $$('.banner-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);  });
};

// ══════ Balance Sync ═════
const syncBal = () => {
  animateElement($('#todayEarnings'), formatCurrency(todayE));
  animateElement($('#jobsTodayEarnings'), formatCurrency(todayE));
  animateElement($('#totalBalance'), formatCurrency(balance));
  animateElement($('#walletBalance'), formatCurrency(balance));
  animateElement($('#analyticsTotalEarnings'), formatCurrency(cumE));
  updateTaskCount();
};

const updateTaskCount = () => {
  const done = dailyAds.filter(a => a.done).length;
  const total = curPlanIdx >= 0 ? PLANS[curPlanIdx].tasks : 0;
  const text = `${done}/${total}`;
  
  if ($('#taskProgress')) $('#taskProgress').textContent = text;
  if ($('#homeTaskCount')) $('#homeTaskCount').textContent = text;
  if ($('#emptyEarnings')) $('#emptyEarnings').textContent = formatCurrency(todayE);
};

// ══════ Countdown Timer ═════
const startCountdown = () => {
  setInterval(() => {
    if (curPlanIdx >= 0) {
      countdownSec--;
      if (countdownSec < 0) {
        countdownSec = 86400;
        todayE = 0;
        loadAds();
      }
      
      if ($('#countdownTime')) {
        $('#countdownTime').textContent = formatTime(countdownSec);
      }
      
      // Update progress ring
      const progress = $('#countdownProgress');
      if (progress) {
        const offset = 339.29 * (1 - countdownSec / 86400);
        progress.style.strokeDashoffset = offset.toFixed(2);
      }
    }
  }, 1000);
};

// ══════ Live Feed ═════
const startLiveFeed = () => {  addFeedItem();
  setInterval(addFeedItem, 4000);
};

const addFeedItem = () => {
  const feed = $('#liveFeed');
  if (!feed) return;
  
  const items = [
    { user: '88017***', value: '$5.40', type: 'wd' },
    { user: '88019***', value: 'P3', type: 'up' },
    { user: '88023***', value: '$0.80', type: 'earn' },
    { user: '88031***', value: '$180', type: 'dep' }
  ];
  
  const item = items[Math.floor(Math.random() * items.length)];
  const dotClass = { wd: 'wd', up: 'up', dep: 'dep', earn: 'earn' }[item.type];
  
  const el = createElement('div', 'feed-item');
  el.innerHTML = `
    <div class="feed-dot ${dotClass}"></div>
    <span class="feed-user truncate">${item.user} ${item.type === 'wd' ? 'উত্তোলন' : item.type === 'up' ? 'আপগ্রেড' : item.type === 'dep' ? 'জমা' : 'আয়'} <span class="feed-amount text-${dotClass === 'earn' ? 'em' : dotClass === 'wd' ? 'wr' : dotClass === 'up' ? 'if' : 'pp'}">${item.value}</span></span>
    <span class="feed-time">${getCurrentTime()}</span>
  `;
  
  feed.insertBefore(el, feed.firstChild);
  if (feed.children.length > 6) feed.removeChild(feed.lastChild);
};

// ══════ Ads System ═════
const loadAds = () => {
  if (curPlanIdx < 0) {
    dailyAds = [];
    renderAds();
    return;
  }
  
  const plan = PLANS[curPlanIdx];
  const shuffled = [...SAMPLE_ADS].sort(() => Math.random() - 0.5);
  
  dailyAds = shuffled.slice(0, plan.tasks).map((ad, i) => ({
    ...ad,
    idx: i,
    done: false,
    watched: false
  }));
  
  adWatching = {};
  renderAds();
};
const renderAds = () => {
  const list = $('#adsList');
  const empty = $('#adsEmpty');
  
  if (curPlanIdx < 0) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  
  const remaining = dailyAds.filter(a => !a.done);
  
  if (remaining.length === 0) {
    list.innerHTML = '';
    empty?.classList.remove('hidden');
    updateTaskCount();
    return;
  }
  
  empty?.classList.add('hidden');
  
  const plan = PLANS[curPlanIdx];
  const perTask = (plan.dailyEarning / plan.tasks).toFixed(3);
  
  list.innerHTML = remaining.map((ad, i) => `
    <div class="ad-card animate-fade-in" style="animation-delay: ${i * 50}ms" id="ad-${ad.idx}">
      <div class="ad-image-wrapper">
        <img src="images/placeholder-ad.jpg" class="ad-image" alt="${ad.brand}" loading="lazy">
        <div class="ad-overlay"></div>
        <span class="badge badge-em ad-badge"><i class="fas fa-star"></i> AD</span>
        <div class="ad-duration"><i class="fas fa-clock"></i> ${ad.duration}s</div>
        <div class="ad-info">
          <div>
            <p class="ad-brand">${ad.brand}</p>
            <p class="ad-category">${ad.category}</p>
          </div>
          <p class="ad-reward">+$${perTask}</p>
        </div>
      </div>
      <div class="ad-content">
        ${ad.watched ? 
          `<p class="ad-status"><span class="status-dot active"></span> দেখা সম্পন্ন — রেটিং দিন</p>` :
          `<div class="ad-progress"><div class="ad-progress-fill" id="wp-${ad.idx}" style="width:0%"></div></div>`
        }
        <div class="ad-footer">
          <div class="ad-status">
            <span class="status-dot ${ad.watched ? 'active' : ''}"></span>
            <span class="ad-duration-text">${ad.duration}s</span>
          </div>          <button class="btn-rate" onclick="event.stopPropagation(); openRating(${ad.idx})">
            রেট করুন
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  updateTaskCount();
};

// ══════ Rating Modal ═════
const openRating = (idx) => {
  const ad = dailyAds.find(a => a.idx === idx);
  if (!ad || ad.done) return;
  
  let stars = 0;
  
  openModal('rating');
  $('#modalBody').innerHTML = `
    <div class="text-center">
      <div class="w-14 h-14 rounded-2xl mx-auto mb-3 overflow-hidden border-2 border-em/30">
        <img src="images/placeholder-ad.jpg" class="w-full h-full object-cover" alt="${ad.brand}">
      </div>
      <h3 class="text-lg font-bold">${ad.brand}</h3>
      <p class="text-xs text-ts mb-4">${ad.category} · ${ad.duration}s</p>
      
      <div class="glass rounded-2xl p-4 mb-4">
        <div class="w-full rounded-xl bg-black/40 aspect-video mb-3 flex items-center justify-center relative overflow-hidden">
          <div class="absolute inset-0 animate-shine"></div>
          ${ad.watched ? 
            '<i class="fas fa-check-circle text-4xl text-em relative z-10"></i>' :
            '<i class="fas fa-play-circle text-4xl text-ts animate-pulse relative z-10"></i>'
          }
        </div>
        <div class="progress-bar mb-2">
          <div class="progress-fill" id="adProgModal" style="width: ${ad.watched ? 100 : 0}%"></div>
        </div>
        <div class="flex justify-between text-xs">
          <span id="adStatusText">${ad.watched ? '<span class="text-em font-bold">সম্পন্ন!</span>' : 'বিজ্ঞাপন দেখা হচ্ছে...'}</span>
          <span class="mono text-ts" id="adCountdown">${ad.watched ? '✓' : ad.duration + 's'}</span>
        </div>
      </div>
      
      <div id="ratingSection" class="${ad.watched ? '' : 'hidden'}">
        <p class="text-sm font-medium mb-3">এই বিজ্ঞাপনটি কেমন লাগলো?</p>
        <div class="star-rating mb-4" id="starContainer">
          ${[1,2,3,4,5].map(n => `<i class="fas fa-star star" data-val="${n}" onclick="setStar(${n})"></i>`).join('')}
        </div>
        <button class="btn-primary mb-2" onclick="submitRating(${idx})">রেটিং নিশ্চিত করুন</button>        <button class="btn-secondary" onclick="closeModal()">এড়িয়ে যান</button>
      </div>
    </div>
  `;
  
  if (!ad.watched) {
    watchAd(idx);
  }
};

const watchAd = (idx) => {
  const ad = dailyAds.find(a => a.idx === idx);
  if (!ad) return;
  
  let remaining = ad.duration;
  const interval = setInterval(() => {
    remaining--;
    
    const progress = $('#adProgModal');
    const countdown = $('#adCountdown');
    const status = $('#adStatusText');
    const wp = $(`#wp-${idx}`);
    
    if (!progress) { clearInterval(interval); return; }
    
    const pct = ((ad.duration - remaining) / ad.duration * 100);
    progress.style.width = pct + '%';
    if (wp) wp.style.width = pct + '%';
    
    if (remaining <= 0) {
      clearInterval(interval);
      ad.watched = true;
      adWatching[idx] = true;
      
      if (countdown) countdown.textContent = '✓';
      if (status) status.innerHTML = '<span class="text-em font-bold">সম্পন্ন!</span>';
      if (wp) wp.style.width = '100%';
      
      $('#ratingSection')?.classList.remove('hidden');
    } else {
      if (countdown) countdown.textContent = remaining + 's';
    }
  }, 1000);
};

const setStar = (val) => {
  $$('#starContainer .star').forEach(star => {
    const v = parseInt(star.dataset.val);
    star.classList.toggle('active', v <= val);
  });  window.currentRating = val;
};

const submitRating = (idx) => {
  if (!window.currentRating) {
    toastErr('রেটিং নির্বাচন করুন');
    $$('#starContainer .star')[0]?.parentElement?.classList.add('animate-shake');
    return;
  }
  
  const ad = dailyAds.find(a => a.idx === idx);
  if (!ad || !ad.watched) {
    toastErr('প্রথমে বিজ্ঞাপন দেখুন');
    return;
  }
  
  ad.done = true;
  closeModal();
  
  // Animate completion
  const card = $(`#ad-${idx}`);
  if (card) {
    flyCoins(card, 8);
    celebrate(card);
    setTimeout(() => {
      card.classList.add('done');
      setTimeout(() => {
        card.remove();
        renderAds();
      }, 300);
    }, 100);
  }
  
  // Update earnings
  const plan = PLANS[curPlanIdx];
  const earning = plan.dailyEarning / plan.tasks;
  
  todayE = parseFloat((todayE + earning).toFixed(4));
  cumE = parseFloat((cumE + earning).toFixed(4));
  
  syncBal();
  
  // Log transaction
  logs.push({
    type: 'earning',
    label: `রেটিং — ${ad.brand} (${window.currentRating}★)`,
    amount: '+' + formatCurrency(earning),
    time: getCurrentTime()
  });
    renderRecentActivity();
  toastOk(`+$${earning.toFixed(3)} USDT · ${window.currentRating}★`);
  
  delete window.currentRating;
};

// ══════ Plan System ═════
const loadPlans = () => {
  const container = $('#plansList');
  if (!container) return;
  
  container.innerHTML = PLANS.map((plan, i) => {
    const isCurrent = i === curPlanIdx;
    const isIntern = i === 0;
    const canBuy = curPlanIdx < 0 && (!isIntern || !internUsed);
    const canUpgrade = curPlanIdx >= 0 && i > curPlanIdx;
    const isClickable = canBuy || canUpgrade;
    const enoughBalance = balance >= plan.unlockAmount;
    const totalReturn = (plan.dailyEarning * plan.validity).toFixed(0);
    
    let cardClass = 'plan-card';
    if (isCurrent) cardClass += ' active';
    else if (!isClickable && curPlanIdx >= 0) cardClass += ' locked';
    else if (canUpgrade) cardClass += ' upgrade-ready';
    
    const diff = plan.unlockAmount - (PLANS[curPlanIdx]?.unlockAmount || 0);
    
    return `
      <div class="${cardClass}" ${isClickable ? `onclick="${canUpgrade ? `upgradePlan(${i})` : `buyPlan(${i})`}"` : ''}>
        <div class="plan-card-header">
          <div class="flex items-center gap-3">
            <div class="plan-card-icon" style="background: ${plan.colorHex}15; color: ${isIntern && internUsed ? 'var(--ts)' : plan.color}">
              <i class="fas ${isIntern && internUsed ? 'fa-ban' : plan.icon}"></i>
            </div>
            <div>
              <p class="plan-card-name" style="color: ${isIntern && internUsed ? 'var(--ts)' : plan.color}">
                ${plan.name[lang] || plan.name.en}
              </p>
              <p class="plan-card-desc">${plan.tasks} tasks · ${plan.validity}d · $${totalReturn}</p>
            </div>
          </div>
          <div class="plan-card-earnings">
            ${isIntern && internUsed ? 
              '<span class="badge badge-dn">Used</span>' :
              `<p class="plan-card-earnings-value" style="color: ${plan.color}">$${plan.dailyEarning}<span class="plan-card-earnings-unit">/day</span></p>`
            }
          </div>
        </div>
        
        ${!isIntern || !internUsed ? `          <div class="plan-card-progress">
            <div class="plan-card-progress-bar">
              <div class="plan-card-progress-fill" style="width: ${plan.unlockAmount > 0 ? Math.min(100, balance / plan.unlockAmount * 100) : 100}%; background: ${isClickable && enoughBalance ? plan.color : 'var(--bd2)'}"></div>
            </div>
          </div>
          <button class="plan-card-btn ${isClickable && enoughBalance ? (canUpgrade ? 'upgrade' : 'buy') : 'locked'}">
            ${isClickable ? 
              (canUpgrade ? `আপগ্রেড — $${diff.toFixed(2)}` : `কিনুন — $${plan.unlockAmount || 'Free'}`) :
              (curPlanIdx >= 0 ? 'পরিবর্তন সম্ভব নয়' : (i > 0 ? 'Locked' : 'Free'))
            }
          </button>
        ` : ''}
      </div>
    `;
  }).join('');
};

const buyPlan = (idx) => {
  if (curPlanIdx >= 0) { toastErr('পরিবর্তন সম্ভব নয়'); return; }
  
  const plan = PLANS[idx];
  if (plan.unlockAmount > 0 && balance < plan.unlockAmount) {
    toastErr('পর্যাপ্ত ব্যালেন্স নেই');
    return;
  }
  
  openModal('buyPlan');
  $('#modalBody').innerHTML = `
    <div class="text-center mb-4">
      <div class="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" 
           style="background: ${plan.colorHex}15; color: ${plan.color}; font-size: 20px">
        <i class="fas ${plan.icon}"></i>
      </div>
      <h3 class="text-lg font-bold">${plan.name[lang] || plan.name.en}</h3>
    </div>
    
    <div class="grid grid-cols-3 gap-2 mb-4">
      <div class="stat-box">
        <p class="stat-label">Tasks</p>
        <p class="stat-value mono">${plan.tasks}</p>
      </div>
      <div class="stat-box">
        <p class="stat-label">Earn/Day</p>
        <p class="stat-value text-em mono">$${plan.dailyEarning}</p>
      </div>
      <div class="stat-box">
        <p class="stat-label">Validity</p>
        <p class="stat-value mono">${plan.validity}d</p>
      </div>
    </div>    
    <div class="stat-box text-center mb-4">
      <p class="stat-label mb-1">মূল্য</p>
      <p class="text-2xl font-bold mono" style="color: ${plan.color}">
        ${plan.unlockAmount > 0 ? '$' + plan.unlockAmount.toFixed(2) + ' USDT' : 'FREE'}
      </p>
      <p class="text-xs text-ts mt-1">মোট রিটার্ন: <span class="text-em font-bold">$${(plan.dailyEarning * plan.validity).toFixed(0)}</span></p>
    </div>
    
    ${plan.unlockAmount > 0 ? `
      <div class="alert alert-danger mb-3">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        কেনা প্ল্যান পরিবর্তন করা যাবে না।
      </div>
      <div class="glass rounded-xl p-3 mb-4 flex justify-between">
        <span class="text-xs text-ts">আপনার ব্যালেন্স</span>
        <span class="text-sm font-bold mono text-em">$${balance.toFixed(2)}</span>
      </div>
    ` : ''}
    
    <button class="btn-primary" onclick="confirmBuy(${idx})">
      ${plan.unlockAmount > 0 ? 'কিনুন — $' + plan.unlockAmount.toFixed(2) : 'ফ্রি প্ল্যান সক্রিয় করুন'}
    </button>
  `;
};

const confirmBuy = async (idx) => {
  if (idx === 0 && internUsed) { toastErr('ইন্টার্নশিপ আগে নিয়েছেন'); return; }
  if (curPlanIdx >= 0) { toastErr('পরিবর্তন সম্ভব নয়'); return; }
  
  const plan = PLANS[idx];
  if (plan.unlockAmount > 0 && balance < plan.unlockAmount) {
    toastErr('পর্যাপ্ত ব্যালেন্স নেই');
    return;
  }
  
  closeModal();
  
  // Deduct balance
  if (plan.unlockAmount > 0) {
    balance -= plan.unlockAmount;
    totalInv += plan.unlockAmount;
    totalDep += plan.unlockAmount;
    
    await DB.incrementField(currentUser.uid, 'balance', -plan.unlockAmount);
    await DB.incrementField(currentUser.uid, 'totalInvested', plan.unlockAmount);
    await DB.incrementField(currentUser.uid, 'totalDeposited', plan.unlockAmount);
  }
  
  if (idx === 0) internUsed = true;  curPlanIdx = idx;
  
  todayE = 0;
  loadAds();
  updPlanUI();
  syncBal();
  
  // Log
  logs.push({
    type: 'plan',
    label: `${plan.name[lang] || plan.name.en} Active`,
    amount: plan.unlockAmount > 0 ? '-$' + plan.unlockAmount.toFixed(2) : 'Free',
    time: getCurrentTime()
  });
  
  renderRecentActivity();
  toastOk(`${plan.name[lang] || plan.name.en} সক্রিয়!`);
  setTimeout(() => toastOk(`${plan.tasks} টি বিজ্ঞাপন লোড হয়েছে`), 1000);
};

// Similar functions for upgradePlan, confirmUpgrade...

// ══════ Deposit/Withdraw ═════
const openDeposit = () => {
  openModal('deposit');
  $('#modalBody').innerHTML = `
    <h3 class="text-lg font-bold mb-1">তহবিল যোগ</h3>
    <p class="text-xs text-ts mb-4">Min: <span class="text-wr font-bold">$${APP.MIN_DEPOSIT} USDT</span> · Balance: <span class="text-em font-bold">$${balance.toFixed(2)}</span></p>
    
    <div class="space-y-3">
      <div class="pay-option selected" onclick="selectPayment(0)">
        <div class="pay-icon bg-em/10 text-em"><i class="fab fa-bitcoin"></i></div>
        <div>
          <p class="font-medium text-sm">USDT (TRC20)</p>
          <p class="text-xs text-ts">Fast · Low Fee</p>
        </div>
        <i class="fas fa-check-circle text-em"></i>
      </div>
      
      <div id="networkSelect">
        <p class="text-xs text-ts mb-2">নেটওয়ার্ক</p>
        <div class="flex gap-2">
          <button class="net-option selected" onclick="selectNetwork(0)">
            <p class="font-bold text-xs text-em">TRC20</p>
            <p class="text-xxs text-ts">Low Fee</p>
          </button>
          <button class="net-option" onclick="selectNetwork(1)">
            <p class="font-bold text-xs">ERC20</p>
            <p class="text-xxs text-ts">High Fee</p>
          </button>        </div>
      </div>
      
      <div>
        <label class="input-label">পরিমাণ (USDT)</label>
        <input type="number" class="input-field mono" id="depositAmount" 
               placeholder="Min $${APP.MIN_DEPOSIT}" min="${APP.MIN_DEPOSIT}" 
               oninput="updateDepositEstimate()">
      </div>
      
      <div id="depositEstimate" class="glass rounded-xl p-3 hidden">
        <p class="text-xs text-ts">প্রত্যাশিত ব্যালেন্স: <span class="mono font-bold" id="estBalance">$${balance.toFixed(2)}</span></p>
      </div>
      
      <div class="glass rounded-xl p-3">
        <div class="flex justify-between mb-2">
          <p class="text-xs text-ts">USDT Address (TRC20)</p>
          <button class="text-xs font-semibold text-em" onclick="copyAddress()">
            <i class="fas fa-copy mr-1"></i>Copy
          </button>
        </div>
        <p class="text-xs mono text-ts break-all">TXrk4bLZ8mN3gQj7pF9hWc2dE6vA1sY5uB</p>
        <p class="text-xxs mt-2 text-dn">
          <i class="fas fa-exclamation-triangle mr-1"></i>
          TRC20 only — ভুল নেটওয়ার্ক = তহবিল হারানো
        </p>
      </div>
      
      <button class="btn-primary" onclick="confirmDeposit()">জমা নিশ্চিত করুন</button>
    </div>
  `;
};

const confirmDeposit = () => {
  const amount = parseFloat($('#depositAmount')?.value);
  if (!amount || amount < APP.MIN_DEPOSIT) {
    toastErr(`ন্যূনতম $${APP.MIN_DEPOSIT}`);
    return;
  }
  
  closeModal();
  
  // Update balance
  balance += amount;
  totalDep += amount;
  
  // Sync Firestore
  DB.incrementField(currentUser.uid, 'balance', amount);
  DB.incrementField(currentUser.uid, 'totalDeposited', amount);
    // Log
  logs.push({
    type: 'deposit',
    label: 'Deposit',
    amount: '+$' + amount.toFixed(2),
    time: getCurrentTime()
  });
  
  syncBal();
  updPlanUI();
  renderRecentActivity();
  toastOk(`$${amount.toLocaleString()} জমা সফল`);
};

// Similar functions for openWithdraw, confirmWithdraw...

// ══════ Dashboard Load ═════
const loadDashboard = () => {
  initBanner();
  startCountdown();
  startLiveFeed();
  loadAds();
  updPlanUI();
  renderRecentActivity();
  updateGreeting();
};

const updateGreeting = () => {
  if ($('#greetingTime')) {
    $('#greetingTime').textContent = getCurrentGreeting();
  }
};

// ══════ Recent Activity ═════
const renderRecentActivity = () => {
  const container = $('#recentActivity');
  if (!container) return;
  
  const recent = logs.slice(-5).reverse();
  
  if (recent.length === 0) {
    container.innerHTML = '<p class="text-xs text-ts text-center py-4">কোনো রেকর্ড নেই</p>';
    return;
  }
  
  container.innerHTML = recent.map(log => {
    const colors = {
      earning: { bg: 'bg-em/10', text: 'text-em', icon: 'fa-check-circle' },
      withdraw: { bg: 'bg-wr/10', text: 'text-wr', icon: 'fa-arrow-up' },
      deposit: { bg: 'bg-if/10', text: 'text-if', icon: 'fa-arrow-down' },      plan: { bg: 'bg-pp/10', text: 'text-pp', icon: 'fa-crown' },
      bonus: { bg: 'bg-gd/10', text: 'text-gd', icon: 'fa-gift' }
    };
    const c = colors[log.type] || colors.earning;
    
    return `
      <div class="activity-item">
        <div class="activity-icon ${c.bg} ${c.text}">
          <i class="fas ${c.icon}"></i>
        </div>
        <div class="activity-info">
          <p class="activity-title">${log.label}</p>
          <p class="activity-time">${log.time}</p>
        </div>
        <span class="activity-amount ${c.text}">${log.amount}</span>
      </div>
    `;
  }).join('');
};

// ══════ Initialize App ═════
const initApp = () => {
  // Wait for auth to initialize
  if (typeof initAuth === 'function') {
    initAuth();
  }
  
  // Setup event listeners
  setupEventListeners();
};

const setupEventListeners = () => {
  // Close modals on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  
  // Handle banner swipe
  let touchStartX = 0, touchEndX = 0;
  
  $('#bannerTrack')?.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  
  $('#bannerTrack')?.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  }, { passive: true });
  
  const handleSwipe = () => {    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        currentSlide = Math.min(2, currentSlide + 1);
      } else {
        currentSlide = Math.max(0, currentSlide - 1);
      }
      updateBanner();
    }
  };
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Export functions if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    navigateTo, loadAds, renderAds, openRating,
    loadPlans, buyPlan, confirmBuy,
    openDeposit, confirmDeposit,
    loadDashboard, renderRecentActivity
  };
}