const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', auth, checkRole('ADMIN', 'SUPER_ADMIN'), userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, checkRole('ADMIN', 'SUPER_ADMIN'), userController.deleteUser);
router.put('/:id/status', auth, checkRole('ADMIN', 'SUPER_ADMIN'), userController.updateUserStatus);
router.put('/:id/role', auth, checkRole('SUPER_ADMIN'), userController.updateUserRole);
router.post('/avatar', auth, upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
