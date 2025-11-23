const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

router.get('/', announcementController.getAllAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.post('/', auth, checkRole('ADMIN', 'SUPER_ADMIN'), announcementController.createAnnouncement);
router.put('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), announcementController.updateAnnouncement);
router.delete('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), announcementController.deleteAnnouncement);

module.exports = router;
