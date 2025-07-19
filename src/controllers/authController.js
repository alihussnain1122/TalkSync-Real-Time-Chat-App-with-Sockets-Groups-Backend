import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sendEmail from '../utility/sendEmails.js';


// 🔐 Register Controller
export const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const existing = await User.findOne({ email });

        // ✅ Check for already registered users
        if (existing) {
            if (existing.isVerified) {
                return res.status(400).json({ message: 'User already exists' });
            } else {
                await User.deleteOne({ email }); // Optional: clean unverified users
            }
        }

        console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debug log

        // ✅ Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create user first
        const user = await User.create({ name, email, password: hashedPassword });

        // ✅ Create token after user is created
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const url = `http://localhost:5000/api/auth/verify/${token}`;

        // ✅ Send verification email
        await sendEmail(user.email, 'Verify Your Email', `Click to verify: ${url}`);

        res.status(201).json({ message: 'Registered successfully, verify your email to login' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔐 Verify Email Controller
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).json({ message: 'Invalid token' });

        if (user.isVerified) return res.send('Email already verified');

        user.isVerified = true;
        await user.save();

        res.send('Email verified successfully!');
    } catch (error) {
        res.status(400).send('Invalid or expired token');
    }
};

// 🔐 Login Controller
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User does not exist' });

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email to login' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Return user data without password
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        };
        
        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: userData 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Logout 
export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const user = User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }
        user.online = false;
        user.lastSeen = new Date();
        await user.save();

        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
}





