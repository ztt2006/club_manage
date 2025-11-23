const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { auth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', activityController.getAllActivities);
router.get('/:id', activityController.getActivityById);
router.post('/', auth, activityController.createActivity);
router.put('/:id', auth, activityController.updateActivity);
router.delete('/:id', auth, activityController.deleteActivity);
router.post('/:id/cover', auth, upload.single('cover'), activityController.uploadCover);
router.post('/:id/register', auth, activityController.registerActivity);
router.post('/:id/checkin', auth, activityController.checkinActivity);
router.put('/:id/cancel', auth, activityController.cancelActivity);
router.delete('/:id/cancel', auth, activityController.cancelRegistration);
router.get('/:id/participants', activityController.getActivityParticipants);

module.exports = router;
