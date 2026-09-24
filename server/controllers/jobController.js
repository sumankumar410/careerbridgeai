const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const { checkEligibility } = require('../services/eligibilityService');
const { matchJobWithStudent } = require('../services/aiService');
const { escapeRegex } = require('../middleware/security');

// 1. Get All Jobs with filters & search (ReDoS Protected)
const getJobs = async (req, res, next) => {
  try {
    const { keyword, location, jobType, minSalary } = req.query;
    let query = { status: 'active' };

    if (keyword && typeof keyword === 'string') {
      const sanitized = escapeRegex(keyword.trim());
      query.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { companyName: { $regex: sanitized, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(sanitized, 'i')] } }
      ];
    }

    if (location && typeof location === 'string') {
      query.location = { $regex: escapeRegex(location.trim()), $options: 'i' };
    }

    if (jobType && typeof jobType === 'string') {
      query.jobType = jobType.trim();
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get Single Job with Eligibility Check
const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    let eligibility = null;
    let aiMatch = null;

    // If student is logged in, calculate eligibility and AI match
    if (req.user && req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (profile) {
        eligibility = checkEligibility(profile, job);
        aiMatch = await matchJobWithStudent(profile, job);
      }
    }

    res.status(200).json({
      success: true,
      job,
      eligibility,
      aiMatch
    });
  } catch (error) {
    next(error);
  }
};

// 3. Post a New Job (Recruiter / TPO / Admin)
const createJob = async (req, res, next) => {
  try {
    // Explicitly enforce creator to current authenticated user
    req.body.postedBy = req.user.id;
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    next(error);
  }
};

// 4. Update Job (Protected against IDOR & Unauthorized Hijack)
const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // IDOR Protection: Only the creator of the job or an admin can update it
    const isOwner = job.postedBy && job.postedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: You are not authorized to modify job postings created by other recruiters.'
      });
    }

    // Prevent tampering with original owner field
    delete req.body.postedBy;

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, message: 'Job updated successfully', job });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobById,
  createJob,
  updateJob
};