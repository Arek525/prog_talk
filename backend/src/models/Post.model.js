const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: []
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
