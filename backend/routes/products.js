const express = require('express');
const Product = require('../models/Product');
const { cache } = require('../config/redis');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (with optional search and category filter)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    
    // Build query
    const query = {};
    if (search && typeof search === 'string') {
      // Sanitize search input - limit length
      const sanitizedSearch = search.trim().substring(0, 100);
      if (sanitizedSearch) {
        query.$or = [
          { name: { $regex: sanitizedSearch, $options: 'i' } },
          { description: { $regex: sanitizedSearch, $options: 'i' } }
        ];
      }
    }
    if (category && typeof category === 'string') {
      // Sanitize category input
      query.category = category.trim();
    }

    // Check cache first (for popular queries)
    const cacheKey = `products:${JSON.stringify(query)}`;
    const cachedProducts = await cache.get(cacheKey);
    
    if (cachedProducts) {
      return res.json(cachedProducts);
    }

    // Fetch from database
    const products = await Product.find(query);

    // Cache results for 1 hour
    await cache.set(cacheKey, products, 3600);

    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    
    // Check cache
    const cacheKey = `products:category:${category}`;
    const cachedProducts = await cache.get(cacheKey);
    
    if (cachedProducts) {
      return res.json(cachedProducts);
    }

    const products = await Product.find({ category });
    
    // Cache for 1 hour
    await cache.set(cacheKey, products, 3600);

    res.json(products);
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
});

module.exports = router;

