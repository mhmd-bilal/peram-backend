import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/request.types';
import { Response, NextFunction } from 'express';

const checkId = (key: string, documentName?: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const id = req.params[key];
    const isValidId = mongoose.Types.ObjectId.isValid(id); // Check if the ID is valid
    if (!isValidId) {
      const errorMessage = documentName ? documentName + ' not found' : 'Document not found';
      res.status(400).json({ error: errorMessage });
      return;
    }
    next();
  };
};

export default checkId;
