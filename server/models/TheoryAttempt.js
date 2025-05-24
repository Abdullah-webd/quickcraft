import mongoose from 'mongoose';

const theoryAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TheoryQuestion',
    required: true
  },
  userAnswer: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  feedback: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true
});

const TheoryAttempt = mongoose.model('TheoryAttempt', theoryAttemptSchema);

export default TheoryAttempt;