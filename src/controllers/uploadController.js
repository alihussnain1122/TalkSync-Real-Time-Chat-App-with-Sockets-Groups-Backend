import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Message from '../models/messageModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Allow images, documents, and audio files
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, documents, and audio files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload multiple files
export const uploadFiles = upload.array('files', 5); // Max 5 files

// Handle file upload
export const handleUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Process uploaded files
    const files = req.files.map(file => {
      // Determine file type based on mimetype
      let type = 'document';
      if (file.mimetype.startsWith('image/')) {
        type = 'image';
      } else if (file.mimetype.startsWith('audio/')) {
        type = 'voice';
      }

      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/uploads/${file.filename}`,
        type: type
      };
    });

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: files
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Failed to upload files', error: error.message });
  }
};

// Migration function to fix existing URLs in database
export const fixExistingUrls = async (req, res) => {
  try {
    // Find all messages with attachments that have old URL format
    const messages = await Message.find({
      'attachments.url': { $regex: '^/uploads/' }
    });

    let updatedCount = 0;

    for (const message of messages) {
      let hasChanges = false;
      
      message.attachments.forEach(attachment => {
        if (attachment.url && attachment.url.startsWith('/uploads/')) {
          attachment.url = `/api${attachment.url}`;
          hasChanges = true;
        }
      });

      if (hasChanges) {
        await message.save();
        updatedCount++;
      }
    }

    res.json({
      message: `Successfully updated ${updatedCount} messages with fixed file URLs`,
      updatedCount
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Failed to fix URLs', error: error.message });
  }
};
