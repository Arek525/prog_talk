const express = require('express');
const router = express.Router();

const topicController = require('../controllers/topic.controller');
const { requireActive } = require('../middleware/auth.middleware');

router.post('/', requireActive, topicController.createRootTopic);
router.post('/:id/subtopics', requireActive, topicController.createSubtopic);
router.patch('/:id', requireActive, topicController.updateTopic);

router.get('/', requireActive, topicController.getRootTopics);
router.get('/:id', requireActive, topicController.getTopic);
router.get('/:id/tree', requireActive, topicController.getTopicTree);
router.get('/:id/subtopics', requireActive, topicController.getSubtopics);
router.get('/:id/blocks', requireActive, topicController.listBlockedUsers);

module.exports = router;
