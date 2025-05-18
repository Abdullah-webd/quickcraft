import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: [{
      type: String,
      required: true,
      trim: true
    }],
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3
    }
  }],
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;