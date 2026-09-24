const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required']
  },
  companyLogo: {
    type: String,
    default: ''
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  responsibilities: [{ type: String }],
  requiredSkills: [{ type: String, required: true }],
  minCGPA: {
    type: Number,
    default: 6.0
  },
  eligibleBranches: [{
    type: String,
    default: ['CSE', 'IT']
  }],
  experience: {
    type: String,
    default: '0-1 Years'
  },
  salary: {
    type: String,
    required: true // e.g. "8-12 LPA" or "$80,000"
  },
  location: {
    type: String,
    required: true // e.g. "Bengaluru, India" or "Remote"
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Internship', 'Contract', 'Remote'],
    default: 'Full-time'
  },
  openings: {
    type: Number,
    default: 5
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);