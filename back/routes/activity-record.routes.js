const express = require('express');
const router = express.Router();
const activityRecordController = require('../controllers/activity-record.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

// 签到（管理员）
router.put('/:id/checkin', auth, checkRole('ADMIN', 'SUPER_ADMIN'), activityRecordController.checkIn);

// 删除报名记录（管理员）
router.delete('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), activityRecordController.deleteRecord);

module.exports = router;
