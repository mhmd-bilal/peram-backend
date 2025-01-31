import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Product from '../models/Product';
import { AuthenticatedRequest } from '../types/request.types';
import checkId from '../middleware/checkId.middleware';
import Category from '../models/Category';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product operations
 */

/**
 * @swagger
 * /products/add:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               starting_price:
 *                 type: number
 *               closing_at:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Product added successfully
 *       400:
 *         description: Error in adding product
 */

/**
 * @swagger
 * /products/bid:
 *   post:
 *     summary: Place a bid on a product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: string
 *               bid_amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Bid placed successfully
 *       400:
 *         description: Error in placing bid
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a specific product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       400:
 *         description: Error in retrieving product
 */

// Create a Product
router.post(
  '/add',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('categoryId')
      .isMongoId()
      .withMessage('Invalid category ID')
      .custom(async (value) => {
        const category = await Category.findById(value);
        if (!category) throw new Error('Category does not exist');
        return true;
      }),
    body('startingBid').isFloat({ min: 0 }).withMessage('Starting bid must be a positive number'),
    body('auctionEndTime').isISO8601().withMessage('Invalid date format'),
    body('images').isArray().withMessage('Images must be an array'),
    body('images.*').isString().withMessage('Invalid image format'),
    // checkId('categoryId', 'Category', true),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      // Create product
      const product = new Product({
        ...req.body,
        sellerId: req.userId, // Extracted from JWT
      });

      await product.save();

      // Return response (exclude unnecessary fields)
      const responseProduct = product.toObject();
      //   delete responseProduct.__v;

      res.status(201).json(responseProduct);
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// Get All Products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find()
      .select('-__v')
      .populate('categoryId', 'name') // Populate category name
      .populate('sellerId', 'email'); // Populate seller email.sort({ createdAt: -1 });
    res.json({ products: products });
  } catch (error) {
    console.error('Get all product error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get a Single Product
router.get('/:productId', checkId('productId', 'Product'), async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params?.productId)
      .select('-__v')
      .populate('categoryId', 'name') // Populate category name
      .populate('sellerId', 'email'); // Populate seller email;

    res.json({ product: product });
  } catch (error) {
    console.error('Get a product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Update a Product
router.put(
  '/:productId',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('categoryId')
      .optional()
      .isMongoId()
      .withMessage('Invalid category ID')
      .custom(async (value) => {
        const category = await Category.findById(value);
        if (!category) throw new Error('Category does not exist');
        return true;
      }),
    body('startingBid').optional().isFloat({ min: 0 }).withMessage('Starting bid must be a positive number'),
    body('auctionEndTime').optional().isISO8601().withMessage('Invalid date format'),
    checkId('productId', 'Product'),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Find the product and verify ownership
      const product = await Product.findById(req.params.id);

      // Check if user is the seller
      if (product.sellerId.toString() !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized: You are not the seller' });
      }

      // Update the product
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true } // Return updated document and validate
      )
        .select('-__v')
        .populate('category', 'name')
        .populate('sellerId', 'name email');

      res.json(updatedProduct);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// Delete a product
router.delete('/:productId', checkId('productId', 'Product'), async (req: Request, res: Response): Promise<void> => {
  try {
    await Product.findByIdAndDelete(req.params?.productId).select('-__v');

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to Product category' });
  }
});

export default router;
