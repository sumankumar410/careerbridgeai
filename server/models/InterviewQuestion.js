const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    default: 'React Developer'
  },
  category: {
    type: String,
    required: true,
    default: 'Technical'
  },
  question: {
    type: String,
    required: [true, 'Please provide the interview question'],
    trim: true
  },
  idealAnswer: {
    type: String,
    required: [true, 'Please provide an ideal answer or key explanation points'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  coreKeywords: [{
    type: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isCustom: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);
