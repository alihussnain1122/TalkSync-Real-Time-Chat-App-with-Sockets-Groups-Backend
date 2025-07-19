import express from 'express';
import { sendMessage,getMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
const router= express.Router();


// Routes 
router.post('/', protect, sendMessage);
router.get('/:chatId', protect, getMessages);

export default router;