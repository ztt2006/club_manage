const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { auth } = require('../middleware/auth.middleware');

router.get('/', auth, notificationController.getMyNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/read-all', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;
