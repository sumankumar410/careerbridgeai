const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roundName: {
    type: String,
    required: true, // e.g., "Technical Round 1", "HR Round"
    default: 'Technical Interview'
  },
  interviewDate: {
    type: Date,
    required: true
  },
  interviewTime: {
    type: String,
    required: true // e.g., "11:00 AM"
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  meetingUrl: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  instructions: {
    type: String,
    default: 'Please be ready 10 minutes prior with your resume and project code.'
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  feedback: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);