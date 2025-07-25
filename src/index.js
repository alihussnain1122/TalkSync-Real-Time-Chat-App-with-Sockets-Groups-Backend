import express from 'express';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import {socketHandler} from './socket/socket.js';
import {connectDB} from './lib/db.js';
import cors from 'cors';

// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT

app.use(cors({
  origin: ['http://localhost:5173',
     'http://127.0.0.1:5173',
     'https://talksync-nine.vercel.app',
     'https://talksync-kvsb.onrender.com'],
  credentials: true, // if you use cookies or sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL,
    timestamp: new Date().toISOString()
  });
});


const server= http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173',
     'http://127.0.0.1:5173',
     'https://talksync-nine.vercel.app',
     'https://talksync-kvsb.onrender.com'],
    methods: ["GET", "POST"],
    credentials: true
  }
});

socketHandler(io);

server.listen(PORT, () => {
    console.log('✅ Server is running on port ', + PORT);
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔗 Base URL:', process.env.BASE_URL);
    console.log('📧 Email service configured with:', process.env.USER_EMAIL);
    connectDB();
})