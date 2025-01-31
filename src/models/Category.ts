import { Schema, model } from 'mongoose';
import { ICategory } from '../types/categories.types';

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

export default model<ICategory>('Category', categorySchema);
