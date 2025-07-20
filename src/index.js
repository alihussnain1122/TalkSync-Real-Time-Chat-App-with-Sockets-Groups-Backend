import express from 'express';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import dotenv from 'dotenv';
import http from 'http';
import {Server} from 'socket.io';
import {socketHandler} from './socket/socket.js';
import {connectDB} from './lib/db.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

//Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);


const server= http.createServer(app);
const io = socketIO(server, {
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
    connectDB();
})