// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBwRDut21CNxly-WcSyxe7hG4CQjT3r_Wo",
  authDomain: "gasup365.firebaseapp.com",
  projectId: "gasup365",
  storageBucket: "gasup365.firebasestorage.app",
  messagingSenderId: "813417593461",
  appId: "1:813417593461:web:770f0e3982597d812b963c",
  measurementId: "G-HWNH32P5X0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);