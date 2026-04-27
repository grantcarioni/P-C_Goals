// ─────────────────────────────────────────────────────────────
//  Firebase Realtime Database — P&C Goals Dashboard
//  Shared state store for all NI staff
// ─────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace these placeholder values with your Firebase project config.
// Steps:
//   1. Go to https://console.firebase.google.com
//   2. Create a project (e.g. "ni-pc-goals")
//   3. Build → Realtime Database → Create database → Start in test mode
//   4. Project Settings → Your apps → Add web app → copy the config below
const firebaseConfig = {
  apiKey:            "AIzaSyBaMW-O4eRuBqSHFi7S04PRGgvT9LPNbvA",
  authDomain:        "ni-pc-goals.firebaseapp.com",
  databaseURL:       "https://ni-pc-goals-default-rtdb.firebaseio.com",
  projectId:         "ni-pc-goals",
  storageBucket:     "ni-pc-goals.firebasestorage.app",
  messagingSenderId: "820911121895",
  appId:             "1:820911121895:web:6240339370055d56018942",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// Database path — change only if you want multiple isolated environments
export const DB_PATH = "ni-pc-goals-v1";
