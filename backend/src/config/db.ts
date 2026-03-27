import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/healthsphere';

    try {
      console.log(`Attempting to connect to MongoDB at ${uri} ...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,   // wait up to 8s
        connectTimeoutMS: 8000,
        socketTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
      return;
    } catch (err: any) {
      console.warn(`⚠️  Local MongoDB connection failed (${err?.message}). Falling back to in-memory...`);
      const mongoServer = await MongoMemoryServer.create();
      const inMemUri = mongoServer.getUri();
      const conn = await mongoose.connect(inMemUri);
      console.log(`🟡 In-Memory MongoDB started at ${inMemUri}`);
      console.log(`   NOTE: Data will be lost on server restart. Install MongoDB Community for persistence.`);
    }
  } catch (error) {
    console.error('Fatal DB error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

export default connectDB;
