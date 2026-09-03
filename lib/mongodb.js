const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

/**
 * Global cache for Mongoose connection across Vercel serverless invocations.
 */
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with serverless connection pooling & caching.
 * Returns null if MONGODB_URI is not provided (allowing fallback to disk storage).
 */
async function connectMongoDB() {
  if (!MONGODB_URI) {
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log('✅ Connected to MongoDB Cloud Database');
      return m;
    }).catch((err) => {
      console.warn('⚠️ MongoDB connection error, utilizing fallback:', err.message);
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
  }

  return cached.conn;
}

function isMongoDBAvailable() {
  return !!MONGODB_URI;
}

module.exports = {
  connectMongoDB,
  isMongoDBAvailable,
  MONGODB_URI,
};
