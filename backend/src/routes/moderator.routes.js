const express = require('express');
const router = express.Router();

const moderatorController = require('../controllers/moderator.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post(
  '/topics/:id/moderators',
  requireAuth,
  moderatorController.addModerator
);

router.delete(
  '/topics/:id/moderators/:userId',
  requireAuth,
  moderatorController.removeModerator
);

router.post(
  '/topics/:id/blocks',
  requireAuth,
  moderatorController.blockUser
);

router.delete(
  '/topics/:id/blocks/:userId',
  requireAuth,
  moderatorController.unblockUser
);

module.exports = router;
