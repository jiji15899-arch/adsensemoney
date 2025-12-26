// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpdPkp-85uXWklJq00vAy38lx-JTbrjC0",
  authDomain: "ga100-adsensebook.firebaseapp.com",
  projectId: "ga100-adsensebook",
  storageBucket: "ga100-adsensebook.firebasestorage.app",
  messagingSenderId: "877122761362",
  appId: "1:877122761362:web:6c20e1eea8e859318aec4b",
  measurementId: "G-M2PFPFVTNG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// 전역에서 사용할 수 있도록 window 객체에 할당
window.db = db;
window.auth = auth;

export { app, auth, db, analytics };
