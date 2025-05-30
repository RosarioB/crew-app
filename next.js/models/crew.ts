import mongoose, { Schema, Document } from 'mongoose';

export interface Recipient {
  address: string;
  percentage: number;
}

export interface Crew extends Document {
  name: string;
  description: string;
  image: string | null;
  members: Recipient[];
  splitAddress: string;
}

const crewSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    members: [{ address: { type: String, required: true }, percentage: { type: Number, required: true } }],
    splitAddress: { type: String, required: true },
  },
  { timestamps: true }
);

// Check if the model is already defined
export const CrewModel = mongoose.models.Crew || mongoose.model<Crew>("Crew", crewSchema);