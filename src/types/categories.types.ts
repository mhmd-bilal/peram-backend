import { Document } from 'mongoose';

export interface Categories {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory extends Categories, Document {}
