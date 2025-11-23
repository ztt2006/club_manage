const prisma = require('../config/prisma');

const activityController = {
  // Get all activities
  getAllActivities: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, clubId, status, upcoming } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { description: { contains: search } }
        ];
      }
      if (clubId) where.clubId = parseInt(clubId);
      if (status) where.status = status;
      if (upcoming === 'true') {
        where.startTime = { gte: new Date() };
      }

      const [activities, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            club: {
              select: {
                id: true,
                name: true,
                logo: true
              }
            },
            organizer: {
              select: {
                id: true,
                realName: true,
                avatar: true
              }
            },
            _count: {
              select: { records: true }
            }
          },
          orderBy: { startTime: 'desc' }
        }),
        prisma.activity.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          activities,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all activities error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get activities',
        error: error.message 
      });
    }
  },

  // Get activity by ID
  getActivityById: async (req, res) => {
    try {
      const { id } = req.params;

      const activity = await prisma.activity.findUnique({
        where: { id: parseInt(id) },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          },
          organizer: {
            select: {
              id: true,
              realName: true,
              avatar: true
            }
          },
          records: {
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
          }
        }
      });

      if (!activity) {
        return res.status(404).json({ 
          success: false, 
          message: 'Activity not found' 
        });
      }

      res.json({
        success: true,
        data: activity
      });
    } catch (error) {
      console.error('Get activity error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get activity',
        error: error.message 
      });
    }
  },

  // Create activity
  createActivity: async (req, res) => {
    try {
      const { title, description, clubId, location, startTime, endTime, maxParticipants } = req.body;

      const activity = await prisma.activity.create({
        data: {
          title,
          description,
          clubId: clubId ? parseInt(clubId) : null,
          organizerId: req.user.id,
          location,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          maxParticipants
        },
        include: {
          club: true,
          organizer: {
            select: {
              id: true,
              realName: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Activity created successfully',
        data: activity
      });
    } catch (error) {
      console.error('Create activity error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create activity',
        error: error.message 
      });
    }
  },

  // Update activity
  updateActivity: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, location, startTime, endTime, maxParticipants, status } = req.body;

      const activity = await prisma.activity.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          location,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          maxParticipants,
          status
        }
      });

      res.json({
        success: true,
        message: 'Activity updated successfully',
        data: activity
      });
    } catch (error) {
      console.error('Update activity error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update activity',
        error: error.message 
      });
    }
  },

  // Delete activity
  deleteActivity: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.activity.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Activity deleted successfully'
      });
    } catch (error) {
      console.error('Delete activity error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete activity',
        error: error.message 
      });
    }
  },

  // Upload cover
  uploadCover: async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const coverPath = `/uploads/covers/${req.file.filename}`;

      const activity = await prisma.activity.update({
        where: { id: parseInt(id) },
        data: { cover: coverPath }
      });

      res.json({
        success: true,
        message: 'Cover uploaded successfully',
        data: activity
      });
    } catch (error) {
      console.error('Upload cover error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload cover',
        error: error.message 
      });
    }
  },

  // Register for activity
  registerActivity: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if activity exists and has capacity
      const activity = await prisma.activity.findUnique({
        where: { id: parseInt(id) },
        include: {
          _count: {
            select: { records: true }
          }
        }
      });

      if (!activity) {
        return res.status(404).json({ 
          success: false, 
          message: 'Activity not found' 
        });
      }

      if (activity.maxParticipants && activity._count.records >= activity.maxParticipants) {
        return res.status(400).json({ 
          success: false, 
          message: 'Activity has reached maximum participants' 
        });
      }

      // Check if already registered
      const existingRecord = await prisma.activityRecord.findUnique({
        where: {
          activityId_userId: {
            activityId: parseInt(id),
            userId: req.user.id
          }
        }
      });

      if (existingRecord) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already registered for this activity' 
        });
      }

      const record = await prisma.activityRecord.create({
        data: {
          activityId: parseInt(id),
          userId: req.user.id
        }
      });

      res.status(201).json({
        success: true,
        message: 'Registered successfully',
        data: record
      });
    } catch (error) {
      console.error('Register activity error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to register for activity',
        error: error.message 
      });
    }
  },

  // Check-in to activity
  checkinActivity: async (req, res) => {
    try {
      const { id } = req.params;

      const record = await prisma.activityRecord.update({
        where: {
          activityId_userId: {
            activityId: parseInt(id),
            userId: req.user.id
          }
        },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Checked in successfully',
        data: record
      });
    } catch (error) {
      console.error('Checkin activity error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to check in',
        error: error.message 
      });
    }
  },

  // Cancel registration
  cancelRegistration: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.activityRecord.delete({
        where: {
          activityId_userId: {
            activityId: parseInt(id),
            userId: req.user.id
          }
        }
      });

      res.json({
        success: true,
        message: 'Registration cancelled successfully'
      });
    } catch (error) {
      console.error('Cancel registration error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel registration',
        error: error.message 
      });
    }
  },

  // Get activity participants
  getActivityParticipants: async (req, res) => {
    try {
      const { id } = req.params;

      const participants = await prisma.activityRecord.findMany({
        where: { activityId: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              realName: true,
              avatar: true
            }
          }
        },
        orderBy: { registeredAt: 'desc' }
      });

      res.json({
        success: true,
        data: participants
      });
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get participants',
        error: error.message 
      });
    }
  },

  // Cancel or restore activity
  cancelActivity: async (req, res) => {
    try {
      const { id } = req.params;

      // 获取当前活动状态
      const activity = await prisma.activity.findUnique({
        where: { id: parseInt(id) }
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      // 切换状态：如果是已取消则恢复为计划中，否则取消
      const newStatus = activity.status === 'CANCELLED' ? 'PLANNED' : 'CANCELLED';

      const updatedActivity = await prisma.activity.update({
        where: { id: parseInt(id) },
        data: { status: newStatus }
      });

      res.json({
        success: true,
        message: newStatus === 'CANCELLED' ? 'Activity cancelled' : 'Activity restored',
        data: updatedActivity
      });
    } catch (error) {
      console.error('Cancel activity error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel activity',
        error: error.message
      });
    }
  }
};

module.exports = activityController;
