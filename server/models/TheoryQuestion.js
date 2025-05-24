import mongoose from 'mongoose';

const theoryQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  sampleAnswer: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const TheoryQuestion = mongoose.model('TheoryQuestion', theoryQuestionSchema);

export default TheoryQuestion;