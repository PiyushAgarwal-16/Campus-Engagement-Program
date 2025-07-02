// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkFiv9paZF7-D1erlN8wjHhNbzZg9YSM8",
  authDomain: "campusconnect-dbb08.firebaseapp.com",
  projectId: "campusconnect-dbb08",
  storageBucket: "campusconnect-dbb08.firebasestorage.app",
  messagingSenderId: "183998920886",
  appId: "1:183998920886:web:9e81c9f44c04f8daad8e17",
  measurementId: "G-X98EX8YEJ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
