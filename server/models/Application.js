const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
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
  resumeUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'interview_scheduled', 'selected', 'rejected'],
    default: 'applied'
  },
  matchScore: {
    type: Number,
    default: 0
  },
  recruiterRemarks: {
    type: String,
    default: ''
  },
  timeline: [{
    stage: { type: String, required: true },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  }]
}, { timestamps: true });

// Prevent duplicate applications for the same job by the same student
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);