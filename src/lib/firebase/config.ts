/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
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

// Log Firebase initialization
console.log('🔥 Firebase initialized:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});
