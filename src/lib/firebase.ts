/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCBTpOb6fC3ijbDtf_2YexkQFSCFwSaWoY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "lonitz-210c9.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://lonitz-210c9-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "lonitz-210c9",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "lonitz-210c9.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1002316610354",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1002316610354:web:7be02ff66e95bd8fcfb52b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
