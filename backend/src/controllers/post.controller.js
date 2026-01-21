const postService = require('../services/post.service');

async function createPost(req, res){
    try{
        const post = await postService.createPost(
            req.user._id,
            req.params.id,
            req.body
        );
        res.status(201).json(post);
    } catch(err){
        res.status(403).json({error: err.message});
    }
}

async function listPosts(req, res){
    try{
        const {page = 1, limit = 10} = req.query;

        const result = await postService.listPosts(
            req.user,
            req.params.id,
            Number(page),
            Number(limit),
        )

        res.json(result);
    } catch(err){
        res.status(403).json({error: err.message});
    }
}

async function getPost(req, res){
    try{
        const post = await postService.getPost(
            req.params.id
        );
        res.json(post)
    } catch(err){
        res.status(403).json({ error: err.message });
    }
}

async function deletePost(req, res) {
    try {
        await postService.deletePost(
            req.user._id,
            req.params.id
        );
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
}

async function likePost(req, res) {
    try {
        await postService.likePost(
            req.user._id,
            req.params.id
        );
        res.status(201).json({ message: 'Liked' });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
}

async function unlikePost(req, res) {
    try {
        await postService.unlikePost(
            req.user._id,
            req.params.id
        );
        res.json({ message: 'Unliked' });
    } catch (err) {
        res.status(403).json({ error: err.message });
    }
}

module.exports = {
    createPost,
    listPosts,
    getPost,
    deletePost,
    likePost,
    unlikePost,
};
