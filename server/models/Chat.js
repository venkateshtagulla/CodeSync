import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [messageSchema]
}, {
  timestamps: true
});

export default mongoose.model('Chat', chatSchema);