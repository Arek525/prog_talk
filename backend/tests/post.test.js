const { request } = require('./helpers');

const User = require('../src/models/User.model');
const Topic = require('../src/models/Topic.model');
const Post = require('../src/models/Post.model');
const Like = require('../src/models/Like.model');
const TopicBlock = require('../src/models/TopicBlock.model');

async function createUser(email) {
  const u = new User({ email, status: 'ACTIVE' });
  u.setPassword('password');
  await u.save();
  return u;
}

async function login(email) {
  const res = await request
    .post('/auth/login')
    .send({ email, password: 'password' });

  return res.headers['set-cookie'][0];
}

describe('Post API', () => {
  let founder;
  let user;
  let blockedUser;

  let founderCookie;
  let userCookie;
  let blockedCookie;

  let topic;
  let post;

  beforeEach(async () => {
    founder = await createUser('founder@test.com');
    user = await createUser('user@test.com');
    blockedUser = await createUser('blocked@test.com');

    founderCookie = await login('founder@test.com');
    userCookie = await login('user@test.com');
    blockedCookie = await login('blocked@test.com');

    const topicRes = await request
      .post('/topics')
      .set('Cookie', founderCookie)
      .send({ title: 'Topic' });

    topic = topicRes.body;

    await request
      .post(`/topics/${topic._id}/blocks`)
      .set('Cookie', founderCookie)
      .send({ userId: blockedUser._id });
  });

  it('allows user to create post', async () => {
    const res = await request
      .post(`/topics/${topic._id}/posts`)
      .set('Cookie', userCookie)
      .send({
        content: 'Hello world',
        codeSnippets: [{ language: 'js', code: 'console.log(1)' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe('Hello world');
    expect(res.body.codeSnippets.length).toBe(1);
  });

  it('rejects post creation for blocked user', async () => {
    const res = await request
      .post(`/topics/${topic._id}/posts`)
      .set('Cookie', blockedCookie)
      .send({ content: 'Blocked post' });

    expect(res.status).toBe(403);
  });

  it('allows blocked user to list posts', async () => {
    await Post.create({
      topicId: topic._id,
      authorId: user._id,
      content: 'Visible post',
    });

    const res = await request
      .get(`/topics/${topic._id}/posts`)
      .set('Cookie', blockedCookie);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
  });

  it('returns paginated posts', async () => {
    for (let i = 0; i < 15; i++) {
      await Post.create({
        topicId: topic._id,
        authorId: user._id,
        content: `Post ${i}`,
      });
    }

    const res = await request
      .get(`/topics/${topic._id}/posts?page=2&limit=5`)
      .set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(5);
    expect(res.body.page).toBe(2);
  });

  it('returns single post', async () => {
    post = await Post.create({
      topicId: topic._id,
      authorId: user._id,
      content: 'Single post',
    });

    const res = await request
      .get(`/posts/${post._id}`)
      .set('Cookie', userCookie);

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Single post');
  });

  it('soft deletes own post', async () => {
    post = await Post.create({
      topicId: topic._id,
      authorId: user._id,
      content: 'To delete',
    });

    const res = await request
      .delete(`/posts/${post._id}`)
      .set('Cookie', userCookie);

    expect(res.status).toBe(200);

    const deleted = await Post.findById(post._id);
    expect(deleted.deletedAt).not.toBeNull();
  });

  it('allows like and unlike', async () => {
    post = await Post.create({
      topicId: topic._id,
      authorId: user._id,
      content: 'Like me',
    });

    const likeRes = await request
      .post(`/posts/${post._id}/like`)
      .set('Cookie', userCookie);

    expect(likeRes.status).toBe(201);

    const like = await Like.findOne({
      postId: post._id,
      userId: user._id,
    });

    expect(like).not.toBeNull();

    const unlikeRes = await request
      .delete(`/posts/${post._id}/like`)
      .set('Cookie', userCookie);

    expect(unlikeRes.status).toBe(200);

    const after = await Like.findOne({
      postId: post._id,
      userId: user._id,
    });

    expect(after).toBeNull();
  });

  it('rejects double like', async () => {
    post = await Post.create({
      topicId: topic._id,
      authorId: user._id,
      content: 'Double like',
    });

    await request
      .post(`/posts/${post._id}/like`)
      .set('Cookie', userCookie);

    const res = await request
      .post(`/posts/${post._id}/like`)
      .set('Cookie', userCookie);

    expect(res.status).toBe(403);
  });
});
