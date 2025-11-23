const prisma = require('../config/prisma');

const applicationController = {
  // Get applications by recruitment
  getApplicationsByRecruitment: async (req, res) => {
    try {
      const { recruitmentId } = req.params;
      const { status } = req.query;

      const where = { recruitmentId: parseInt(recruitmentId) };
      if (status) where.status = status;

      const applications = await prisma.application.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });

      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Get applications error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get applications',
        error: error.message 
      });
    }
  },

  // Get application by ID
  getApplicationById: async (req, res) => {
    try {
      const { id } = req.params;

      const application = await prisma.application.findUnique({
        where: { id: parseInt(id) },
        include: {
          recruitment: {
            include: {
              club: {
                select: {
                  id: true,
                  name: true,
                  logo: true
                }
              }
            }
          }
        }
      });

      if (!application) {
        return res.status(404).json({ 
          success: false, 
          message: 'Application not found' 
        });
      }

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Get application error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get application',
        error: error.message 
      });
    }
  },

  // Create application
  createApplication: async (req, res) => {
    try {
      const { recruitmentId, applicantName, applicantEmail, applicantPhone, reason } = req.body;

      // Check if recruitment is open
      const recruitment = await prisma.recruitment.findUnique({
        where: { id: parseInt(recruitmentId) }
      });

      if (!recruitment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recruitment not found' 
        });
      }

      if (recruitment.status !== 'OPEN') {
        return res.status(400).json({ 
          success: false, 
          message: 'Recruitment is not open' 
        });
      }

      // Check if recruitment period is valid
      const now = new Date();
      if (now < recruitment.startDate || now > recruitment.endDate) {
        return res.status(400).json({ 
          success: false, 
          message: 'Recruitment period is not active' 
        });
      }

      const application = await prisma.application.create({
        data: {
          recruitmentId: parseInt(recruitmentId),
          applicantName,
          applicantEmail,
          applicantPhone,
          reason
        }
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application
      });
    } catch (error) {
      console.error('Create application error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit application',
        error: error.message 
      });
    }
  },

  // Review application
  reviewApplication: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reviewNote } = req.body;

      // 获取申请信息
      const existingApplication = await prisma.application.findUnique({
        where: { id: parseInt(id) },
        include: {
          recruitment: {
            include: {
              club: true
            }
          }
        }
      });

      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // 更新申请状态
      const application = await prisma.application.update({
        where: { id: parseInt(id) },
        data: {
          status,
          reviewNote,
          reviewedAt: new Date()
        }
      });

      // 如果申请被批准，自动将申请人添加到社团成员
      if (status === 'APPROVED') {
        // 检查是否已经是成员
        const existingMember = await prisma.clubMember.findFirst({
          where: {
            clubId: existingApplication.recruitment.clubId,
            user: {
              email: existingApplication.applicantEmail
            }
          }
        });

        if (!existingMember) {
          // 通过邮箱查找用户
          const user = await prisma.user.findUnique({
            where: { email: existingApplication.applicantEmail }
          });

          if (user) {
            // 添加为社团成员
            await prisma.clubMember.create({
              data: {
                clubId: existingApplication.recruitment.clubId,
                userId: user.id,
                role: 'MEMBER'
              }
            });

            // 可以发送通知（需要通知系统集成）
            await prisma.notification.create({
              data: {
                userId: user.id,
                title: '招新申请已通过',
                content: `恭喜！您已成功加入 ${existingApplication.recruitment.club.name}`,
                type: 'APPLICATION',
                relatedId: existingApplication.recruitmentId
              }
            }).catch(err => console.log('Notification creation failed:', err));
          }
        }
      }

      res.json({
        success: true,
        message: status === 'APPROVED' ? '申请已批准，申请人已加入社团' : '申请已审核',
        data: application
      });
    } catch (error) {
      console.error('Review application error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to review application',
        error: error.message 
      });
    }
  },

  // Delete application
  deleteApplication: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.application.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error) {
      console.error('Delete application error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete application',
        error: error.message 
      });
    }
  }
};

module.exports = applicationController;
