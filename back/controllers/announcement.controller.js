const prisma = require('../config/prisma');

const announcementController = {
  // 获取公告列表
  getAllAnnouncements: async (req, res) => {
    try {
      const { page = 1, limit = 10, type, clubId } = req.query;
      const skip = (page - 1) * limit;

      const where = { status: 'ACTIVE' };
      if (type) where.type = type;
      if (clubId) where.clubId = parseInt(clubId);

      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                realName: true
              }
            },
            club: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: [
            { isPinned: 'desc' },
            { createdAt: 'desc' }
          ]
        }),
        prisma.announcement.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          announcements,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get announcements error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取公告失败',
        error: error.message 
      });
    }
  },

  // 获取公告详情
  getAnnouncementById: async (req, res) => {
    try {
      const { id } = req.params;

      const announcement = await prisma.announcement.findUnique({
        where: { id: parseInt(id) },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              realName: true
            }
          },
          club: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });

      if (!announcement) {
        return res.status(404).json({ 
          success: false, 
          message: '公告不存在' 
        });
      }

      res.json({
        success: true,
        data: announcement
      });
    } catch (error) {
      console.error('Get announcement error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取公告失败',
        error: error.message 
      });
    }
  },

  // 创建公告
  createAnnouncement: async (req, res) => {
    try {
      const { title, content, type, clubId, priority, isPinned } = req.body;

      const announcement = await prisma.announcement.create({
        data: {
          title,
          content,
          type,
          clubId: clubId ? parseInt(clubId) : null,
          creatorId: req.user.id,
          priority: priority || 'NORMAL',
          isPinned: isPinned || false
        },
        include: {
          creator: {
            select: {
              id: true,
              realName: true
            }
          },
          club: true
        }
      });

      res.status(201).json({
        success: true,
        message: '公告创建成功',
        data: announcement
      });
    } catch (error) {
      console.error('Create announcement error:', error);
      res.status(500).json({ 
        success: false, 
        message: '创建公告失败',
        error: error.message 
      });
    }
  },

  // 更新公告
  updateAnnouncement: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, content, priority, isPinned, status } = req.body;

      const announcement = await prisma.announcement.update({
        where: { id: parseInt(id) },
        data: {
          title,
          content,
          priority,
          isPinned,
          status
        }
      });

      res.json({
        success: true,
        message: '公告更新成功',
        data: announcement
      });
    } catch (error) {
      console.error('Update announcement error:', error);
      res.status(500).json({ 
        success: false, 
        message: '更新公告失败',
        error: error.message 
      });
    }
  },

  // 删除公告
  deleteAnnouncement: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.announcement.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: '公告已删除'
      });
    } catch (error) {
      console.error('Delete announcement error:', error);
      res.status(500).json({ 
        success: false, 
        message: '删除公告失败',
        error: error.message 
      });
    }
  }
};

module.exports = announcementController;
