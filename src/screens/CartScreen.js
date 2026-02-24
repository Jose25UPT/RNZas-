// src/screens/CartScreen.js
import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, Alert 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { cart, removeFromCart, updateQuantity, getTotal, getTotalItems, clearCart } = useCart();

  const handleRemove = (item) => {
    Alert.alert(
      'Eliminar producto',
      `¿Quitar "${item.title?.substring(0, 20)}..." del carrito?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeFromCart(item.id) }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        
        <View style={styles.itemQuantity}>
          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.qtyButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={[styles.emptyContainer, { paddingTop: insets.top + 40 }]}>
        <Ionicons name="cart-outline" size={80} color="#ccc" />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptyText}>Agrega productos para comenzar a comprar</Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('Tienda')}
        >
          <Text style={styles.shopButtonText}>Ir a la Tienda</Text>
        </TouchableOpacity>
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
    <View style={styles.container}>
      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[styles.list, { paddingTop: insets.top + 10 }]}
      />
      
      {/* Resumen del total */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({getTotalItems()} items)</Text>
          <Text style={styles.summaryValue}>${getTotal().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Envío</Text>
          <Text style={styles.summaryValue}>Gratis</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotal}>TOTAL</Text>
          <Text style={styles.summaryTotal}>${getTotal().toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.checkoutButton}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutButtonText}>Proceder al Pago</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  list: { padding: 15, paddingBottom: 200 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginTop: 20 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 },
  shopButton: { 
    backgroundColor: '#007AFF', 
    paddingHorizontal: 30, 
    paddingVertical: 15, 
    borderRadius: 25,
    marginTop: 20 
  },
  shopButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // Item del carrito
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#f0f0f0' },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#000', marginBottom: 5 },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: '#007AFF', marginBottom: 10 },
  itemQuantity: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: { 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    backgroundColor: '#e0f0ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  qtyValue: { fontSize: 16, fontWeight: 'bold', color: '#000', marginHorizontal: 15 },
  removeButton: { padding: 10 },
  
  // Resumen
  summary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, color: '#000', fontWeight: '600' },
  summaryTotal: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  checkoutButton: { 
    backgroundColor: '#007AFF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginTop: 15
  },
  checkoutButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});