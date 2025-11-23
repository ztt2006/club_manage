const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

const userController = {
  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, role, status } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { username: { contains: search } },
          { realName: { contains: search } },
          { email: { contains: search } }
        ];
      }
      if (role) where.role = role;
      if (status) where.status = status;

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          select: {
            id: true,
            username: true,
            email: true,
            realName: true,
            phone: true,
            avatar: true,
            role: true,
            status: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get users',
        error: error.message 
      });
    }
  },

  // Get user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
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
          updatedAt: true,
          clubMembers: {
            include: {
              club: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get user',
        error: error.message 
      });
    }
  },

  // Update user
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { realName, phone, email } = req.body;

      // Check if user can update (self or admin)
      if (req.user.id !== parseInt(id) && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
      }

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { realName, phone, email },
        select: {
          id: true,
          username: true,
          email: true,
          realName: true,
          phone: true,
          avatar: true,
          role: true,
          status: true
        }
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user',
        error: error.message 
      });
    }
  },

  // Delete user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete user',
        error: error.message 
      });
    }
  },

  // Update user status
  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { status },
        select: {
          id: true,
          username: true,
          email: true,
          realName: true,
          status: true
        }
      });

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user status',
        error: error.message 
      });
    }
  },

  // Update user role
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: { role },
        select: {
          id: true,
          username: true,
          email: true,
          realName: true,
          role: true
        }
      });

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update user role',
        error: error.message 
      });
    }
  },

  // Upload avatar
  uploadAvatar: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;

      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { avatar: avatarPath },
        select: {
          id: true,
          username: true,
          realName: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          status: true,
          createdAt: true
        }
      });

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: user
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload avatar',
        error: error.message 
      });
    }
  }
};

module.exports = userController;
