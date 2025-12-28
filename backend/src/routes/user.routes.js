const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/me', requireAuth, userController.getMe);
router.patch('/me', requireAuth, userController.updateMe);

module.exports = router;