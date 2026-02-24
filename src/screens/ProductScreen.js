// src/screens/ProductScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, 
  TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchProductById } from '../services/api';
import { useCart } from '../context/CartContext';  // ← Importar hook

export default function ProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);  // ← Estado para cantidad
  const insets = useSafeAreaInsets();
  
  const { addToCart, getTotalItems } = useCart();  // ← Usar hook

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const data = await fetchProductById(productId);
      setProduct(data);
      navigation.setOptions({ title: data.title?.substring(0, 30) });
    } catch (error) {
      console.error('Error cargando producto:', error);
      Alert.alert('Error', 'No se pudo cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      '✅ Agregado',
      `${quantity} x ${product.title?.substring(0, 20)}... agregado al carrito`,
      [{ text: 'Genial', onPress: () => navigation.goBack() }]
    );
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!product) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 }
        ]}
        showsVerticalScrollIndicator={false}
      >
      {/* Imagen */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      </View>

      {/* Info */}
      <View style={styles.content}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.title}</Text>
        
        <View style={styles.ratingRow}>
          <View style={styles.rating}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{product.rating?.rate?.toFixed(1)} / 5</Text>
          </View>
          <Text style={styles.reviews}>({product.rating?.count} reseñas)</Text>
        </View>

        <Text style={styles.price}>${product.price.toFixed(2)}</Text>

        {/* Selector de Cantidad */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Cantidad:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={decrementQuantity}
            >
              <Ionicons name="remove" size={24} color="#007AFF" />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.description}>{product.description}</Text>

        {/* Botón Añadir al Carrito */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Ionicons name="cart" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Añadir al Carrito</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { paddingBottom: 40, paddingTop: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  imageContainer: { 
    width: '100%', 
    height: 300, 
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 20,
    marginTop: 8
  },
  image: { width: '100%', height: '100%' },
  content: { padding: 20 },
  category: { 
    fontSize: 14, 
    color: '#007AFF', 
    textTransform: 'uppercase', 
    fontWeight: '600',
    marginBottom: 8 
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#000', marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  rating: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  ratingText: { fontSize: 16, color: '#000', marginLeft: 6 },
  reviews: { fontSize: 14, color: '#666' },
  price: { fontSize: 28, fontWeight: 'bold', color: '#007AFF', marginBottom: 20 },
  
  // Cantidad
  quantityContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20
  },
  quantityLabel: { fontSize: 16, fontWeight: '600', color: '#000' },
  quantityControls: { flexDirection: 'row', alignItems: 'center' },
  quantityButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#e0f0ff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  quantityValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000', 
    marginHorizontal: 20 
  },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  description: { fontSize: 15, color: '#666', lineHeight: 22, marginBottom: 30 },
  addButton: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#007AFF', 
    padding: 16, 
    borderRadius: 12,
    marginBottom: 30
  },
  addButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
});