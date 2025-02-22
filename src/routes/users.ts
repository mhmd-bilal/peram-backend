import express, { Response } from 'express';
import UserTable from '../models/User';
import { AuthenticatedRequest } from '../types/request.types';
import checkId from '../middleware/checkId.middleware';

const router = express.Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Profile operations
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT

 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authorization. Example = "Bearer <your-jwt-token>"
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully fetched the user's profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized. Invalid or missing token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */

// Get user profile
router.get(
  '/profile/:userId',
  checkId('userId', 'User'),
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const userID = req.params?.userId;
      // Fetch the user's data from the database
      const user = await UserTable.findById(userID).select('-password -__v'); // Exclude the password field

      // Return the profile data
      res.json({ profile: user });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }
);

export default router;
