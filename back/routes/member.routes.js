const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const { auth, checkClubRole } = require('../middleware/auth.middleware');

// 普通用户可以自己加入社团，不需要社团角色权限
router.post('/', auth, memberController.addMember);
router.delete('/:id', auth, memberController.removeMember);
router.put('/:id/role', auth, checkClubRole('PRESIDENT', 'VICE_PRESIDENT'), memberController.updateMemberRole);
router.put('/:id/status', auth, checkClubRole('PRESIDENT', 'VICE_PRESIDENT'), memberController.updateMemberStatus);
router.get('/my-clubs', auth, memberController.getMyClubs);

module.exports = router;
