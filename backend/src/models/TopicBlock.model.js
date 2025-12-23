const mongoose = require('mongoose');

const TopicBlockSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    exceptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    createdByModeratorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
    },
  },
  { timestamps: true }
);

TopicBlockSchema.index(
  { topicId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model('TopicBlock', TopicBlockSchema);
