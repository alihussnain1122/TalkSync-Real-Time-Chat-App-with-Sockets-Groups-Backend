import express from 'express';
import { uploadFiles, handleUpload } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Upload files route
router.post('/', protect, uploadFiles, handleUpload);

export default router;
