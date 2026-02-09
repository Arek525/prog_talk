const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const {requireActive, requireAdmin}  = require('../middleware/auth.middleware');

router.use(requireActive, requireAdmin);

router.get('/users', adminController.getUsers);
router.post('/users/:id/approve', adminController.approveUser);
router.post('/users/:id/reject', adminController.rejectUser);
router.post('/users/:id/ban', adminController.banUser);
router.post('/users/:id/unban', adminController.unbanUser);


router.post('/topics/:id/close', adminController.closeTopic);
router.post('/topics/:id/hide', adminController.hideTopic);

router.get('/notifications', adminController.getNotifications);

module.exports = router;
