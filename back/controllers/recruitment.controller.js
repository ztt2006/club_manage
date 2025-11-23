const prisma = require('../config/prisma');

const recruitmentController = {
  // Get all recruitments
  getAllRecruitments: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, clubId, status } = req.query;
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

      const [recruitments, total] = await Promise.all([
        prisma.recruitment.findMany({
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
            creator: {
              select: {
                id: true,
                realName: true
              }
            },
            _count: {
              select: { applications: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.recruitment.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          recruitments,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all recruitments error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get recruitments',
        error: error.message 
      });
    }
  },

  // Get recruitment by ID
  getRecruitmentById: async (req, res) => {
    try {
      const { id } = req.params;

      const recruitment = await prisma.recruitment.findUnique({
        where: { id: parseInt(id) },
        include: {
          club: {
            select: {
              id: true,
              name: true,
              logo: true,
              description: true
            }
          },
          creator: {
            select: {
              id: true,
              realName: true
            }
          },
          applications: {
            include: {
              recruitment: false
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!recruitment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Recruitment not found' 
        });
      }

      res.json({
        success: true,
        data: recruitment
      });
    } catch (error) {
      console.error('Get recruitment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get recruitment',
        error: error.message 
      });
    }
  },

  // Create recruitment
  createRecruitment: async (req, res) => {
    try {
      const { clubId, title, description, requirements, positions, startDate, endDate } = req.body;

      const recruitment = await prisma.recruitment.create({
        data: {
          clubId: parseInt(clubId),
          title,
          description,
          requirements,
          positions: positions || 10,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          createdBy: req.user.id
        },
        include: {
          club: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Recruitment created successfully',
        data: recruitment
      });
    } catch (error) {
      console.error('Create recruitment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create recruitment',
        error: error.message 
      });
    }
  },

  // Update recruitment
  updateRecruitment: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, requirements, positions, startDate, endDate } = req.body;

      const recruitment = await prisma.recruitment.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          requirements,
          positions,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined
        }
      });

      res.json({
        success: true,
        message: 'Recruitment updated successfully',
        data: recruitment
      });
    } catch (error) {
      console.error('Update recruitment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update recruitment',
        error: error.message 
      });
    }
  },

  // Delete recruitment
  deleteRecruitment: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.recruitment.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Recruitment deleted successfully'
      });
    } catch (error) {
      console.error('Delete recruitment error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete recruitment',
        error: error.message 
      });
    }
  },

  // Update recruitment status
  updateRecruitmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const recruitment = await prisma.recruitment.update({
        where: { id: parseInt(id) },
        data: { status }
      });

      res.json({
        success: true,
        message: 'Recruitment status updated successfully',
        data: recruitment
      });
    } catch (error) {
      console.error('Update recruitment status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update recruitment status',
        error: error.message 
      });
    }
  }
};

module.exports = recruitmentController;
