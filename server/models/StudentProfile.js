const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  college: { type: String, default: 'Engineering College' },
  degree: { type: String, default: 'B.Tech' },
  branch: { 
    type: String, 
    enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'OTHER'],
    default: 'CSE' 
  },
  cgpa: { type: Number, min: 0, max: 10, default: 0 },
  gradYear: { type: Number, default: new Date().getFullYear() },
  skills: [{ type: String }],
  softSkills: [{ type: String }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String },
    technologies: [{ type: String }],
    githubUrl: { type: String, default: '' },
    liveUrl: { type: String, default: '' }
  }],
  experience: [{
    company: { type: String, required: true },
    role: { type: String, required: true },
    duration: { type: String },
    description: { type: String }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String },
    date: { type: String },
    credentialUrl: { type: String, default: '' }
  }],
  achievements: [{ type: String }],
  languages: [{ type: String }],
  resumeUrl: { type: String, default: '' },
  resumeOriginalName: { type: String, default: '' },
  resumeParsedText: { type: String, default: '' },
  resumeScore: { type: Number, default: 0 },
  placementStatus: {
    type: String,
    enum: ['unplaced', 'placed', 'opted_out'],
    default: 'unplaced'
  }
}, { timestamps: true });

// Profile completion percentage calculation helper
studentProfileSchema.methods.calculateCompletion = function() {
  let score = 20; // base score for registered account
  if (this.phone) score += 10;
  if (this.cgpa > 0) score += 15;
  if (this.skills && this.skills.length >= 3) score += 15;
  if (this.projects && this.projects.length >= 1) score += 15;
  if (this.experience && this.experience.length >= 1) score += 10;
  if (this.resumeUrl) score += 15;
  return Math.min(score, 100);
};

module.exports = mongoose.model('StudentProfile', studentProfileSchema);