// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { AuthRequest, ResponseType, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleClientIds = {
    expo: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  };

  const isGoogleConfigured = Object.values(googleClientIds).some(Boolean);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error obteniendo datos de usuario:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: fullName });
      
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        fullName,
        email,
        createdAt: new Date().toISOString(),
        orders: []
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const signIn = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: getErrorMessage(error.code) };
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    }
  };

  const saveOrder = async (order) => {
    if (!user) return { success: false, error: 'No hay usuario autenticado' };
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const currentOrders = userDoc.exists() ? userDoc.data().orders || [] : [];
      
      await setDoc(doc(db, 'users', user.uid), {
        orders: [...currentOrders, { ...order, createdAt: new Date().toISOString() }]
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error guardando pedido:', error);
      return { success: false, error: error.message };
    }
  };

  const getGoogleClientIdForPlatform = () => {
    if (Platform.OS === 'android') {
      return googleClientIds.android || googleClientIds.expo || googleClientIds.web;
    }
    if (Platform.OS === 'ios') {
      return googleClientIds.ios || googleClientIds.expo || googleClientIds.web;
    }
    return googleClientIds.web || googleClientIds.expo;
  };

  const signInWithGoogle = async () => {
    if (!isGoogleConfigured) {
      return { success: false, error: 'GOOGLE_CONFIG_MISSING' };
    }

    const clientId = getGoogleClientIdForPlatform();
    if (!clientId) {
      return { success: false, error: 'GOOGLE_CLIENT_ID_MISSING' };
    }

    try {
      setGoogleLoading(true);
      const redirectUri = makeRedirectUri({
        scheme: 'shopfolio',
        useProxy: Platform.OS !== 'web',
      });
      const request = new AuthRequest({
        clientId,
        responseType: ResponseType.IdToken,
        scopes: ['openid', 'profile', 'email'],
        extraParams: { prompt: 'select_account' },
        redirectUri,
      });
      const discovery = { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' };
      const result = await request.promptAsync(discovery, {
        useProxy: Platform.OS !== 'web',
      });

      if (result.type !== 'success') {
        return { success: false, error: result.type };
      }

      const idToken = result.params?.id_token;
      if (!idToken) {
        throw new Error('No se recibió id_token de Google');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;

      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          fullName: firebaseUser.displayName || '',
          email: firebaseUser.email,
          avatar: firebaseUser.photoURL || null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return { success: true };
    } catch (error) {
      console.error('Error en login con Google:', error);
      return { success: false, error: error.message };
    } finally {
      setGoogleLoading(false);
    }
  };

  const value = {
    user,
    userData,
    loading,
    signUp,
    signIn,
    logOut,
    saveOrder,
    isAuthenticated: !!user,
    signInWithGoogle,
    googleAuthLoading: googleLoading,
    isGoogleConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

const getErrorMessage = (code) => {
  const messages = {
    'auth/email-already-in-use': 'Este email ya está registrado',
    'auth/invalid-email': 'Email inválido',
    'auth/weak-password': 'Contraseña muy débil (mínimo 6 caracteres)',
    'auth/user-not-found': 'Usuario no encontrado',
    'auth/wrong-password': 'Contraseña incorrecta',
    'auth/invalid-credential': 'Email o contraseña incorrectos',
  };
  return messages[code] || 'Error de autenticación';
};