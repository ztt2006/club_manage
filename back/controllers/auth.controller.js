const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { username, password, email, realName, phone } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username or email already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          email,
          realName,
          phone
        },
        select: {
          id: true,
          username: true,
          email: true,
          realName: true,
          role: true,
          createdAt: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Registration failed',
        error: error.message 
      });
    }
  },

  // Login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { username }
      });

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Check user status
      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ 
          success: false, 
          message: 'Account is not active' 
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            realName: user.realName,
            role: user.role,
            avatar: user.avatar
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Login failed',
        error: error.message 
      });
    }
  },

  // Get profile
  getProfile: async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          realName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get profile',
        error: error.message 
      });
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {
      const { realName, phone, email } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          realName,
          phone,
          email
        },
        select: {
          id: true,
          username: true,
          email: true,
          realName: true,
          phone: true,
          avatar: true,
          role: true
        }
      });

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update profile',
        error: error.message 
      });
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword }
      });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to change password',
        error: error.message 
      });
    }
  }
};

module.exports = authController;
