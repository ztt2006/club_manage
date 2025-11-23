const prisma = require('../config/prisma');

const memberController = {
  // Add member to club
  addMember: async (req, res) => {
    try {
      const { clubId, userId, role } = req.body;

      // 权限检查：普通用户只能添加自己
      const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user?.role);
      const isSelf = parseInt(userId) === req.user.id;

      if (!isAdmin && !isSelf) {
        return res.status(403).json({
          success: false,
          message: '您只能添加自己加入社团'
        });
      }

      // 如果是普通用户添加自己，强制角色为 MEMBER
      const memberRole = (isAdmin || !isSelf) ? (role || 'MEMBER') : 'MEMBER';

      // Check if club exists and has capacity
      const club = await prisma.club.findUnique({
        where: { id: parseInt(clubId) },
        include: {
          _count: {
            select: { members: true }
          }
        }
      });

      if (!club) {
        return res.status(404).json({ 
          success: false, 
          message: 'Club not found' 
        });
      }

      if (club._count.members >= club.maxMembers) {
        return res.status(400).json({ 
          success: false, 
          message: 'Club has reached maximum capacity' 
        });
      }

      // Check if user is already a member
      const existingMember = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: parseInt(clubId),
            userId: parseInt(userId)
          }
        }
      });

      if (existingMember) {
        return res.status(400).json({ 
          success: false, 
          message: 'User is already a member of this club' 
        });
      }

      const member = await prisma.clubMember.create({
        data: {
          clubId: parseInt(clubId),
          userId: parseInt(userId),
          role: memberRole
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              realName: true,
              avatar: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: member
      });
    } catch (error) {
      console.error('Add member error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to add member',
        error: error.message 
      });
    }
  },

  // Remove member from club
  removeMember: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.clubMember.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Member removed successfully'
      });
    } catch (error) {
      console.error('Remove member error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to remove member',
        error: error.message 
      });
    }
  },

  // Update member role
  updateMemberRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const member = await prisma.clubMember.update({
        where: { id: parseInt(id) },
        data: { role },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              realName: true
            }
          }
        }
      });

      res.json({
        success: true,
        message: 'Member role updated successfully',
        data: member
      });
    } catch (error) {
      console.error('Update member role error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update member role',
        error: error.message 
      });
    }
  },

  // Update member status
  updateMemberStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const member = await prisma.clubMember.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      res.json({
        success: true,
        message: 'Member status updated successfully',
        data: member
      });
    } catch (error) {
      console.error('Update member status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update member status',
        error: error.message 
      });
    }
  },

  // Get my clubs
  getMyClubs: async (req, res) => {
    try {
      const memberships = await prisma.clubMember.findMany({
        where: { userId: req.user.id },
        include: {
          club: {
            include: {
              _count: {
                select: { members: true, activities: true }
              }
            }
          }
        },
        orderBy: { joinDate: 'desc' }
      });

      res.json({
        success: true,
        data: memberships
      });
    } catch (error) {
      console.error('Get my clubs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get clubs',
        error: error.message 
      });
    }
  }
};

module.exports = memberController;
