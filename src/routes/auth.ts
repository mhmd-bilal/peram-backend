import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import checkRequiredFields from '../middleware/requiredFields.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication operations
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Error in registration
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */

// /**
//  * @swagger
//  * /auth/logout:
//  *   post:
//  *     summary: Log out a user
//  *     tags: [Auth]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: Logout successful
//  *       400:
//  *         description: Error in logout
//  */

router.use(checkRequiredFields(['email', 'password']));

// User registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    let { email, password, name } = req.body;
    if (!name) name = email.split('@')[0];
    const user = new User({ email, password, name });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error('User not found');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!);

    res.json({ token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// // Get user profile
// router.get('/profile', async (req: any, res: any) => {
//   const token = req.headers.authorization?.split(' ')[1]; // Extract Bearer token

//   try {
//     const { data, error } = await supabase.auth.getUser(token);

//     if (error) return res.status(401).json({ error: error.message });

//     res.status(200).json({ user: data.user });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// // User logout
// router.post('/logout', async (req: any, res: any) => {
//   const token = req.headers.authorization?.split(' ')[1];

//   try {
//     const { error } = await supabase.auth.signOut(token);

//     if (error) return res.status(400).json({ error: error.message });

//     res.status(200).json({ message: 'Logout successful' });
//   } catch (err) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

export default router;
