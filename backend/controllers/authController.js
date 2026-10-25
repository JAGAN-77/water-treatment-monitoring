const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      shift: user.shift
    },
    process.env.JWT_SECRET || 'water_treatment_super_secret_jwt_key_2026',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

// @route   POST /api/auth/login
// @desc    Authenticate user, verify role, set cookie, and return token + profile
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Validate inputs
    if (!email || !password || !role) {
      return res.status(400).json({
        error: 'Please provide email, password, and select your role.'
      });
    }

    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    // 3. Verify user active status
    if (!user.isActive) {
      return res.status(403).json({
        error: 'Your account is deactivated. Please contact an Administrator.'
      });
    }

    // 4. Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    // 5. Strict Role Verification
    // The backend must verify that the user's assigned role matches the role selected in the login request!
    if (user.role !== role) {
      return res.status(403).json({
        error: `Role mismatch: Your account is assigned as '${user.role}', but you selected '${role}'. Please select your authorized role to proceed.`
      });
    }

    // 6. Update last login
    user.lastLogin = new Date();
    await user.save();

    // 7. Generate JWT
    const token = generateToken(user);

    // 8. Set HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // 9. Send response (password is automatically stripped by toJSON)
    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};

// @route   POST /api/auth/logout
// @desc    Clear auth cookie & logout
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during logout.' });
  }
};

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching user profile.' });
  }
};
