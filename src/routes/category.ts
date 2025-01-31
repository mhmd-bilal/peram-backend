import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Category from '../models/Category';
import checkId from '../middleware/checkId.middleware';

const router = express.Router();

// Create a Category
router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Category name is required'), body('description').optional().trim()],
  async (req: Request, res: Response): Promise<void> => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // Check if category already exists
      const existingCategory = await Category.findOne({ name: req.body.name });
      if (existingCategory) {
        res.status(400).json({ error: 'Category already exists' });
        return;
      }

      // Create new category
      const category = new Category({
        name: req.body.name,
        description: req.body.description,
      });

      await category.save();

      // Return response (exclude unnecessary fields)
      const responseCategory = category.toObject();
      //   delete responseCategory.__v;

      res.status(201).json(responseCategory);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

// Get All Categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().select('-__v').sort({ createdAt: -1 });
    res.json({ categories: categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Update a Category
router.put(
  '/:categoryId',
  [
    body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
    body('description').optional().trim(),
    checkId('categoryId', 'Category'),
  ],
  async (req: Request, res: Response): Promise<void> => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const category = await Category.findByIdAndUpdate(
        req.params.categoryId,
        {
          $set: req.body,
        },
        { new: true, runValidators: true } // Return updated document and validate input
      ).select('-__v');

      res.json(category);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
);

// Delete a Category
router.delete('/:categoryId', checkId('categoryId', 'Category'), async (req: Request, res: Response): Promise<void> => {
  try {
    await Category.findByIdAndDelete(req.params?.categoryId).select('-__v');

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
