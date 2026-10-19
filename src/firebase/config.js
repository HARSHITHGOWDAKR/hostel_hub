// Firebase Client Configuration
// Supports direct connection to Google Cloud Firestore & Firebase Auth
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Default configuration template
export const defaultFirebaseConfig = {
  apiKey: "AIzaSyDemoProjectOnly-Antigravity001",
  authDomain: "hostel-delivery-demo.firebaseapp.com",
  projectId: "hostel-delivery-demo",
  storageBucket: "hostel-delivery-demo.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:abcdef1234567890"
};

let app = null;
let firestore = null;
let auth = null;

export function initFirebase(customConfig = null) {
  const config = customConfig || defaultFirebaseConfig;
  try {
    app = !getApps().length ? initializeApp(config) : getApp();
    firestore = getFirestore(app);
    auth = getAuth(app);
    return { app, firestore, auth, isConnected: true };
  } catch (error) {
    console.warn("Using offline reactive Firestore engine:", error.message);
    return { app: null, firestore: null, auth: null, isConnected: false };
  }
}

export { app, firestore, auth };
