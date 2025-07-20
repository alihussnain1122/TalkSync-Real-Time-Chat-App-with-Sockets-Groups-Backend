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
        const url = `${process.env.BASE_URL}/api/auth/verify/${token}`;
        
        console.log("Generated verification URL:", url); // Debug log for verification

        // ✅ Send verification email with HTML template
        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email - TalkSync</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f9fafb;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <div style="background-color: #6366f1; padding: 40px 20px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">TalkSync</h1>
                        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Welcome to the future of communication</p>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px 20px;">
                        <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">Hi ${name}!</h2>
                        <p style="color: #374151; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                            Welcome to TalkSync! We're excited to have you join our community. To get started, please verify your email address by clicking the button below:
                        </p>
                        
                        <!-- Verification Button -->
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${url}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
                        </div>
                        
                        <p style="color: #6b7280; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                            If the button doesn't work, you can copy and paste this link into your browser:<br>
                            <a href="${url}" style="color: #6366f1; word-break: break-all;">${url}</a>
                        </p>
                        
                        <p style="color: #6b7280; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                            This verification link will expire in 15 minutes for security reasons.
                        </p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; margin: 0; font-size: 14px;">
                            If you didn't create an account with TalkSync, you can safely ignore this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail(user.email, 'Verify Your Email - TalkSync', emailHTML);

        res.status(201).json({ message: 'Registered successfully, verify your email to login' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🔐 Verify Email Controller
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        console.log('Verifying token:', token); // Debug log
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        // Determine frontend URL based on environment
        const frontendUrl = process.env.FRONTEND_URL || 
                           (process.env.NODE_ENV === 'production' 
                               ? 'https://talksync-nine.vercel.app' 
                               : 'http://localhost:5173');
        
        console.log('Frontend URL:', frontendUrl); // Debug log

        if (!user) {
            const redirectUrl = `${frontendUrl}/verify-email?status=error&message=${encodeURIComponent('Invalid token')}`;
            console.log('Redirecting to (no user):', redirectUrl); // Debug log
            return res.redirect(redirectUrl);
        }

        if (user.isVerified) {
            const redirectUrl = `${frontendUrl}/verify-email?status=success&message=${encodeURIComponent('Email already verified')}`;
            console.log('Redirecting to (already verified):', redirectUrl); // Debug log
            return res.redirect(redirectUrl);
        }

        user.isVerified = true;
        await user.save();

        const redirectUrl = `${frontendUrl}/verify-email?status=success&message=${encodeURIComponent('Email verified successfully')}`;
        console.log('Redirecting to (success):', redirectUrl); // Debug log
        res.redirect(redirectUrl);
    } catch (error) {
        console.log('Verification error:', error.message); // Debug log
        
        // Determine frontend URL based on environment
        const frontendUrl = process.env.FRONTEND_URL || 
                           (process.env.NODE_ENV === 'production' 
                               ? 'https://talksync-nine.vercel.app' 
                               : 'http://localhost:5173');
        
        const redirectUrl = `${frontendUrl}/verify-email?status=error&message=${encodeURIComponent('Invalid or expired token')}`;
        console.log('Redirecting to (error):', redirectUrl); // Debug log
        res.redirect(redirectUrl);
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





