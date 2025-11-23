const prisma = require('../config/prisma');

const statisticsController = {
  // Get overview statistics
  getOverviewStats: async (req, res) => {
    try {
      const [
        totalUsers,
        activeUsers,
        totalClubs,
        activeClubs,
        totalActivities,
        upcomingActivities,
        totalRecruitments,
        openRecruitments
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.club.count(),
        prisma.club.count({ where: { status: 'ACTIVE' } }),
        prisma.activity.count(),
        prisma.activity.count({ 
          where: { 
            startTime: { gte: new Date() },
            status: { not: 'CANCELLED' }
          } 
        }),
        prisma.recruitment.count(),
        prisma.recruitment.count({ where: { status: 'OPEN' } })
      ]);

      res.json({
        success: true,
        data: {
          users: { total: totalUsers, active: activeUsers },
          clubs: { total: totalClubs, active: activeClubs },
          activities: { total: totalActivities, upcoming: upcomingActivities },
          recruitments: { total: totalRecruitments, open: openRecruitments }
        }
      });
    } catch (error) {
      console.error('Get overview stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get overview statistics',
        error: error.message 
      });
    }
  },

  // Get club statistics
  getClubStats: async (req, res) => {
    try {
      const clubs = await prisma.club.findMany({
        include: {
          _count: {
            select: {
              members: true,
              activities: true,
              recruitments: true
            }
          }
        },
        orderBy: {
          members: {
            _count: 'desc'
          }
        },
        take: 10
      });

      const categoryStats = await prisma.club.groupBy({
        by: ['category'],
        _count: true
      });

      res.json({
        success: true,
        data: {
          topClubs: clubs,
          categoryDistribution: categoryStats
        }
      });
    } catch (error) {
      console.error('Get club stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get club statistics',
        error: error.message 
      });
    }
  },

  // Get activity statistics
  getActivityStats: async (req, res) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [
        recentActivities,
        statusStats,
        participationStats
      ] = await Promise.all([
        prisma.activity.count({
          where: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }),
        prisma.activity.groupBy({
          by: ['status'],
          _count: true
        }),
        prisma.activityRecord.groupBy({
          by: ['status'],
          _count: true
        })
      ]);

      const topActivities = await prisma.activity.findMany({
        include: {
          club: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: { records: true }
          }
        },
        orderBy: {
          records: {
            _count: 'desc'
          }
        },
        take: 10
      });

      res.json({
        success: true,
        data: {
          recentCount: recentActivities,
          statusDistribution: statusStats,
          participationDistribution: participationStats,
          topActivities
        }
      });
    } catch (error) {
      console.error('Get activity stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get activity statistics',
        error: error.message 
      });
    }
  },

  // Get user statistics
  getUserStats: async (req, res) => {
    try {
      const [
        roleStats,
        statusStats,
        recentUsers
      ] = await Promise.all([
        prisma.user.groupBy({
          by: ['role'],
          _count: true
        }),
        prisma.user.groupBy({
          by: ['status'],
          _count: true
        }),
        prisma.user.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const activeUsers = await prisma.user.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          _count: {
            select: {
              clubMembers: true,
              activities: true
            }
          }
        },
        orderBy: {
          clubMembers: {
            _count: 'desc'
          }
        },
        take: 10,
        select: {
          id: true,
          username: true,
          realName: true,
          avatar: true,
          _count: true
        }
      });

      res.json({
        success: true,
        data: {
          roleDistribution: roleStats,
          statusDistribution: statusStats,
          recentRegistrations: recentUsers,
          mostActiveUsers: activeUsers
        }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get user statistics',
        error: error.message 
      });
    }
  },

  // Get recruitment statistics
  getRecruitmentStats: async (req, res) => {
    try {
      const [
        statusStats,
        recentRecruitments
      ] = await Promise.all([
        prisma.recruitment.groupBy({
          by: ['status'],
          _count: true
        }),
        prisma.recruitment.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const topRecruitments = await prisma.recruitment.findMany({
        include: {
          club: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: {
          applications: {
            _count: 'desc'
          }
        },
        take: 10
      });

      const applicationStats = await prisma.application.groupBy({
        by: ['status'],
        _count: true
      });

      res.json({
        success: true,
        data: {
          statusDistribution: statusStats,
          recentCount: recentRecruitments,
          topRecruitments,
          applicationDistribution: applicationStats
        }
      });
    } catch (error) {
      console.error('Get recruitment stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get recruitment statistics',
        error: error.message 
      });
    }
  }
};

module.exports = statisticsController;
