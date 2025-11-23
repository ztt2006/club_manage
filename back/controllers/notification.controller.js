const prisma = require('../config/prisma');

const notificationController = {
  // 获取我的通知列表
  getMyNotifications: async (req, res) => {
    try {
      const { page = 1, limit = 20, isRead } = req.query;
      const skip = (page - 1) * limit;

      const where = { userId: req.user.id };
      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.notification.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取通知失败',
        error: error.message 
      });
    }
  },

  // 标记通知为已读
  markAsRead: async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await prisma.notification.update({
        where: { 
          id: parseInt(id),
          userId: req.user.id 
        },
        data: { isRead: true }
      });

      res.json({
        success: true,
        message: '已标记为已读',
        data: notification
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      res.status(500).json({ 
        success: false, 
        message: '操作失败',
        error: error.message 
      });
    }
  },

  // 标记所有通知为已读
  markAllAsRead: async (req, res) => {
    try {
      await prisma.notification.updateMany({
        where: { 
          userId: req.user.id,
          isRead: false 
        },
        data: { isRead: true }
      });

      res.json({
        success: true,
        message: '已标记所有通知为已读'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
      res.status(500).json({ 
        success: false, 
        message: '操作失败',
        error: error.message 
      });
    }
  },

  // 删除通知
  deleteNotification: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.notification.delete({
        where: { 
          id: parseInt(id),
          userId: req.user.id 
        }
      });

      res.json({
        success: true,
        message: '通知已删除'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({ 
        success: false, 
        message: '删除失败',
        error: error.message 
      });
    }
  },

  // 获取未读通知数量
  getUnreadCount: async (req, res) => {
    try {
      const count = await prisma.notification.count({
        where: { 
          userId: req.user.id,
          isRead: false 
        }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取失败',
        error: error.message 
      });
    }
  }
};

module.exports = notificationController;
