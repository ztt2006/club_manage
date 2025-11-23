const prisma = require('../config/prisma');

const activityRecordController = {
  // Check in activity participant
  checkIn: async (req, res) => {
    try {
      const { id } = req.params;

      // 获取记录信息
      const record = await prisma.activityRecord.findUnique({
        where: { id: parseInt(id) },
        include: {
          activity: true,
          user: true
        }
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Activity record not found'
        });
      }

      // 更新签到状态
      const updatedRecord = await prisma.activityRecord.update({
        where: { id: parseInt(id) },
        data: {
          status: 'CHECKED_IN',
          checkedInAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              realName: true,
              email: true,
              phone: true
            }
          }
        }
      });

      // 可以发送通知
      try {
        await prisma.notification.create({
          data: {
            userId: record.userId,
            title: '活动签到成功',
            content: `您已成功签到活动：${record.activity.title}`,
            type: 'ACTIVITY',
            relatedId: record.activityId
          }
        });
      } catch (err) {
        console.log('Notification creation failed:', err);
      }

      res.json({
        success: true,
        message: 'Check-in successful',
        data: updatedRecord
      });
    } catch (error) {
      console.error('Check-in error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check in',
        error: error.message
      });
    }
  },

  // Delete activity record (cancel registration)
  deleteRecord: async (req, res) => {
    try {
      const { id } = req.params;

      // 获取记录信息
      const record = await prisma.activityRecord.findUnique({
        where: { id: parseInt(id) },
        include: {
          activity: true,
          user: true
        }
      });

      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Activity record not found'
        });
      }

      // 删除记录
      await prisma.activityRecord.delete({
        where: { id: parseInt(id) }
      });

      // 可以发送通知
      try {
        await prisma.notification.create({
          data: {
            userId: record.userId,
            title: '活动报名已取消',
            content: `您的活动报名已被取消：${record.activity.title}`,
            type: 'ACTIVITY',
            relatedId: record.activityId
          }
        });
      } catch (err) {
        console.log('Notification creation failed:', err);
      }

      res.json({
        success: true,
        message: 'Registration cancelled successfully'
      });
    } catch (error) {
      console.error('Delete record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel registration',
        error: error.message
      });
    }
  }
};

module.exports = activityRecordController;
