const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { requireActive } = require('../middleware/auth.middleware');

router.get('/me', requireActive, userController.getMe);
router.patch('/me', requireActive, userController.updateMe);
router.get('/', requireActive, userController.listUsers);

module.exports = router;