// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAx7pzifb9CtbuBnqaBOD503gXWiHiFjKg",
  authDomain: "portafolio-22f94.firebaseapp.com",
  projectId: "portafolio-22f94",
  storageBucket: "portafolio-22f94.firebasestorage.app",
  messagingSenderId: "785993207972",
  appId: "1:785993207972:web:1445c15e91dc453c459631",
  measurementId: "G-0EZTSSELDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);