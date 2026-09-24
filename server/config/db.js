const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const defaultLocalUri = 'mongodb://127.0.0.1:27017/careerbridgeai';
  const mongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim() !== ''
    ? process.env.MONGO_URI.trim()
    : defaultLocalUri;

  // 1. Try to connect to specified MONGO_URI or default local MongoDB
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ [Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️ [Database] Could not connect to primary URI (${mongoUri}): ${err.message}`);
  }

  // 2. If a custom URI was specified and failed, try the local MongoDB default
  if (mongoUri !== defaultLocalUri) {
    try {
      const conn = await mongoose.connect(defaultLocalUri, { serverSelectionTimeoutMS: 2500 });
      console.log(`✅ [Database] Connected to local MongoDB: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (err) {
      console.warn(`⚠️ [Database] Local MongoDB not available: ${err.message}`);
    }
  }

  // 3. Fallback: Start embedded In-Memory MongoDB only as a last resort
  try {
    console.log('🔄 [Database] Starting embedded In-Memory MongoDB server fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    
    const conn = await mongoose.connect(uri);
    console.log(`✅ [Database] Connected to In-Memory MongoDB at: ${uri}`);
    return conn;
  } catch (fallbackErr) {
    console.error(`❌ [Database Error] All database connection attempts failed: ${fallbackErr.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error(`[Database Error] Disconnect failed: ${error.message}`);
  }
};

module.exports = { connectDB, disconnectDB };