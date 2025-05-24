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
  timerMode: {
    type: Boolean,
    default: false
  },
  timeLimit: {
    type: Number,
    required: function() {
      return this.timerMode === true;
    },
    min: 1,
    max: 180, // Maximum 3 hours in minutes
    default: 30
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