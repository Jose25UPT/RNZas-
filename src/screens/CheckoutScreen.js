// src/screens/CheckoutScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, ActivityIndicator, Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useCart } from '../context/CartContext';
import { createCheckoutSession, isStripeBackendConfigured } from '../services/stripe';

export default function CheckoutScreen({ route, navigation }) {
  const { cart, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  
  // Datos del formulario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const total = getTotal();
  const shipping = total > 50 ? 0 : 5.99;
  const finalTotal = total + shipping;

  const handleConfirmOrder = async () => {
    // Validaciones de envío
    if (!fullName.trim() || !email.trim() || !address.trim() || !city.trim()) {
      Alert.alert('⚠️ Campos requeridos', 'Por favor completa todos los campos obligatorios');
      return;
    }

    if (!isStripeBackendConfigured()) {
      Alert.alert('⚠️ Configuración', 'Configura EXPO_PUBLIC_STRIPE_BACKEND_URL en tu .env');
      return;
    }

    setLoading(true);
    try {
      // Preparar items para Stripe Checkout
      const items = cart.map(item => ({
        title: item.title || 'Producto',
        price: item.price,
        quantity: item.quantity,
      }));

      // Añadir envío si aplica
      if (shipping > 0) {
        items.push({ title: 'Envío', price: shipping, quantity: 1 });
      }

      // Crear Checkout Session en el backend
      const { url } = await createCheckoutSession({ items });

      if (!url) {
        throw new Error('No se recibió URL de pago');
      }

      // Abrir Stripe Checkout en el navegador
      const result = await WebBrowser.openBrowserAsync(url);

      // Cuando el usuario vuelve del navegador
      if (result.type === 'cancel' || result.type === 'dismiss') {
        // El usuario cerró el navegador — asumimos que pagó si vio la página de éxito
        Alert.alert(
          '¿Completaste el pago?',
          'Si viste la página de confirmación de Stripe, tu pedido fue procesado.',
          [
            { text: 'Sí, pagué', onPress: () => {
                clearCart();
                navigation.navigate('Main');
              }
            },
            { text: 'No, cancelé', style: 'cancel' },
          ]
        );
      }
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'No se pudo iniciar el pago.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Resumen del pedido */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📦 Resumen del Pedido</Text>
        <View style={styles.summaryCard}>
          {cart.map((item, index) => (
            <View key={item.id} style={styles.summaryItem}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.quantity} x {item.title?.substring(0, 25)}...
              </Text>
              <Text style={styles.summaryItemPrice}>
                ${(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>
              {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>TOTAL</Text>
            <Text style={styles.summaryTotal}>${finalTotal.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Datos de envío */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 Datos de Envío</Text>
        <View style={styles.form}>
          <Text style={styles.label}>Nombre Completo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Juan Pérez"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="juan@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={styles.input}
            placeholder="Calle 123 #45-67"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Ciudad *</Text>
              <TextInput
                style={styles.input}
                placeholder="Bogotá"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Código Postal</Text>
              <TextInput
                style={styles.input}
                placeholder="110111"
                placeholderTextColor="#999"
                value={zipCode}
                onChangeText={setZipCode}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </View>

      {/* Método de pago — Stripe Checkout */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Método de Pago</Text>
        <View style={styles.paymentCard}>
          <View style={styles.paymentBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#28a745" />
            <Text style={styles.paymentBadgeText}>Pago seguro con Stripe</Text>
          </View>
          <Text style={styles.paymentDesc}>
            Al confirmar, se abrirá la pasarela segura de Stripe en tu navegador donde podrás ingresar los datos de tu tarjeta.
          </Text>
          <Text style={styles.paymentNote}>
            🧪 Modo test: usa la tarjeta 4242 4242 4242 4242
          </Text>
        </View>
      </View>

      {/* Botón confirmar */}
      <TouchableOpacity 
        style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
        onPress={handleConfirmOrder}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="lock-closed" size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>
              Pagar ${finalTotal.toFixed(2)}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  section: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  
  // Resumen
  summaryCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15 },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryItemName: { fontSize: 14, color: '#666', flex: 1 },
  summaryItemPrice: { fontSize: 14, fontWeight: '600', color: '#000' },
  summaryDivider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#000' },
  summaryTotal: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  
  // Formulario
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 8, marginTop: 12 },
  input: { 
    backgroundColor: '#f5f5f5', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#eee'
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  half: { width: '48%' },
  
  // Pago
  paymentCard: { backgroundColor: '#fff', borderRadius: 12, padding: 15 },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#e8f5e9', padding: 8, borderRadius: 8 },
  paymentBadgeText: { fontSize: 13, color: '#28a745', fontWeight: '600', marginLeft: 6 },
  paymentDesc: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 8 },
  paymentNote: { fontSize: 12, color: '#888', fontStyle: 'italic', marginTop: 4, textAlign: 'center' },
  
  // Botón
  confirmButton: { 
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#007AFF', 
    margin: 20, 
    padding: 16, 
    borderRadius: 12 
  },
  confirmButtonDisabled: { backgroundColor: '#999' },
  confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});