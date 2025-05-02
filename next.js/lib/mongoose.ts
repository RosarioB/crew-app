import mongoose from 'mongoose';
import { logger } from '@/lib/logger';

if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "NEXT_PUBLIC_MONGODB_URI"');
}

const uri = process.env.NEXT_PUBLIC_MONGODB_URI;
const options = {};

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(uri, options);
    isConnected = true;
    logger.info('Creating new MongoDB connection');
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error as Error);
    throw error;
  }
} 