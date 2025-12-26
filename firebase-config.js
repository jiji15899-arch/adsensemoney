// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, addDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ 1단계에서 복사한 본인의 설정 코드로 덮어씌우세요!
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
const db = getFirestore(app);

// 초보자를 위한 "데이터베이스 도우미" 함수들 (이걸 가져다 쓰면 됩니다)
export const DB = {
    // 회원가입/로그인 관련
    async getUser(nickname) {
        const q = query(collection(db, "users"), where("nickname", "==", nickname));
        const snapshot = await getDocs(q);
        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    },
    async createUser(userData) {
        // 비밀번호가 그대로 보이면 안되지만, 초보자용이므로 일단 저장 (나중에 보안 강화 필요)
        await addDoc(collection(db, "users"), userData);
    },
    async updateUser(docId, data) {
        await updateDoc(doc(db, "users", docId), data);
    },

    // 결제 요청 관련
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
