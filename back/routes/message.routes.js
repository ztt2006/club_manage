const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { auth } = require('../middleware/auth.middleware');

router.get('/received', auth, messageController.getReceivedMessages);
router.get('/sent', auth, messageController.getSentMessages);
router.get('/unread-count', auth, messageController.getUnreadCount);
router.get('/:id', auth, messageController.getMessageById);
router.post('/', auth, messageController.sendMessage);
router.delete('/:id', auth, messageController.deleteMessage);

module.exports = router;
