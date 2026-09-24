const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true
  },
  jobRole: {
    type: String,
    required: true
  },
  packageLPA: {
    type: String,
    required: true // e.g. "12 LPA"
  },
  driveDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    default: 'College Auditorium / Virtual'
  },
  minCGPA: {
    type: Number,
    default: 6.5
  },
  eligibleBranches: [{
    type: String,
    default: ['CSE', 'IT']
  }],
  selectionRounds: [{
    type: String // e.g., "Online Aptitude", "Technical Interview", "HR Interview"
  }],
  instructions: {
    type: String,
    default: ''
  },
  registeredStudents: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['registered', 'shortlisted', 'selected', 'rejected'],
      default: 'registered'
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, { timestamps: true });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);