/**
 * ═══════════════════════════════════════════════════════════
 * ADLY - Firestore Database Operations
 * ═══════════════════════════════════════════════════════════
 */

const DB = {
  // ══════ User Operations ═════
  
  // Create new user
  createUser: async (userData) => {
    try {
      const userRef = db.collection('users').doc(userData.uid);
      await userRef.set({
        ...userData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active'
      });
      return { success: true };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get user by UID
  getUser: async (uid) => {
    try {
      const doc = await db.collection('users').doc(uid).get();
      if (doc.exists) {
        return { success: true, data: { id: doc.id, ...doc.data() } };
      }
      return { success: false, error: 'User not found' };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Update user data
  updateUser: async (uid, updates) => {
    try {
      await db.collection('users').doc(uid).update({
        ...updates,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);      return { success: false, error: error.message };
    }
  },
  
  // Update numeric fields with increment
  incrementField: async (uid, field, amount) => {
    try {
      await db.collection('users').doc(uid).update({
        [field]: firebase.firestore.FieldValue.increment(amount)
      });
      return { success: true };
    } catch (error) {
      console.error('Increment error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // ══════ Transaction Operations ═════
  
  // Create transaction record
  createTransaction: async (txData) => {
    try {
      const txRef = await db.collection('transactions').add({
        ...txData,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: txRef.id };
    } catch (error) {
      console.error('Create transaction error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Get user transactions
  getUserTransactions: async (uid, limit = 20, type = null) => {
    try {
      let query = db.collection('transactions')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(limit);
      
      if (type) {
        query = query.where('type', '==', type);
      }
      
      const snapshot = await query.get();
      const transactions = [];
      snapshot.forEach(doc => {
        transactions.push({ id: doc.id, ...doc.data() });
      });      
      return { success: true, data: transactions };
    } catch (error) {
      console.error('Get transactions error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // ══════ Referral Operations ═════
  
  // Process referral
  processReferral: async (referrerCode, newUserId) => {
    try {
      // Find referrer
      const refQuery = await db.collection('users')
        .where('refCode', '==', referrerCode)
        .limit(1)
        .get();
      
      if (refQuery.empty) return { success: false, error: 'Invalid referral code' };
      
      const referrer = refQuery.docs[0];
      const referrerData = referrer.data();
      
      // Add to team (Level 1)
      await db.collection('users').doc(referrer.id).update({
        team: firebase.firestore.FieldValue.arrayUnion({
          uid: newUserId,
          level: 1,
          joinedAt: firebase.firestore.FieldValue.serverTimestamp()
        })
      });
      
      // Give commission (4% of referral bonus)
      const commission = APP.REFERRAL_BONUS * APP.COMMISSION_RATES.L1;
      
      await db.collection('users').doc(referrer.id).update({
        balance: firebase.firestore.FieldValue.increment(commission),
        referralEarnings: firebase.firestore.FieldValue.increment(commission)
      });
      
      // Create referral record
      await db.collection('referrals').add({
        referrerId: referrer.id,
        referredId: newUserId,
        level: 1,
        commission: commission,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
            return { success: true, commission };
    } catch (error) {
      console.error('Process referral error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // ══════ Withdrawal Operations ═════
  
  // Create withdrawal request
  createWithdrawal: async (wdData) => {
    try {
      const wdRef = await db.collection('withdrawals').add({
        ...wdData,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true, id: wdRef.id };
    } catch (error) {
      console.error('Create withdrawal error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // ══════ Real-time Listeners ═════
  
  // Listen to user data changes
  onUserChange: (uid, callback) => {
    return db.collection('users').doc(uid)
      .onSnapshot(doc => {
        if (doc.exists) {
          callback({ success: true, data: { id: doc.id, ...doc.data() } });
        }
      }, error => {
        console.error('Snapshot error:', error);
        callback({ success: false, error: error.message });
      });
  },
  
  // Listen to transactions
  onTransactions: (uid, callback, limit = 10) => {
    return db.collection('transactions')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .onSnapshot(snapshot => {
        const transactions = [];
        snapshot.forEach(doc => {
          transactions.push({ id: doc.id, ...doc.data() });
        });        callback({ success: true, data: transactions });
      }, error => {
        console.error('Transactions listener error:', error);
        callback({ success: false, error: error.message });
      });
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DB };
}