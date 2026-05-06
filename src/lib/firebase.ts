import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCBTpOb6fC3ijbDtf_2YexkQFSCFwSaWoY",
  authDomain: "lonitz-210c9.firebaseapp.com",
  databaseURL: "https://lonitz-210c9-default-rtdb.firebaseio.com",
  projectId: "lonitz-210c9",
  storageBucket: "lonitz-210c9.firebasestorage.app",
  messagingSenderId: "1002316610354",
  appId: "1:1002316610354:web:7be02ff66e95bd8fcfb52b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
