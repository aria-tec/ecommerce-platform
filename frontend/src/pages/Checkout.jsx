import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const CheckoutForm = ({ cart, shippingAddress, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      let paymentResult;

      if (paymentMethod === 'stripe') {
        const cardElement = elements.getElement(CardElement);
        
        const { token, error } = await stripe.createToken(cardElement);
        
        if (error) {
          alert(error.message);
          setProcessing(false);
          return;
        }

        // Process payment through backend
        const response = await axios.post(
          '/api/payments/charge',
          {
            paymentMethod: 'stripe',
            token: token.id,
            amount: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
            currency: 'usd',
            items: cart.map(item => ({
              id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity
            })),
            shippingAddress
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        paymentResult = response.data.payment;
      } else if (paymentMethod === 'paypal') {
        // Create PayPal payment
        const createResponse = await axios.post(
          '/api/payments/create-paypal-payment',
          {
            amount: cart.reduce((total, item) => total + item.product.price * item.quantity, 0),
            currency: 'USD',
            items: cart.map(item => ({
              id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity
            }))
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        // Redirect to PayPal
        window.location.href = createResponse.data.approvalUrl;
        return;
      }

      // Create order
      if (paymentResult && paymentResult.success) {
        const orderResponse = await axios.post(
          '/api/orders',
          {
            items: cart.map(item => ({
              productId: item.product._id,
              quantity: item.quantity
            })),
            shippingAddress,
            paymentId: paymentResult.paymentId
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        onSuccess(orderResponse.data.order);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            Credit Card (Stripe)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mr-2"
            />
            PayPal
          </label>
        </div>
      </div>

      {paymentMethod === 'stripe' && (
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      )}

      {paymentMethod === 'paypal' && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p>You will be redirected to PayPal to complete your payment.</p>
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing || !stripe}
          className="flex-1 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        >
          {processing ? 'Processing...' : 'Complete Purchase'}
        </button>
      </div>
    </form>
  );
};

const Checkout = ({ navigateTo }) => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 text-xl mb-4">Please login to checkout</p>
        <button
          onClick={() => navigateTo('login')}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    );
  }

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

  if (orderSuccess) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Order Placed Successfully!</h2>
          <p className="text-gray-700 mb-4">Thank you for your purchase. Your order ID is: {orderData?._id}</p>
          <button
            onClick={() => {
              clearCart();
              navigateTo('home');
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <input
              type="text"
              placeholder="Street Address"
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="City"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={shippingAddress.zipCode}
              onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Country"
              value={shippingAddress.country}
              onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            {cart.map((item) => (
              <div key={item.product._id} className="flex justify-between mb-2">
                <span>{item.product.name} x {item.quantity}</span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6">
              <Elements stripe={stripePromise}>
                <CheckoutForm
                  cart={cart}
                  shippingAddress={shippingAddress}
                  onSuccess={(order) => {
                    setOrderData(order);
                    setOrderSuccess(true);
                  }}
                  onCancel={() => navigateTo('cart')}
                />
              </Elements>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

