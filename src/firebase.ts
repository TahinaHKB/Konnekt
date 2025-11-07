// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔑 Ta configuration Firebase (depuis la console Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDRUi14Ra1emKbcWAO7NBDlagnv81o-tog",
  authDomain: "konnekt-cbe73.firebaseapp.com",
  projectId: "konnekt-cbe73",
  storageBucket: "konnekt-cbe73.firebasestorage.app",
  messagingSenderId: "99876262987",
  appId: "1:99876262987:web:e4eaf4b249d5dad47ca9ce",
  measurementId: "G-WKMEP7SX03"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services que tu vas utiliser
export const auth = getAuth(app);      // Authentification
export const db = getFirestore(app);   // Base de données Firestore
export const storage = getStorage(app); // Stockage des images
