import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

import { 
  getDatabase, 
  ref, 
  set as rtdbSet, 
  get as rtdbGet, 
  onValue, 
  Database 
} from 'firebase/database';

export const defaultFirebaseConfig = {
  apiKey: "AIzaSyCFYIawcvcSu4aDbx919KeP220SB1jspqQ",
  authDomain: "kcet-app-c0457.firebaseapp.com",
  databaseURL: "https://kcet-app-c0457-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kcet-app-c0457",
  storageBucket: "kcet-app-c0457.firebasestorage.app",
  messagingSenderId: "335362153278",
  appId: "1:335362153278:web:0dc0e4cda017cb42466a6f",
  measurementId: "G-VWS8NY9XKD"
};

// Retrieve custom or saved config if present in localStorage
export function getStoredFirebaseConfig() {
  try {
    const saved = localStorage.getItem('kcet_admin_firebase_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Error reading saved firebase config', e);
  }
  return defaultFirebaseConfig;
}

const activeConfig = getStoredFirebaseConfig();

export const app = !getApps().length ? initializeApp(activeConfig) : getApp();
export const db: Firestore = getFirestore(app);
export const rtdb: Database = getDatabase(app);
export const auth: Auth = getAuth(app);

export const ADMIN_IDENTIFIER = 'ullassuvarna65@gmail.com';

export {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  ref,
  rtdbSet,
  rtdbGet,
  onValue
};
export type { FirebaseUser };

