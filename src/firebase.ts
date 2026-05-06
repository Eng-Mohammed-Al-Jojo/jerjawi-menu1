/*----*/

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1jzjqaRgcD8BC0cVeKGdBTvt_SfYDoWk",
  authDomain: "jerjawi-menu.firebaseapp.com",
  databaseURL: "https://jerjawi-menu-default-rtdb.firebaseio.com",
  projectId: "jerjawi-menu",
  storageBucket: "jerjawi-menu.firebasestorage.app",
  messagingSenderId: "844831476318",
  appId: "1:844831476318:web:0f35cfb16f1c0b073182cf"
};
const app = initializeApp(firebaseConfig);

// 👇 هذا هو المهم
export const db = getDatabase(app);
export const auth = getAuth(app);
