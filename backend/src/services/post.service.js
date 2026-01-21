const Post = require('../models/Post.model');
const Like = require('../models/Like.model');
const Topic = require('../models/Topic.model');
const {isUserBlocked} = require('./permissions.service');
const { getIO } = require('../socket/io');


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

    const post = await Post.create({
        topicId,
        authorId: userId,
        content: data.content,
        codeSnippets: data.codeSnippets || [],
        tags: data.tags || [],
        references: data.references || [],
    })

    const io = getIO();
    if(io){
        io.to(String(topicId)).emit('post:changed', post);
    }

    return post;
}

async function listPosts(user, topicId, page, limit){
    const skip = (page - 1) * limit;
    const userId = user._id;

    const filter = { topicId };
    if (user.role !== 'ADMIN') {
        filter.deletedAt = null;
    }

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .sort({createdAt: 1})
            .skip(skip)
            .limit(limit),
        Post.countDocuments(filter)
    ]);

    const postIds = posts.map(p => p._id);

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

    const items = posts.map(p => {
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

    const io = getIO();
    if(io){
        io.to(String(post.topicId)).emit('post:changed');
    }
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

    const io = getIO();
    io.to(String(post.topicId)).emit('post:changed')
}

async function unlikePost(userId, postId){
    await Like.deleteOne({
        postId,
        userId
    });

    const post = await Post.findById(postId);
    if(!post) return;

    const io = getIO();
    if(io){
        io.to(String(post.topicId)).emit('post:changed');
    }
}

module.exports = {
    createPost,
    listPosts,
    getPost,
    deletePost,
    likePost,
    unlikePost,
}
