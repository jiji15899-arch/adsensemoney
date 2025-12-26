// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, addDoc, serverTimestamp, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

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
const storage = getStorage(app);

// Initialize default admin account
async function initializeAdmin() {
  try {
    const adminDoc = await getDoc(doc(db, 'users', 'ga100admin'));
    if (!adminDoc.exists()) {
      // Create admin user in Auth
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, 'ga100admin@ga100.com', 'adminpower100');
        
        // Create admin profile in Firestore
        await setDoc(doc(db, 'users', 'ga100admin'), {
          uid: userCredential.user.uid,
          nickname: 'ga100admin',
          email: 'ga100admin@ga100.com',
          role: 'admin',
          points: 999999,
          secretQuestions: 999,
          courses: [],
          createdAt: serverTimestamp()
        });
      } catch (error) {
        // Admin might already exist in Auth
        console.log('Admin account setup:', error.message);
      }
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
}

// Call initialization
initializeAdmin();

// Helper Functions
window.firebaseAuth = {
  // Sign up
  signUp: async (nickname, password) => {
    try {
      // Check if nickname exists
      const usersRef = collection(db, 'users');
      const nicknameQuery = query(usersRef, where('nickname', '==', nickname));
      const nicknameSnapshot = await getDocs(nicknameQuery);
      
      if (!nicknameSnapshot.empty) {
        throw new Error('이미 사용 중인 닉네임입니다.');
      }

      // Create email from nickname
      const email = `${nickname}@ga100user.com`;
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile
      await setDoc(doc(db, 'users', nickname), {
        uid: userCredential.user.uid,
        nickname: nickname,
        email: email,
        role: 'user',
        points: 0,
        secretQuestions: 0,
        courses: [],
        suspended: false,
        blacklisted: false,
        createdAt: serverTimestamp()
      });

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Sign in
  signIn: async (nickname, password) => {
    try {
      const email = nickname === 'ga100admin' ? 'ga100admin@ga100.com' : `${nickname}@ga100user.com`;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', nickname));
      if (!userDoc.exists()) {
        throw new Error('사용자 정보를 찾을 수 없습니다.');
      }

      const userData = userDoc.data();

      // Check if suspended
      if (userData.suspended && userData.suspendedUntil) {
        const suspendedUntil = new Date(userData.suspendedUntil);
        if (suspendedUntil > new Date()) {
          throw new Error('계정이 일시 정지되었습니다.');
        } else {
          // Remove suspension
          await updateDoc(doc(db, 'users', nickname), {
            suspended: false,
            suspendedUntil: null
          });
        }
      }

      // Check blacklist
      if (userData.blacklisted) {
        throw new Error('블랙리스트에 등재된 계정입니다.');
      }

      return { success: true, user: userCredential.user, userData };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Auth state observer
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  }
};

// Database Functions
window.firebaseDB = {
  // Users
  getUser: async (nickname) => {
    const userDoc = await getDoc(doc(db, 'users', nickname));
    return userDoc.exists() ? userDoc.data() : null;
  },

  getAllUsers: async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  updateUser: async (nickname, data) => {
    await updateDoc(doc(db, 'users', nickname), data);
  },

  // Courses
  getCourses: async () => {
    const coursesSnapshot = await getDocs(collection(db, 'courses'));
    return coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getCourse: async (courseId) => {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    return courseDoc.exists() ? { id: courseDoc.id, ...courseDoc.data() } : null;
  },

  addCourse: async (courseData) => {
    const docRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  updateCourse: async (courseId, data) => {
    await updateDoc(doc(db, 'courses', courseId), data);
  },

  deleteCourse: async (courseId) => {
    await deleteDoc(doc(db, 'courses', courseId));
  },

  // Posts
  getPosts: async (type = null) => {
    let postsQuery = collection(db, 'posts');
    if (type) {
      postsQuery = query(postsQuery, where('type', '==', type), orderBy('createdAt', 'desc'));
    } else {
      postsQuery = query(postsQuery, orderBy('createdAt', 'desc'));
    }
    const postsSnapshot = await getDocs(postsQuery);
    return postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  addPost: async (postData) => {
    const docRef = await addDoc(collection(db, 'posts'), {
      ...postData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  getPost: async (postId) => {
    const postDoc = await getDoc(doc(db, 'posts', postId));
    return postDoc.exists() ? { id: postDoc.id, ...postDoc.data() } : null;
  },

  updatePost: async (postId, data) => {
    await updateDoc(doc(db, 'posts', postId), data);
  },

  // Comments
  addComment: async (postId, commentData) => {
    const post = await firebaseDB.getPost(postId);
    const comments = post.comments || [];
    comments.push({
      ...commentData,
      createdAt: new Date().toISOString()
    });
    await updateDoc(doc(db, 'posts', postId), { comments });
  },

  // Reviews
  addReview: async (reviewData) => {
    await addDoc(collection(db, 'reviews'), {
      ...reviewData,
      createdAt: serverTimestamp()
    });
  },

  getReviews: async (courseId) => {
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('courseId', '==', courseId),
      orderBy('createdAt', 'desc')
    );
    const reviewsSnapshot = await getDocs(reviewsQuery);
    return reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Revenue posts
  addRevenue: async (revenueData) => {
    await addDoc(collection(db, 'revenues'), {
      ...revenueData,
      createdAt: serverTimestamp()
    });
  },

  getRevenues: async () => {
    const revenuesQuery = query(collection(db, 'revenues'), orderBy('createdAt', 'desc'));
    const revenuesSnapshot = await getDocs(revenuesQuery);
    return revenuesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Sales tracking
  addSale: async (saleData) => {
    await addDoc(collection(db, 'sales'), {
      ...saleData,
      createdAt: serverTimestamp()
    });
  },

  getSales: async (startDate = null, endDate = null) => {
    let salesQuery = collection(db, 'sales');
    if (startDate && endDate) {
      salesQuery = query(
        salesQuery,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
    } else {
      salesQuery = query(salesQuery, orderBy('createdAt', 'desc'));
    }
    const salesSnapshot = await getDocs(salesQuery);
    return salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get today's sales
  getTodaySales: async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const salesQuery = query(
      collection(db, 'sales'),
      where('createdAt', '>=', today),
      where('createdAt', '<', tomorrow)
    );
    const salesSnapshot = await getDocs(salesQuery);
    return salesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export { auth, db, storage };
