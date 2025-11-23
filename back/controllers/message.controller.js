const prisma = require('../config/prisma');

const messageController = {
  // 获取收到的消息列表
  getReceivedMessages: async (req, res) => {
    try {
      const { page = 1, limit = 20, isRead } = req.query;
      const skip = (page - 1) * limit;

      const where = { receiverId: req.user.id };
      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                realName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.message.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get received messages error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取消息失败',
        error: error.message 
      });
    }
  },

  // 获取发送的消息列表
  getSentMessages: async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { senderId: req.user.id },
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            receiver: {
              select: {
                id: true,
                username: true,
                realName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.message.count({ where: { senderId: req.user.id } })
      ]);

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get sent messages error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取消息失败',
        error: error.message 
      });
    }
  },

  // 获取消息详情
  getMessageById: async (req, res) => {
    try {
      const { id } = req.params;

      const message = await prisma.message.findUnique({
        where: { id: parseInt(id) },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              realName: true,
              avatar: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true,
              realName: true,
              avatar: true
            }
          }
        }
      });

      if (!message) {
        return res.status(404).json({ 
          success: false, 
          message: '消息不存在' 
        });
      }

      // 如果是接收者查看，自动标记为已读
      if (message.receiverId === req.user.id && !message.isRead) {
        await prisma.message.update({
          where: { id: parseInt(id) },
          data: { 
            isRead: true,
            readAt: new Date()
          }
        });
        message.isRead = true;
        message.readAt = new Date();
      }

      res.json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Get message error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取消息失败',
        error: error.message 
      });
    }
  },

  // 发送消息
  sendMessage: async (req, res) => {
    try {
      const { receiverId, subject, content } = req.body;

      if (parseInt(receiverId) === req.user.id) {
        return res.status(400).json({ 
          success: false, 
          message: '不能给自己发送消息' 
        });
      }

      const message = await prisma.message.create({
        data: {
          senderId: req.user.id,
          receiverId: parseInt(receiverId),
          subject,
          content
        },
        include: {
          receiver: {
            select: {
              id: true,
              username: true,
              realName: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: '消息发送成功',
        data: message
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ 
        success: false, 
        message: '发送消息失败',
        error: error.message 
      });
    }
  },

  // 删除消息
  deleteMessage: async (req, res) => {
    try {
      const { id } = req.params;

      const message = await prisma.message.findUnique({
        where: { id: parseInt(id) }
      });

      if (!message) {
        return res.status(404).json({ 
          success: false, 
          message: '消息不存在' 
        });
      }

      // 只有发送者和接收者可以删除
      if (message.senderId !== req.user.id && message.receiverId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: '无权限删除此消息' 
        });
      }

      await prisma.message.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: '消息已删除'
      });
    } catch (error) {
      console.error('Delete message error:', error);
      res.status(500).json({ 
        success: false, 
        message: '删除消息失败',
        error: error.message 
      });
    }
  },

  // 获取未读消息数量
  getUnreadCount: async (req, res) => {
    try {
      const count = await prisma.message.count({
        where: { 
          receiverId: req.user.id,
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

module.exports = messageController;
