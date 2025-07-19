import express from 'express';
const router= express.Router();
import {signup, login, logout, verifyEmail} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';


router.post('/signup',signup)
router.post('/login',login)

router.post('/logout', logout);
router.get('/verify/:token', verifyEmail);

export default router;