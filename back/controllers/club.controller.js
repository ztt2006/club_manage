const prisma = require('../config/prisma');

const clubController = {
  // Get all clubs
  getAllClubs: async (req, res) => {
    try {
      const { page = 1, limit = 10, search, category, status } = req.query;
      const skip = (page - 1) * limit;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ];
      }
      if (category) where.category = category;
      if (status) where.status = status;

      const [clubs, total] = await Promise.all([
        prisma.club.findMany({
          where,
          skip: parseInt(skip),
          take: parseInt(limit),
          include: {
            _count: {
              select: { members: true, activities: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.club.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          clubs,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get all clubs error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get clubs',
        error: error.message 
      });
    }
  },

  // Get club by ID
  getClubById: async (req, res) => {
    try {
      const { id } = req.params;

      const club = await prisma.club.findUnique({
        where: { id: parseInt(id) },
        include: {
          members: {
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
          },
          activities: {
            orderBy: { startTime: 'desc' },
            take: 10
          },
          _count: {
            select: { members: true, activities: true }
          }
        }
      });

      if (!club) {
        return res.status(404).json({ 
          success: false, 
          message: 'Club not found' 
        });
      }

      res.json({
        success: true,
        data: club
      });
    } catch (error) {
      console.error('Get club error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get club',
        error: error.message 
      });
    }
  },

  // Create club
  createClub: async (req, res) => {
    try {
      const { name, description, category, foundedDate, maxMembers } = req.body;

      const club = await prisma.club.create({
        data: {
          name,
          description,
          category,
          foundedDate: foundedDate ? new Date(foundedDate) : null,
          maxMembers: maxMembers || 100
        }
      });

      res.status(201).json({
        success: true,
        message: 'Club created successfully',
        data: club
      });
    } catch (error) {
      console.error('Create club error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to create club',
        error: error.message 
      });
    }
  },

  // Update club
  updateClub: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, category, foundedDate, maxMembers, status } = req.body;

      const club = await prisma.club.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          category,
          foundedDate: foundedDate ? new Date(foundedDate) : undefined,
          maxMembers,
          status
        }
      });

      res.json({
        success: true,
        message: 'Club updated successfully',
        data: club
      });
    } catch (error) {
      console.error('Update club error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to update club',
        error: error.message 
      });
    }
  },

  // Delete club
  deleteClub: async (req, res) => {
    try {
      const { id } = req.params;

      await prisma.club.delete({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        message: 'Club deleted successfully'
      });
    } catch (error) {
      console.error('Delete club error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete club',
        error: error.message 
      });
    }
  },

  // Upload logo
  uploadLogo: async (req, res) => {
    try {
      const { id } = req.params;

      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'No file uploaded' 
        });
      }

      const logoPath = `/uploads/logos/${req.file.filename}`;

      const club = await prisma.club.update({
        where: { id: parseInt(id) },
        data: { logo: logoPath }
      });

      res.json({
        success: true,
        message: 'Logo uploaded successfully',
        data: club
      });
    } catch (error) {
      console.error('Upload logo error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upload logo',
        error: error.message 
      });
    }
  },

  // Get club members
  getClubMembers: async (req, res) => {
    try {
      const { id } = req.params;

      const members = await prisma.clubMember.findMany({
        where: { clubId: parseInt(id) },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              realName: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { joinDate: 'desc' }
      });

      res.json({
        success: true,
        data: members
      });
    } catch (error) {
      console.error('Get club members error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get club members',
        error: error.message 
      });
    }
  }
};

module.exports = clubController;
