/* ============================================================
   VKREATE Architecture — Firebase Configuration & Initialization
   ============================================================ */

// Replace these placeholders with your actual Firebase project credentials
// from Firebase Console: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "vkreate-architecture.firebaseapp.com",
  projectId: "vkreate-architecture",
  storageBucket: "vkreate-architecture.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

const FirebaseDB = {
  initialized: false,
  db: null,
  storage: null,

  init() {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.initialized = true;
        console.log("⚡ VKREATE Firebase initialized successfully.");
      } catch (e) {
        console.warn("⚠️ Firebase initialization warning:", e);
      }
    } else {
      console.log("ℹ️ Firebase running in Fallback/Demo mode (Config placeholders active).");
    }
  }
};

// Auto-initialize on load
if (typeof firebase !== 'undefined') {
  FirebaseDB.init();
}
