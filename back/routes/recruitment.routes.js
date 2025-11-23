const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitment.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

router.get('/', recruitmentController.getAllRecruitments);
router.get('/:id', recruitmentController.getRecruitmentById);
router.post('/', auth, checkRole('ADMIN', 'SUPER_ADMIN'), recruitmentController.createRecruitment);
router.put('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), recruitmentController.updateRecruitment);
router.delete('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), recruitmentController.deleteRecruitment);
router.put('/:id/status', auth, checkRole('ADMIN', 'SUPER_ADMIN'), recruitmentController.updateRecruitmentStatus);

module.exports = router;
