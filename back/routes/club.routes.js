const express = require('express');
const router = express.Router();
const clubController = require('../controllers/club.controller');
const { auth, checkRole, checkClubRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClubById);
router.post('/', auth, checkRole('ADMIN', 'SUPER_ADMIN'), clubController.createClub);
router.put('/:id', auth, clubController.updateClub);
router.delete('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), clubController.deleteClub);
router.post('/:id/logo', auth, checkClubRole('PRESIDENT', 'VICE_PRESIDENT'), upload.single('logo'), clubController.uploadLogo);
router.get('/:id/members', clubController.getClubMembers);

module.exports = router;
