import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB= async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`🚀 Database connected successfully ${mongoose.connection.host}`);

    }
    catch(err){
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
}

