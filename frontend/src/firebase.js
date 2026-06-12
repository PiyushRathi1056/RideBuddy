// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjutCoOIGeE48XT6TLE037lL31snSupXA",
  authDomain: "ridebuddy-30b07.firebaseapp.com",
  projectId: "ridebuddy-30b07",
  storageBucket: "ridebuddy-30b07.firebasestorage.app",
  messagingSenderId: "629906778367",
  appId: "1:629906778367:web:8faf19aad0b7aead8184ca",
  measurementId: "G-LDQ7S4LZSP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
