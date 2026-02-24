// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, 
  TouchableOpacity, ActivityIndicator, RefreshControl,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchProducts, fetchCategories } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        fetchProducts(),
        fetchCategories()
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar productos. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filterProducts = () => {
    if (selectedCategory === 'all') {
      return products;
    }
    return products.filter(p => p.category === selectedCategory);
  };

 const renderCategory = (category) => {
  // Acortar nombres muy largos
  const displayName = category === 'all' 
    ? 'Todos' 
    : category.length > 12 
      ? category.substring(0, 10) + '..' 
      : category;

  return (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text
        style={[
          styles.categoryChipText,
          selectedCategory === category && styles.categoryChipTextActive
        ]}
        numberOfLines={1}  // ← MÁXIMO 1 LÍNEA
        adjustsFontSizeToFit  // ← AJUSTA TAMAÑO SI NO CABE
      >
        {displayName}
      </Text>
    </TouchableOpacity>
  );
};
  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.image} 
          resizeMode="contain"
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating?.rate?.toFixed(1) || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  const filteredProducts = filterProducts();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>👋 Bienvenido a</Text>
          <Text style={styles.title}>🛍️ ShopFolio</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Carrito')}
          >
            <Ionicons name="cart-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filtros de categoría */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {renderCategory('all')}
        {categories.map(cat => renderCategory(cat))}
      </ScrollView>

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No hay productos en esta categoría</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#666', marginTop: 10 },
  emptyText: { color: '#666', fontSize: 16, textAlign: 'center' },
  
  // Header
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 20, 
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1, 
    borderBottomColor: '#eee' 
  },
  greeting: { fontSize: 14, color: '#666' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  cartIcon: { padding: 8 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { padding: 8, marginLeft: 8 },
  
    // Categorías (TAMAÑO UNIFORME Y COMPACTO)
  categoriesContainer: { 
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  categoryChip: {
    width: 100,  // ← TODOS DEL MISMO ANCHO
    height: 40,  // ← ALTURA FIJA
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center'
  },
  categoryChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#0056b3'
  },
  categoryChipText: {
    fontSize: 12,  // ← MÁS PEQUEÑO PARA CABER
    color: '#000000',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  
  // Lista
  list: { padding: 10 },
  card: { 
    flex: 1, 
    margin: 5, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  imageContainer: { 
    width: '100%', 
    height: 150, 
    backgroundColor: '#f8f9fa',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: { width: '100%', height: '100%' },
  info: { padding: 12 },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#000' },
  category: { fontSize: 12, color: '#999', marginBottom: 8, textTransform: 'capitalize' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  rating: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { fontSize: 12, color: '#666', marginLeft: 4 },
});