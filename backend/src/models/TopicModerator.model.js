const mongoose = require('mongoose');

const TopicModeratorSchema = new mongoose.Schema(
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
    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

TopicModeratorSchema.index(
  { topicId: 1, userId: 1 },
  { unique: true }
);

module.exports = mongoose.model('TopicModerator', TopicModeratorSchema);
