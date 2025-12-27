const Post = require('../models/Post.model');
const Like = require('../models/Like.model');
const Topic = require('../models/Topic.model');
const {isUserBlocked} = require('./permissions.service');

async function createPost(userId, topicId, data){
    if(await isUserBlocked(userId, topicId)){
        throw new Error('User is blocked in this topic');
    }

    const post = await Post.create({
        topicId,
        authorId: userId,
        content: data.content,
        codeSnippets: data.codeSnippets || [],
        references: data.references || [],
    })

    return post;
}

async function listPosts(topicId, page, limit){
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.find({
            topicId,
            deletedAt: null
        })
        .sort({createdAt: 1})
        .skip(skip)
        .limit(limit),

        Post.countDocuments({
            topicId,
            deletedAt: null
        })
    ]);

    return {
        items: posts,
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
}

async function unlikePost(userId, postId){
    await Like.deleteOne({
        postId,
        userId
    });
}

module.exports = {
    createPost,
    listPosts,
    getPost,
    deletePost,
    likePost,
    unlikePost,
};
