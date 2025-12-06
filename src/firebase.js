import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB1NM66G9bIRqCMxvxa8oyMXlx89q6HVwY",
  authDomain: "apps-7a6f3.firebaseapp.com",
  databaseURL: "https://apps-7a6f3-default-rtdb.firebaseio.com",
  projectId: "apps-7a6f3",
  storageBucket: "apps-7a6f3.firebasestorage.app",
  messagingSenderId: "521065393456",
  appId: "1:521065393456:web:7af17043ea631ee1e4acf5",
  measurementId: "G-E40GBR4S7J"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
