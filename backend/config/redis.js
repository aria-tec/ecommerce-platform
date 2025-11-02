const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Connect to Redis
(async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis connection error:', error);
  }
})();

// Cache helper functions
const cache = {
  // Get cached data
  get: async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  // Set cached data with expiration (default 1 hour)
  set: async (key, value, expirationInSeconds = 3600) => {
    try {
      await redisClient.setEx(key, expirationInSeconds, JSON.stringify(value));
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  },

  // Delete cached data
  del: async (key) => {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }
};

module.exports = { redisClient, cache };

