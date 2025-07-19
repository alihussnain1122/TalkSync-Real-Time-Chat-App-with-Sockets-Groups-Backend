import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  isVerified: {
    type: Boolean,
    default: false, 
  },

  faceDescriptor: {
    type: Array, 
    default: [],
  },

  profileImage: {
    type: String, 
    default: "", 
  },

  online: {
    type: Boolean,
    default: false,
  },

  lastSeen: {
    type: Date,
    default: Date.now,
  },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;