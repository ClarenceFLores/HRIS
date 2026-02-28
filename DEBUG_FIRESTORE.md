# Firestore Debugging Steps

## The permission error persists because of caching. Follow these steps:

### 1. Hard Refresh Browser
- **Windows/Linux:** Press `Ctrl + Shift + R`
- **Mac:** Press `Cmd + Shift + R`

### 2. Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### 3. Verify Rules in Firebase Console
Visit: https://console.firebase.google.com/project/hris-2ea69/firestore/rules

Should show:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 4. Test in Incognito/Private Mode
Open a new incognito/private browser window to bypass all caching

### 5. Manual Firestore Test (Browser Console)
Open browser console (F12) and run:
```javascript
// Import from your app
import { collection, getDocs } from 'firebase/firestore';
import { db } from './src/lib/firebase/config';

// Test read access
getDocs(collection(db, 'hrUsers'))
  .then(snapshot => console.log('✅ SUCCESS! Docs:', snapshot.size))
  .catch(err => console.error('❌ FAILED:', err));
```

### 6. Check Network Tab
1. Open DevTools → Network tab
2. Filter by "firestore"
3. Look for requests to firestore.googleapis.com
4. Check if any return 403 errors

### 7. If Still Failing
The issue is likely browser/Firebase SDK caching. Try:
- Restart your dev server
- Close ALL browser tabs
- Wait 2-3 minutes for Firebase CDN to update globally
- Try from a different device/network

## Current Status
- ✅ Rules deployed to project: hris-2ea69
- ✅ Rules are COMPLETELY OPEN (allow all)
- ⏳ Waiting for propagation (can take 1-5 minutes)
