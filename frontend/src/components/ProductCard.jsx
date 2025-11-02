import React from 'react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product, navigateTo }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleViewDetails = () => {
    navigateTo('product', product._id);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover cursor-pointer"
        onClick={handleViewDetails}
      />
      <div className="p-4">
        <h3
          className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600"
          onClick={handleViewDetails}
        >
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-blue-600">${product.price}</span>
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add to Cart
          </button>
        </div>
        {product.stockQuantity === 0 && (
          <p className="text-red-500 text-sm mt-2">Out of Stock</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

