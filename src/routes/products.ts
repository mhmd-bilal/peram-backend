import express from 'express';
import supabase from '../supabase'; // Ensure you have the correct path to your Supabase client
import WebSocket from 'ws';

var router = express.Router({ mergeParams: true });

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

// Middleware to check authentication
const authenticate = async (req: any, res: any, next: (err?: any) => any) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = data.user; // Attach user info to request
  next();
};

// Add a new product
router.post('/add', authenticate, async (req: any, res: any) => {
  const { name, description, starting_price, closing_at } = req.body;
  const seller_id = req.user.id; // Get the authenticated user's ID

  try {
    const { data, error }: { data: any; error: any } = await supabase.from('products').insert([
      {
        seller_id,
        name,
        description,
        starting_price,
        current_price: starting_price, // Set current price to starting price
        closing_at,
      },
    ]);

    if (error) return res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Product added successfully', product: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Place a bid on a product
router.post('/bid', authenticate, async (req: any, res: any) => {
  const { product_id, bid_amount } = req.body;
  const buyer_id = req.user.id; // Get the authenticated user's ID

  try {
    const { data, error }: { data: any; error: any } = await supabase.from('bids').insert([
      {
        product_id,
        buyer_id,
        bid_amount,
      },
    ]);

    if (error) return res.status(400).json({ error: error.message });

    // Notify all connected clients about the new bid
    // const message = JSON.stringify({ product_id, bid_amount, buyer_id });
    // wss.clients.forEach((client) => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });

    res.status(201).json({ message: 'Bid placed successfully', bid: data[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all products
router.get('/', async (req: any, res: any) => {
  try {
    const { data, error } = await supabase.from('products').select('*');

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific product by ID along with its bids
router.get('/:id', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    // Fetch the product details
    const { data: product, error: productError } = await supabase.from('products').select('*').eq('id', id).single();

    if (productError) return res.status(400).json({ error: productError.message });

    // Fetch the bids for the product
    const { data: bids, error: bidsError } = await supabase.from('bids').select('*').eq('product_id', id);

    if (bidsError) return res.status(400).json({ error: bidsError.message });

    // Combine product and bids data
    res.status(200).json({ product, bids });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
