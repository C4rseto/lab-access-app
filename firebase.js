// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5M8oPVouF3PYyqE15WW5unDjeo3wLgxI",
  authDomain: "labacces-1b14d.firebaseapp.com",
  databaseURL: "https://labacces-1b14d-default-rtdb.firebaseio.com",
  projectId: "labacces-1b14d",
  storageBucket: "labacces-1b14d.firebasestorage.app",
  messagingSenderId: "270093974855",
  appId: "1:270093974855:web:6c554a5f34a68d40f96062",
  measurementId: "G-TGQ1D05CHS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);