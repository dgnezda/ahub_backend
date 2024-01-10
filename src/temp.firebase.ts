// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSVWFHIDTgsqb2S-af_xGPdfTwNNXkg8g",
  authDomain: "ahub-app.firebaseapp.com",
  projectId: "ahub-app",
  storageBucket: "ahub-app.appspot.com",
  messagingSenderId: "703024470612",
  appId: "1:703024470612:web:6a6f6da690946e71a4ebc1",
  measurementId: "G-3SQH0MKJL3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);