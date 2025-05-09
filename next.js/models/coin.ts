import mongoose, { Schema, Document } from 'mongoose';

export interface Recipient {
  address: string;
  percentage: number;
}

export interface Coin extends Document {
  name: string;
  symbol: string;
  description: string;
  image: string;
  uri: string;
  owner: string;
  payoutRecipient: string;
  platformReferrer: string;
  currency: string;
  pool: string;
  version: string;
  zoraCoinUrl: string;
  address: string;
  txHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const coinSchema = new Schema(
  {
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    uri: { type: String, required: true },
    owner: { type: String, required: true },
    payoutRecipient: { type: String, required: true },
    platformReferrer: { type: String, required: true },
    currency: { type: String, required: false },
    pool: { type: String, required: false },
    version: { type: String, required: false },
    zoraCoinUrl: { type: String, required: true },
    address: { type: String, required: true },
    txHash: { type: String, required: true },
  },
  { timestamps: true }
);

// Check if the model is already defined
export const CoinModel = mongoose.models.Coin || mongoose.model<Coin>("Coin", coinSchema);