/**
 * Setup Developer User Script
 * Run this once to create the developer account in Firebase
 * 
 * Usage: node scripts/setupDeveloperUser.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Firebase configuration (same as your app)
const firebaseConfig = {
  apiKey: "AIzaSyBHmRuIjx-3UtJk1RX2UO0RpuC0Log8N68",
  authDomain: "hris-2ea69.firebaseapp.com",
  projectId: "hris-2ea69",
  storageBucket: "hris-2ea69.firebasestorage.app",
  messagingSenderId: "947276784090",
  appId: "1:947276784090:web:c58296c9aab4d2d629a0e3",
  measurementId: "G-F73DTHK2TB"
};

// Developer credentials
const DEVELOPER_EMAIL = 'clarenceflores082001@gmail.com';
const DEVELOPER_PASSWORD = 'Garfield_1.1';
const DEVELOPER_NAME = 'Clarence Flores';

async function setupDeveloperUser() {
  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('Creating developer user...');

    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      DEVELOPER_EMAIL,
      DEVELOPER_PASSWORD
    );

    const user = userCredential.user;
    console.log('User created with UID:', user.uid);

    // Update the user profile
    await updateProfile(user, {
      displayName: DEVELOPER_NAME
    });
    console.log('Profile updated');

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: DEVELOPER_EMAIL,
      displayName: DEVELOPER_NAME,
      role: 'developer',
      permissions: ['*'], // All permissions
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      canAddAdmins: true,
      metadata: {
        isDeveloper: true,
        description: 'System developer account with full access'
      }
    });
    console.log('Firestore user document created');

    console.log('\n✅ Developer user setup complete!');
    console.log('Email:', DEVELOPER_EMAIL);
    console.log('Role: Developer (Full Access)');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n⚠️  User already exists! The developer account is already set up.');
      console.log('Email:', DEVELOPER_EMAIL);
      process.exit(0);
    } else {
      console.error('\n❌ Error setting up developer user:', error.message);
      process.exit(1);
    }
  }
}

setupDeveloperUser();
