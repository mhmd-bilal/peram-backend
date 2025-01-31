import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/request.types';
import { Response, NextFunction } from 'express';
import Category from '../models/Category';
import User from '../models/User';
import Product from '../models/Product';

const models = {
  User,
  Category,
  Product,
};

const checkId = (key: string, collectionName: 'User' | 'Category' | 'Product', fromBody?: boolean) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    const id: string = fromBody ? req.body[key] : req.params[key]; // Keep as string

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: `Invalid ${collectionName} ID` });
    }

    const model = models[collectionName] as mongoose.Model<any>;
    const exists = await model.findById(id).lean(); // Use lean() for better performance

    if (!exists) {
      return res.status(404).json({ error: `${collectionName} not found` });
    }

    next(); // Call next() only if everything is valid
  };
};

export default checkId;
