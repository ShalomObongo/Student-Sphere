// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCl_hzOFsNxrZgg7aonYsNdvSBkJQ_pjYQ",
  authDomain: "studentsphere-1fb98.firebaseapp.com",
  projectId: "studentsphere-1fb98",
  storageBucket: "studentsphere-1fb98.appspot.com",
  messagingSenderId: "138270145629",
  appId: "1:138270145629:web:d8c3d6becad02f23d8a1b4",
  measurementId: "G-FS01ZT7Q5V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

const storage = getStorage(app);

export { db, auth, storage };
