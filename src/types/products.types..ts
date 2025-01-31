import { Schema, Document } from 'mongoose';

export interface Product {
  title: string;
  description: string;
  categoryId: Schema.Types.ObjectId; // Reference to Category
  startingBid: number;
  currentBid: number;
  auctionEndTime: String;
  images: string[]; // Base64 strings
  sellerId: Schema.Types.ObjectId; // Reference to User
  status: 'active' | 'ended' | 'sold';
  createdAt: String;
  updatedAt: String;
}

export interface IProduct extends Product, Document {}
