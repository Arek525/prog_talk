const express = require('express');
const router = express.Router();

const postController = require('../controllers/post.controller');
const { requireActive } = require('../middleware/auth.middleware');

router.post(
    '/topics/:id/posts',
    requireActive,
    postController.createPost
);

router.get(
    '/topics/:id/posts',
    requireActive,
    postController.listPosts
);

router.get(
    '/posts/:id',
    requireActive,
    postController.getPost
);

router.delete(
    '/posts/:id',
    requireActive,
    postController.deletePost
);

router.post(
    '/posts/:id/like',
    requireActive,
    postController.likePost
);

router.delete(
    '/posts/:id/like',
    requireActive,
    postController.unlikePost
);

module.exports = router;
