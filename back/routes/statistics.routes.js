const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

router.get('/overview', auth, checkRole('ADMIN', 'SUPER_ADMIN'), statisticsController.getOverviewStats);
router.get('/clubs', auth, statisticsController.getClubStats);
router.get('/activities', auth, statisticsController.getActivityStats);
router.get('/users', auth, checkRole('ADMIN', 'SUPER_ADMIN'), statisticsController.getUserStats);
router.get('/recruitments', auth, statisticsController.getRecruitmentStats);

module.exports = router;
