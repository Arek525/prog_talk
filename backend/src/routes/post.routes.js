const express = require('express');
const router = express.Router();

const postController = require('../controllers/post.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post(
    '/topics/:id/posts',
    requireAuth,
    postController.createPost
);

router.get(
    '/topics/:id/posts',
    requireAuth,
    postController.listPosts
);

router.get(
    '/posts/:id',
    requireAuth,
    postController.getPost
);

router.delete(
    '/posts/:id',
    requireAuth,
    postController.deletePost
);

router.post(
    '/posts/:id/like',
    requireAuth,
    postController.likePost
);

router.delete(
    '/posts/:id/like',
    requireAuth,
    postController.unlikePost
);

module.exports = router;
