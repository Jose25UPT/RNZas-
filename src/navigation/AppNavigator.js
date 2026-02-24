// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
// ../context/CartContext
import { useCart } from '../context/CartContext'; 
// Screens (placeholders por ahora)
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
// Importa la nueva pantalla
import SearchScreen from '../screens/SearchScreen';
// Importa CheckoutScreen
import CheckoutScreen from '../screens/CheckoutScreen';

const RootStack = createStackNavigator();
const ProductStackNavigator = createStackNavigator();
const ProfileStackNavigator = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navegación para la tienda (home, producto, búsqueda, checkout)
function ProductStack() {
  return (
    <ProductStackNavigator.Navigator screenOptions={{ 
      headerStyle: { backgroundColor: '#fff' }, 
      headerTintColor: '#000',
      headerShadowVisible: true
    }}>
      <ProductStackNavigator.Screen
        name="Products"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <ProductStackNavigator.Screen
        name="ProductDetail"
        component={ProductScreen}
        options={{ title: 'Producto' }}
      />
      <ProductStackNavigator.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Buscar' }}
      />
    </ProductStackNavigator.Navigator>
  );
}

// Navegación de perfil + login
function ProfileStack() {
  return (
    <ProfileStackNavigator.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#000',
      }}
    >
      <ProfileStackNavigator.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <ProfileStackNavigator.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Iniciar sesión' }}
      />
    </ProfileStackNavigator.Navigator>
  );
}

// Navegación principal con Tabs
function AppTabs() {
    const { getTotalItems } = useCart();  // ← Usar hook
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee' },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Tienda') iconName = 'home';
          else if (route.name === 'Carrito') iconName = 'cart';
          else if (route.name === 'Perfil') iconName = 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarBadge: route.name === 'Carrito' && getTotalItems() > 0 
          ? getTotalItems() 
          : undefined,  // ← Badge con cantidad
      })}
    >
      <Tab.Screen name="Tienda" component={ProductStack} />
      <Tab.Screen name="Carrito" component={CartScreen} />
      <Tab.Screen name="Perfil" component={ProfileStack} />
    </Tab.Navigator>
  );
}


export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Main" component={AppTabs} />
        <RootStack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{
            headerShown: true,
            title: 'Checkout',
            headerStyle: { backgroundColor: '#fff' },
            headerTintColor: '#000',
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}