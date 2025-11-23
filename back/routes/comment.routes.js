const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const { auth } = require('../middleware/auth.middleware');

router.get('/', commentController.getComments);
router.get('/rating', commentController.getAverageRating);
router.post('/', auth, commentController.createComment);
router.put('/:id', auth, commentController.updateComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;
