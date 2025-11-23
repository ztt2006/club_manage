const prisma = require('../config/prisma');

const commentController = {
  // 获取评论列表
  getComments: async (req, res) => {
    try {
      const { targetType, targetId, page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      if (!targetType || !targetId) {
        return res.status(400).json({ 
          success: false, 
          message: '缺少必要参数' 
        });
      }

      const where = {
        targetType,
        targetId: parseInt(targetId),
        parentId: null // 只获取顶级评论
      };

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            user: {
              select: {
                id: true,
                username: true,
                realName: true,
                avatar: true
              }
            },
            replies: {
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
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.comment.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          comments,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取评论失败',
        error: error.message 
      });
    }
  },

  // 创建评论
  createComment: async (req, res) => {
    try {
      const { content, targetType, targetId, parentId, rating } = req.body;

      const data = {
        content,
        targetType,
        targetId: parseInt(targetId),
        userId: req.user.id,
        parentId: parentId ? parseInt(parentId) : null,
        rating: rating ? parseInt(rating) : null
      };

      // 根据targetType设置关联字段
      if (targetType === 'ACTIVITY') {
        data.activityId = parseInt(targetId);
      } else if (targetType === 'CLUB') {
        data.clubId = parseInt(targetId);
      }

      const comment = await prisma.comment.create({
        data,
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
        message: '评论成功',
        data: comment
      });
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ 
        success: false, 
        message: '评论失败',
        error: error.message 
      });
    }
  },

  // 更新评论
  updateComment: async (req, res) => {
    try {
      const { id } = req.params;
      const { content, rating } = req.body;

      // 确保只能更新自己的评论
      const existingComment = await prisma.comment.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingComment) {
        return res.status(404).json({ 
          success: false, 
          message: '评论不存在' 
        });
      }

      if (existingComment.userId !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          message: '无权限修改此评论' 
        });
      }

      const comment = await prisma.comment.update({
        where: { id: parseInt(id) },
        data: { content, rating }
      });

      res.json({
        success: true,
        message: '评论已更新',
        data: comment
      });
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ 
        success: false, 
        message: '更新评论失败',
        error: error.message 
      });
    }
  },

  // 删除评论
  deleteComment: async (req, res) => {
    try {
      const { id } = req.params;

      // 确保只能删除自己的评论
      const existingComment = await prisma.comment.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingComment) {
        return res.status(404).json({ 
          success: false, 
          message: '评论不存在' 
        });
      }

      if (existingComment.userId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ 
          success: false, 
          message: '无权限删除此评论' 
        });
      }

      await prisma.comment.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: '评论已删除'
      });
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ 
        success: false, 
        message: '删除评论失败',
        error: error.message 
      });
    }
  },

  // 获取平均评分
  getAverageRating: async (req, res) => {
    try {
      const { targetType, targetId } = req.query;

      const result = await prisma.comment.aggregate({
        where: {
          targetType,
          targetId: parseInt(targetId),
          rating: { not: null }
        },
        _avg: {
          rating: true
        },
        _count: {
          rating: true
        }
      });

      res.json({
        success: true,
        data: {
          averageRating: result._avg.rating || 0,
          totalRatings: result._count.rating
        }
      });
    } catch (error) {
      console.error('Get average rating error:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取评分失败',
        error: error.message 
      });
    }
  }
};

module.exports = commentController;
