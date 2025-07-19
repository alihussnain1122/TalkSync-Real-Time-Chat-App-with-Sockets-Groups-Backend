import User from '../models/userModel.js';

// Get all verified users
export const getAllUsers = async (req, res) => {
    try {
        // Get all users except the current user, only return necessary fields
        const users = await User.find({ 
            _id: { $ne: req.user.id }, // Exclude current user
            isVerified: true // Only verified users
        }).select('name email _id'); // Only return name, email, and _id
        
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
