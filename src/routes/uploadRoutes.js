import express from 'express';
import { uploadFiles, handleUpload, fixExistingUrls } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload files route
router.post('/', protect, uploadFiles, handleUpload);

// Migration route to fix existing URLs (run once)
router.post('/fix-urls', protect, fixExistingUrls);

export default router;
