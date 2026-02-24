// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  // measurementId NO es necesario a menos que uses Analytics
};

const missingEntries = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingEntries.length > 0) {
  throw new Error(
    `Firebase config incompleta. Revisa las variables: ${missingEntries.join(', ')}`
  );
}

// Inicializar Firebase (evita reinicialización en Fast Refresh)
const apps = getApps();
const app = apps.length ? getApp() : initializeApp(firebaseConfig);

// Configurar Auth con persistencia usando AsyncStorage
const auth = apps.length
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

// Exportar servicios
export { auth };
export const db = getFirestore(app);

export default app;