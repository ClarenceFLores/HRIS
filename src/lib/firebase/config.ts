/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBHmRuIjx-3UtJk1RX2UO0RpuC0Log8N68",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hris-2ea69.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://hris-2ea69-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hris-2ea69",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hris-2ea69.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "947276784090",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:947276784090:web:c58296c9aab4d2d629a0e3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-F73DTHK2TB"
};

// Initialize Firebase (prevent duplicate initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ── Firebase App Check ────────────────────────────────────────────────────────
// Official pattern: https://firebase.google.com/docs/app-check/web/debug-provider
//
// Setting self.FIREBASE_APPCHECK_DEBUG_TOKEN to a token string tells the
// Firebase SDK to use its built-in debug provider and bypass reCAPTCHA.
// This MUST be set before initializeAppCheck() is called.
//
// Registered debug tokens for hris-2ea69 (Firebase Console → App Check → Debug tokens):
//   • Firestore : 8FE82E47-D0A6-42F5-9876-EA9AE6C0A349
//   • Storage   : 3E36724D-22F7-402F-B592-926A15874197
//
// Warning: Never use debug tokens in production builds.
if (import.meta.env.DEV) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
    import.meta.env.VITE_APPCHECK_DEBUG_TOKEN ?? '3E36724D-22F7-402F-B592-926A15874197';
}

// In production VITE_RECAPTCHA_SITE_KEY must be set.
// In development the debug token above bypasses reCAPTCHA entirely, so the
// site key is only needed for the provider constructor — a placeholder is used
// when the env var is absent so the app still initialises without errors.
const reCaptchaSiteKey =
  import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? 'dev-placeholder-replaced-by-debug-token';

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(reCaptchaSiteKey),
  isTokenAutoRefreshEnabled: true,
});
// ─────────────────────────────────────────────────────────────────────────────

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);        // Cloud Firestore
export const rtdb = getDatabase(app);       // Realtime Database
export const storage = getStorage(app);

// Initialize Analytics (only in browser environment)
export const initializeAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export { app, firebaseConfig };
