// App.js
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { useCart } from './src/context/CartContext';

export default function App() {
  const { initializeCart } = useCart();
  
  // Cargar carrito guardado al iniciar
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);
  
  return (
    <>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </>
  );
}