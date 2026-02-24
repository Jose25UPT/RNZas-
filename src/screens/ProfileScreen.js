import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const accountActions = [
  {
    icon: 'location-outline',
    label: 'Direcciones guardadas',
    onPress: () => Alert.alert('Direcciones', 'Conecta tu backend para listar y editar direcciones.'),
  },
  {
    icon: 'card-outline',
    label: 'Métodos de pago',
    onPress: () => Alert.alert('Pagos', 'Integra Stripe o tu pasarela preferida aquí.'),
  },
  {
    icon: 'help-circle-outline',
    label: 'Ayuda y soporte',
    onPress: () => Alert.alert('Soporte', 'Redirige a un chat, FAQ o correo de soporte.'),
  },
];

export default function ProfileScreen({ navigation }) {
  const { user, userData, logOut, signInWithGoogle, googleAuthLoading, isGoogleConfigured } = useAuth();
  const normalizeAmount = (value) => {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const orders = userData?.orders || [];
  const totalOrders = orders.length;
  const lastOrders = orders.slice(-3).reverse();
  const lifetimeValue = normalizeAmount(userData?.lifetimeValue);

  const handleGoogleLogin = async () => {
    const result = await signInWithGoogle();
    if (result?.error === 'GOOGLE_CONFIG_MISSING' || result?.error === 'GOOGLE_CLIENT_ID_MISSING') {
      Alert.alert(
        'Configura Google',
        'Agrega tus Google Client IDs en el archivo .env y reinicia Expo para habilitar este botón.'
      );
      return;
    }

    if (result?.error && !['dismiss', 'cancel'].includes(result.error)) {
      Alert.alert('Error', 'No se pudo iniciar sesión con Google. Intenta de nuevo.');
    }
  };

  const handleEmailLogin = () => {
    navigation.navigate('Login');
  };

  const handleLogout = async () => {
    await logOut();
  };

  const goToCart = () => {
    navigation.getParent()?.navigate('Carrito');
  };

  const goToStore = () => {
    navigation.getParent()?.navigate('Tienda');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {user ? (
          <>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <View>
                  <Text style={styles.greeting}>Hola,</Text>
                  <Text style={styles.title}>{user.displayName || 'Shopper'}</Text>
                  <Text style={styles.subtitle}>{user.email}</Text>
                </View>
                <Ionicons name="person-circle" size={70} color="#007AFF" />
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalOrders}</Text>
                  <Text style={styles.statLabel}>Pedidos</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>${lifetimeValue.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Gastado</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>24/7</Text>
                  <Text style={styles.statLabel}>Soporte</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.primaryButtonText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Acciones rápidas</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity style={styles.actionButton} onPress={goToCart}>
                  <Ionicons name="cart-outline" size={22} color="#007AFF" />
                  <Text style={styles.actionText}>Ver carrito</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={goToStore}>
                  <Ionicons name="pricetag-outline" size={22} color="#007AFF" />
                  <Text style={styles.actionText}>Seguir comprando</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => Alert.alert('Favoritos', 'Conecta tu lista de deseos aquí.')}
                >
                  <Ionicons name="heart-outline" size={22} color="#007AFF" />
                  <Text style={styles.actionText}>Lista de deseos</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historial de pedidos</Text>
              {lastOrders.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="cube-outline" size={42} color="#999" />
                  <Text style={styles.emptyTitle}>Sin pedidos aún</Text>
                  <Text style={styles.emptySubtitle}>Cuando compres, verás aquí el estado de tus órdenes.</Text>
                </View>
              ) : (
                lastOrders.map((order, index) => {
                  const createdAt = order.createdAt ? new Date(order.createdAt) : null;
                  const formattedDate = createdAt ? createdAt.toLocaleDateString() : 'Sin fecha';
                  const total = normalizeAmount(order.total);
                  return (
                    <View key={order.id || index} style={styles.orderCard}>
                      <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>#{order.id || '0000'}</Text>
                        <Text style={styles.orderStatus}>{order.status || 'Procesando'}</Text>
                      </View>
                      <Text style={styles.orderMeta}>{formattedDate}</Text>
                      <Text style={styles.orderTotal}>Total: ${total.toFixed(2)}</Text>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tu cuenta</Text>
              {accountActions.map(action => (
                <TouchableOpacity key={action.label} style={styles.listItem} onPress={action.onPress}>
                  <Ionicons name={action.icon} size={22} color="#000" />
                  <Text style={styles.listItemText}>{action.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Ionicons name="person-circle-outline" size={84} color="#000" />
            <Text style={styles.title}>Tu espacio personal</Text>
            <Text style={styles.subtitle}>Inicia sesión para seguir tus pedidos y guardar tus datos.</Text>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (!isGoogleConfigured || googleAuthLoading) && styles.disabledButton,
              ]}
              onPress={handleGoogleLogin}
              disabled={!isGoogleConfigured || googleAuthLoading}
            >
              {googleAuthLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Continuar con Google</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleEmailLogin}>
              <Ionicons name="mail" size={20} color="#007AFF" />
              <Text style={styles.secondaryButtonText}>Iniciar con correo</Text>
            </TouchableOpacity>
            {!isGoogleConfigured && (
              <Text style={styles.helperText}>
                Necesitas definir tus Google Client IDs en .env antes de usar esta opción.
              </Text>
            )}
            <View style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>Ventajas de crear cuenta:</Text>
              <Text style={styles.benefitItem}>• Seguimiento de pedidos en tiempo real</Text>
              <Text style={styles.benefitItem}>• Historial y facturas en un clic</Text>
              <Text style={styles.benefitItem}>• Promociones exclusivas</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ 
  safeArea: { flex: 1, backgroundColor: '#f5f6f8' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 14, color: '#666' },
  title: { fontSize: 24, fontWeight: '700', color: '#000', marginTop: 4 },
  subtitle: { fontSize: 14, color: '#666', marginTop: 6 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 16,
  },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#000' },
  statLabel: { fontSize: 12, color: '#777', marginTop: 4 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5f0ff',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  secondaryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  disabledButton: {
    opacity: 0.6,
  },
  helperText: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionButton: {
    width: '30%',
    backgroundColor: '#f2f6ff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: { fontSize: 12, color: '#0b2d66', fontWeight: '600', textAlign: 'center', marginTop: 8 },
  emptyBox: { alignItems: 'center', paddingVertical: 20 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginTop: 10 },
  emptySubtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 4 },
  orderCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  orderId: { fontSize: 14, fontWeight: '600', color: '#000' },
  orderStatus: { fontSize: 12, fontWeight: '600', color: '#007AFF' },
  orderMeta: { fontSize: 12, color: '#666' },
  orderTotal: { fontSize: 14, fontWeight: '600', color: '#000', marginTop: 6 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f2f2f2',
  },
  listItemText: { flex: 1, marginLeft: 12, fontSize: 15, color: '#000' },
  benefitsBox: {
    marginTop: 20,
    backgroundColor: '#f6f8fb',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  benefitsTitle: { fontSize: 15, fontWeight: '700', color: '#000', marginBottom: 8 },
  benefitItem: { fontSize: 13, color: '#444', marginTop: 4 },
});