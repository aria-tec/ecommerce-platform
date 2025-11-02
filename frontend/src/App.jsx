import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key');

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const navigateTo = (page, product = null) => {
    setCurrentPage(page);
    setSelectedProduct(product);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home navigateTo={navigateTo} />;
      case 'product':
        return <ProductDetail productId={selectedProduct} navigateTo={navigateTo} />;
      case 'cart':
        return <Cart navigateTo={navigateTo} />;
      case 'checkout':
        return <Checkout navigateTo={navigateTo} />;
      case 'profile':
        return <Profile navigateTo={navigateTo} />;
      case 'login':
        return <Login navigateTo={navigateTo} />;
      case 'register':
        return <Register navigateTo={navigateTo} />;
      default:
        return <Home navigateTo={navigateTo} />;
    }
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Elements stripe={stripePromise}>
          <div className="min-h-screen bg-gray-50">
            <Navbar navigateTo={navigateTo} />
            <main className="container mx-auto px-4 py-8">
              {renderPage()}
            </main>
          </div>
        </Elements>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

