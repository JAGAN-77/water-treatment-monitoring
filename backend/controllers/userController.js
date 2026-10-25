const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving users.' });
  }
};

// @route   POST /api/users
// @desc    Create a new user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, shift } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Please provide name, email, password, and role.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        error: 'A user with this email address already exists.'
      });
    }

    const user = new User({
      name,
      email: email.toLowerCase().trim(),
      password,
      role,
      shift: shift || 'A',
      isActive: true
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: 'Server error creating user.' });
  }
};

// @route   PATCH /api/users/:id/status
// @desc    Toggle or set user active/inactive status (Admin only)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Prevent admin from deactivating their own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'You cannot deactivate your own admin account.' });
    }

    if (req.body.isActive !== undefined) {
      user.isActive = Boolean(req.body.isActive);
    } else {
      user.isActive = !user.isActive;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} is now ${user.isActive ? 'Active' : 'Deactivated'}.`,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating user status.' });
  }
};

// @route   PATCH /api/users/:id/role
// @desc    Update user role & shift (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role, shift } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (role) {
      if (!['Admin', 'Plant Operator', 'Monitoring Analyst'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified.' });
      }
      user.role = role;
    }

    if (shift) {
      if (!['A', 'B', 'C', 'General'].includes(shift)) {
        return res.status(400).json({ error: 'Invalid shift specified.' });
      }
      user.shift = shift;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User permissions updated.`,
      user
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating user permissions.' });
  }
};

// @route   POST /api/users/:id/reset-password
// @desc    Reset user password (Admin only)
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        error: 'New password must be at least 6 characters.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully for ${user.name}.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error resetting password.' });
  }
};
