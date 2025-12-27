const express = require('express');
const router = express.Router();

const topicController = require('../controllers/topic.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, topicController.createRootTopic);
router.post('/:id/subtopics', requireAuth, topicController.createSubtopic);
router.patch('/:id', requireAuth, topicController.updateTopic);

router.get('/', topicController.getRootTopics);
router.get('/:id', topicController.getTopic);
router.get('/:id/tree', topicController.getTopicTree);

module.exports = router;
