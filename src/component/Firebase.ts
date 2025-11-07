// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRUi14Ra1emKbcWAO7NBDlagnv81o-tog",
  authDomain: "konnekt-cbe73.firebaseapp.com",
  projectId: "konnekt-cbe73",
  storageBucket: "konnekt-cbe73.firebasestorage.app",
  messagingSenderId: "99876262987",
  appId: "1:99876262987:web:e4eaf4b249d5dad47ca9ce",
  measurementId: "G-WKMEP7SX03"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);