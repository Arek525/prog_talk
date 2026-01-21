const express = require('express');
const router = express.Router();

const moderatorController = require('../controllers/moderator.controller');
const { requireActive } = require('../middleware/auth.middleware');

router.post(
  '/topics/:id/moderators',
  requireActive,
  moderatorController.addModerator
);

router.delete(
  '/topics/:id/moderators/:userId',
  requireActive,
  moderatorController.removeModerator
);

router.get(
  '/topics/:id/moderators',
  requireActive,
  moderatorController.listModerators
);

router.post(
  '/topics/:id/blocks',
  requireActive,
  moderatorController.blockUser
);

router.delete(
  '/topics/:id/blocks/:userId',
  requireActive,
  moderatorController.unblockUser
);

module.exports = router;
