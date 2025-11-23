const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

router.get('/recruitment/:recruitmentId', auth, checkRole('ADMIN', 'SUPER_ADMIN'), applicationController.getApplicationsByRecruitment);
router.get('/:id', applicationController.getApplicationById);
router.post('/', applicationController.createApplication);
router.put('/:id/review', auth, checkRole('ADMIN', 'SUPER_ADMIN'), applicationController.reviewApplication);
router.delete('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), applicationController.deleteApplication);

module.exports = router;
