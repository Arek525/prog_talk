const TopicBlock = require('../models/TopicBlock.model');
const topicService = require('../services/topic.service');

async function createRootTopic(req, res){
    try{
        const topic = await topicService.createRootTopic(
            req.user._id,
            req.body
        );
        res.status(201).json(topic);
    } catch(err){
        if (err?.code === 11000) {
            return res.status(409).json({ error: 'Root topic with this title already exists' });
        }
        res.status(400).json({error: err.message});
    }
}

async function createSubtopic(req, res){
    try{
        const topic = await topicService.createSubtopic(
            req.user._id,
            req.params.id,
            req.body
        );
        res.status(201).json(topic);
    } catch(err){
        if (err?.code === 11000) {
            return res.status(409).json({ error: 'Subtopic with this title already exists in this subtopic' });
        }
        res.status(403).json({error: err.message});
    }
}

async function updateTopic(req, res){
    try{
        const topic = await topicService.updateTopic(
            req.user._id,
            req.params.id,
            req.body
        );
        res.json(topic);
    } catch(err){
        res.status(403).json({error: err.message});
    }
}

async function getRootTopics(req, res){
    const topics = await topicService.getRootTopics(req.user);
    res.json(topics);
}

async function getTopic(req, res){
    const topic = await topicService.getTopic(req.user, req.params.id);
    if(!topic) return res.status(404).json({error: 'Not found'});
    res.json(topic);
}

async function getTopicTree(req, res){
    const tree = await topicService.getTopicTree(req.user, req.params.id);
    res.json(tree)
}

async function getSubtopics(req, res){
    try{
        const topics = await topicService.getSubtopics(
            req.user,
            req.params.id
        );
        res.json(topics);
    } catch(err){
        res.status(404).json({error: err.message});
    }
}

async function listBlockedUsers(req, res){
    const blocks = await TopicBlock.find({
        topicId: req.params.id,
    }).populate('userId', 'email');

    res.json(
        blocks.map(b => ({
            userId: b.userId._id,
            email: b.userId.email
        }))
    );
}

module.exports = {
  createRootTopic,
  createSubtopic,
  updateTopic,
  getRootTopics,
  getTopic,
  getTopicTree,
  getSubtopics,
  listBlockedUsers
};
