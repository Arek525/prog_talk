const Post = require('../models/Post.model');
const Like = require('../models/Like.model');
const Topic = require('../models/Topic.model');
const {isUserBlocked} = require('./permissions.service');
const { getIO } = require('../socket/io');

function emitPostChanged(topicId){
    const io = getIO();
    if(io) io.to(String(topicId)).emit('post:changed');
}


async function createPost(userId, topicId, data){
    const topic = await Topic.findById(topicId); 
    if (!topic) throw new Error('Topic not found');

    if (topic.isClosed) {
        throw new Error('Topic is closed');
    }

    if (topic.isHidden) {
        throw new Error('Topic is hidden');
    }

    if(await isUserBlocked(userId, topicId)){
        throw new Error('User is blocked in this topic');
    }

    const allowedTags = topic.tags || [];

    const invalidTags = (data.tags ||  []).filter(
        t => !allowedTags.includes(t)
    )

    if(invalidTags.length){
        throw new Error('Invalid tags for this topic');
    }

    let replyTo = null;
    if(data.replyTo){

        const parent = await Post.findById(data.replyTo);
        if(!parent) throw new Error('Parent post not found');

        if(String(parent.topicId) !== String(topicId)){
            throw new Error('Invalid reply target');
        }

        if(parent.deletedAt) throw new Error('Parent post deleted');
        replyTo = parent._id;
    }

    const post = await Post.create({
        topicId,
        authorId: userId,
        content: data.content,
        tags: data.tags || [],
        replyTo
    })

    emitPostChanged(topicId);

    return post;
}

async function listPosts(user, topicId, page, limit){
    const skip = (page - 1) * limit;
    const userId = user._id;

    const basefilter = { topicId };
    if (user.role !== 'ADMIN') {
        basefilter.deletedAt = null;
    }

    const topFilter = {...basefilter, replyTo: null};

    const [topPosts, total] = await Promise.all([
        Post.find(topFilter)
            .sort({createdAt: 1})
            .skip(skip)
            .limit(limit),
        Post.countDocuments(topFilter)
    ]);

    const topIds = topPosts.map(p => p._id);

    const replies = topIds.length
        ? await Post.find({
            ...basefilter,
            replyTo: {$in: topIds}
        }).sort({createdAt: 1})
        : [];

    const allPosts = [...topPosts, ...replies];

    const postIds = allPosts.map(p => p._id);

    const likes = await Like.find({
        postId: { $in: postIds }
    });

    const likesByPost = {};
    for (const l of likes){
        const pid = String(l.postId);
        likesByPost[pid] ??= { count: 0, users: [] };
        likesByPost[pid].count++;
        likesByPost[pid].users.push(String(l.userId));
    }

    const items = allPosts.map(p => {
        const id = String(p._id);
        const data = p.toObject();
        const like = likesByPost[id];
        data.likesCount = like?.count || 0;
        data.likedByMe = (like?.users || []).includes(String(userId));
        return data;
    });

    return {
        items,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
    };
}

async function getPost(postId){
    const post = await Post.findById(postId);
    if(!post || post.deletedAt){
        throw new Error('Post not found');
    }

    return post;
}

async function deletePost(userId, postId){
    const post = await Post.findById(postId);
    if(!post){
        throw new Error('Post not found');
    }

    if(!post.authorId.equals(userId)){
        throw new Error('Cannot delete posts that are not yours')
    }

    post.deletedAt = new Date();
    await post.save();

    emitPostChanged(post.topicId);
}

async function likePost(userId, postId){
    try{
        await Like.create({
            postId,
            userId
        });
    } catch(err){
        throw new Error('Already liked');
    }

    const post = await Post.findById(postId);
    if(!post) return;

    emitPostChanged(post.topicId);

}

async function unlikePost(userId, postId){
    await Like.deleteOne({
        postId,
        userId
    });

    const post = await Post.findById(postId);
    if(!post) return;

    emitPostChanged(post.topicId);
}

module.exports = {
    createPost,
    listPosts,
    getPost,
    deletePost,
    likePost,
    unlikePost,
}
