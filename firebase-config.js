// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBpdPkp-85uXWklJq00vAy38lx-JTbrjC0",
  authDomain: "ga100-adsensebook.firebaseapp.com",
  projectId: "ga100-adsensebook",
  storageBucket: "ga100-adsensebook.firebasestorage.app",
  messagingSenderId: "877122761362",
  appId: "1:877122761362:web:6c20e1eea8e859318aec4b",
  measurementId: "G-M2PFPFVTNG"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

window.auth = auth;
window.db = db;

export { auth, db, storage };
    async addPaymentRequest(request) {
        await addDoc(collection(db, "payments"), request);
    },
    async getPaymentRequests() {
        const snapshot = await getDocs(collection(db, "payments"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async deletePaymentRequest(docId) {
        await deleteDoc(doc(db, "payments", docId));
    },
    
    // 강의 관리
    async getCourses() {
        const snapshot = await getDocs(collection(db, "courses"));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async saveCourse(course) {
        if (course.docId) {
            await updateDoc(doc(db, "courses", course.docId), course);
        } else {
            await addDoc(collection(db, "courses"), course);
        }
    }
};
