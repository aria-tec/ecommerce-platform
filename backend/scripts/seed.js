const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    category: 'Electronics',
    stockQuantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'
  },
  {
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with fitness tracking',
    price: 249.99,
    category: 'Electronics',
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt',
    price: 19.99,
    category: 'Clothing',
    stockQuantity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'
  },
  {
    name: 'JavaScript Guide Book',
    description: 'Comprehensive guide to modern JavaScript',
    price: 39.99,
    category: 'Books',
    stockQuantity: 75,
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500'
  },
  {
    name: 'Coffee Table',
    description: 'Modern wooden coffee table',
    price: 199.99,
    category: 'Home',
    stockQuantity: 20,
    imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=500'
  },
  {
    name: 'Basketball',
    description: 'Professional grade basketball',
    price: 29.99,
    category: 'Sports',
    stockQuantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500'
  },
  {
    name: 'Action Figure',
    description: 'Collectible action figure',
    price: 14.99,
    category: 'Toys',
    stockQuantity: 80,
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500'
  },
  {
    name: 'Laptop Stand',
    description: 'Ergonomic aluminum laptop stand',
    price: 49.99,
    category: 'Electronics',
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    await Product.insertMany(products);
    console.log('Seeded database with sample products');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

