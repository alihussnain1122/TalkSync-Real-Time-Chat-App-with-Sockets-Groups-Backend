import express from 'express';
import { getAllUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all users (excluding current user)
router.get('/', protect, getAllUsers);

export default router;
