const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const {requireAuth, requireAdmin}  = require('../middleware/auth.middleware');

router.use(requireAuth, requireAdmin);

router.get('/users/pending', adminController.getPendingUsers);
router.post('/users/:id/approve', adminController.approveUser);
router.post('/users/:id/ban', adminController.banUser);

router.post('/topics/:id/close', adminController.closeTopic);
router.post('/topics/:id/hide', adminController.hideTopic);

module.exports = router;
