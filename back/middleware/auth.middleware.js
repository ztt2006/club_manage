const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        realName: true,
        role: true,
        status: true
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }
};

const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    next();
  };
};

const checkClubRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const clubId = parseInt(req.params.clubId || req.body.clubId);
      
      if (!clubId) {
        return res.status(400).json({ success: false, message: 'Club ID is required' });
      }

      const membership = await prisma.clubMember.findUnique({
        where: {
          clubId_userId: {
            clubId: clubId,
            userId: req.user.id
          }
        }
      });

      if (!membership || !roles.includes(membership.role)) {
        return res.status(403).json({ success: false, message: 'Insufficient club permissions' });
      }

      req.clubMembership = membership;
      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error checking club permissions' });
    }
  };
};

module.exports = { auth, checkRole, checkClubRole };
