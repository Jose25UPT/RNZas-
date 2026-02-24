// src/context/CartContext.js
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCartStore = create((set, get) => ({
  cart: [],
  
  // Inicializar carrito desde AsyncStorage
  initializeCart: async () => {
    try {
      const stored = await AsyncStorage.getItem('@shopfolio_cart');
      if (stored) {
        set({ cart: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  },
  
  // Añadir producto al carrito
  addToCart: async (product, quantity = 1) => {
    const cart = get().cart;
    const existingItem = cart.find(item => item.id === product.id);
    
    let newCart;
    if (existingItem) {
      // Si ya existe, aumentar cantidad
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      // Si no existe, agregar nuevo
      newCart = [...cart, { ...product, quantity }];
    }
    
    set({ cart: newCart });
    
    // Guardar en AsyncStorage
    try {
      await AsyncStorage.setItem('@shopfolio_cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  },
  
  // Remover producto del carrito
  removeFromCart: async (productId) => {
    const newCart = get().cart.filter(item => item.id !== productId);
    set({ cart: newCart });
    
    try {
      await AsyncStorage.setItem('@shopfolio_cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error eliminando del carrito:', error);
    }
  },
  
  // Actualizar cantidad
  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    
    const newCart = get().cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    
    set({ cart: newCart });
    
    try {
      await AsyncStorage.setItem('@shopfolio_cart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
    }
  },
  
  // Limpiar carrito
  clearCart: async () => {
    set({ cart: [] });
    try {
      await AsyncStorage.removeItem('@shopfolio_cart');
    } catch (error) {
      console.error('Error limpiando carrito:', error);
    }
  },
  
  // Obtener total del carrito
  getTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  // Obtener cantidad total de items
  getTotalItems: () => {
    return get().cart.reduce((total, item) => total + item.quantity, 0);
  },
}));

// Hook personalizado para usar en los componentes
export const useCart = () => {
  const cart = useCartStore(state => state.cart);
  const addToCart = useCartStore(state => state.addToCart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);
  const getTotal = useCartStore(state => state.getTotal);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const initializeCart = useCartStore(state => state.initializeCart);
  
  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
    getTotalItems,
    initializeCart,
  };
};

export default useCartStore;