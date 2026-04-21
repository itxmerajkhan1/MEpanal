import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database'; // Realtime Database ke liye add kiya
import firebaseConfig from '../firebase-applet-config.json';

// Configuration mein Realtime Database ka URL add kar rahe hain
const finalConfig = {
  ...firebaseConfig,
  databaseURL: "https://gen-lang-client-0408666554-default-rtdb.firebaseio.com/"
};

const app = initializeApp(finalConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const rtdb = getDatabase(app); // Isay "rtdb" ka naam diya hai taake Realtime Database use ho sakay

export default app;