const Topic = require('../models/Topic.model');

async function getParenChain(topicId){
    const chain = [];
    let current = await Topic.findById(topicId);

    while(current){
        chain.push(current._id);
        if(!current.parentId) break;
        current = await Topic.findById(current.parentId);
    }

    return chain;
}

// possibly for later statistics use
async function getSubtreeTopicIds(topicId){
    const result = [topicId];

    async function dfs(id){
        const children = await Topic.find({parentId: id});
        for (const child of children){
            result.push(child._id);
            await dfs(child._id)
        }
    }

    await dfs(topicId);
    return result;
}

module.exports = {
    getParenChain,
    getSubtreeTopicIds
};