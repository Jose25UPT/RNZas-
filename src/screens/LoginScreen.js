// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim() || (!isLogin && !fullName.trim())) {
      Alert.alert('⚠️ Campos requeridos', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    const result = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password, fullName);

    setLoading(false);

    if (result.success) {
      Alert.alert(
        '✅ ' + (isLogin ? 'Bienvenido' : 'Registro exitoso'),
        isLogin ? 'Has iniciado sesión correctamente' : 'Tu cuenta ha sido creada',
        [{ text: 'Continuar', onPress: () => navigation.replace('Tienda') }]
      );
    } else {
      Alert.alert('❌ Error', result.error || 'Ocurrió un error inesperado');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="bag-handle" size={80} color="#007AFF" />
          <Text style={styles.logoText}>🛍️ ShopFolio</Text>
          <Text style={styles.logoSubtitle}>Tu tienda online favorita</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
              />
            </>
          )}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Botón Submit */}
          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cambiar entre Login/Registro */}
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón continuar como invitado */}
        <TouchableOpacity 
          style={styles.guestButton}
          onPress={() => navigation.replace('Tienda')}
        >
          <Text style={styles.guestButtonText}>Continuar como Invitado</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#000', marginTop: 10 },
  logoSubtitle: { fontSize: 16, color: '#666', marginTop: 5 },
  form: { backgroundColor: '#fff', borderRadius: 16, padding: 25, elevation: 3 },
  label: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8, marginTop: 16 },
  input: { 
    backgroundColor: '#f5f5f5', 
    borderRadius: 10, 
    padding: 14, 
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#eee'
  },
  button: { 
    backgroundColor: '#007AFF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 25 
  },
  buttonDisabled: { backgroundColor: '#999' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchButton: { alignItems: 'center', marginTop: 20 },
  switchText: { color: '#007AFF', fontSize: 14 },
  guestButton: { 
    backgroundColor: 'transparent', 
    padding: 16, 
    alignItems: 'center', 
    marginTop: 10 
  },
  guestButtonText: { color: '#666', fontSize: 14 },
});