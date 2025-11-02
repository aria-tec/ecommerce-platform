import React from 'react';
import { useCart } from '../context/CartContext';

const Cart = ({ navigateTo }) => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigateTo('checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-xl mb-4">Your cart is empty</p>
        <button
          onClick={() => navigateTo('home')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {cart.map((item) => (
          <div
            key={item.product._id}
            className="flex items-center justify-between border-b pb-4 mb-4 last:border-b-0"
          >
            <div className="flex items-center space-x-4 flex-1">
              <img
                src={item.product.imageUrl}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{item.product.name}</h3>
                <p className="text-gray-600">${item.product.price}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <span className="w-8 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
              
              <span className="font-semibold w-24 text-right">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
              
              <button
                onClick={() => removeFromCart(item.product._id)}
                className="text-red-500 hover:text-red-700 ml-4"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-bold">Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${getCartTotal().toFixed(2)}
            </span>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={clearCart}
              className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Clear Cart
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

