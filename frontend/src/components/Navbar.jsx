import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = ({ navigateTo }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartItemCount } = useCart();

  const handleLogout = () => {
    logout();
    navigateTo('home');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => navigateTo('home')}
              className="text-2xl font-bold text-blue-600 hover:text-blue-800"
            >
              E-Commerce
            </button>
            <div className="hidden md:flex space-x-4">
              <button
                onClick={() => navigateTo('home')}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded"
              >
                Home
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateTo('cart')}
              className="relative p-2 text-gray-700 hover:text-blue-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {getCartItemCount() > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
            
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigateTo('profile')}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded"
                >
                  {user?.name}
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigateTo('login')}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded"
                >
                  Login
                </button>
                <button
                  onClick={() => navigateTo('register')}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

