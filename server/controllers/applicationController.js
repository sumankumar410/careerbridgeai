const fs = require('fs');
const pdfParse = require('pdf-parse');
const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const { matchJobWithStudent } = require('../services/aiService');

// 1. Apply for Job (Student) - MANDATORY RESUME UPLOAD ENFORCED
const applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const studentId = req.user.id;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required to submit an application.' });
    }

    // Check existing application
    const existingApp = await Application.findOne({ job: jobId, student: studentId });
    if (existingApp) {
      return res.status(400).json({ success: false, message: 'You have already applied for this position.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job listing not found.' });

    let profile = await StudentProfile.findOne({ user: studentId });
    let resumeUrl = req.body.resumeUrl || '';
    let parsedResumeText = '';

    // Handle resume uploaded at the time of applying
    if (req.file) {
      resumeUrl = `/uploads/resumes/${req.file.filename}`;
      try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        parsedResumeText = pdfData.text || '';
      } catch (parseErr) {
        console.warn('[Application Resume Parse Notice]:', parseErr.message);
      }

      // Update student's profile with this newly uploaded resume
      if (profile) {
        profile.resumeUrl = resumeUrl;
        profile.resumeOriginalName = req.file.originalname;
        if (parsedResumeText) profile.resumeParsedText = parsedResumeText.slice(0, 5000);
        await profile.save();
      } else {
        profile = await StudentProfile.create({
          user: studentId,
          resumeUrl,
          resumeOriginalName: req.file.originalname,
          resumeParsedText: parsedResumeText.slice(0, 5000)
        });
      }
    } else if (!resumeUrl && profile?.resumeUrl) {
      // Use existing profile resume if no new file was uploaded in this request
      resumeUrl = profile.resumeUrl;
    }

    // STRICT MANDATORY VALIDATION:
    // User CANNOT apply without a valid resume!
    if (!resumeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Resume upload is mandatory to apply for this job! Please select and upload your resume in PDF format.'
      });
    }

    // Calculate match score
    let score = 75;
    if (profile) {
      const match = await matchJobWithStudent(profile, job);
      score = match.matchScore;
    }

    const application = await Application.create({
      job: jobId,
      student: studentId,
      resumeUrl: resumeUrl,
      matchScore: score,
      status: 'applied',
      timeline: [
        { stage: 'Application Submitted', date: new Date(), notes: 'Application with PDF resume received successfully.' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully with your resume!',
      application
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get My Applications (Student)
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// 3. Get Applicants for Recruiter (IDOR Protected)
const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    // IDOR Protection: Only the job's creator or admin/tpo can view candidate applications
    const isOwner = job.postedBy && job.postedBy.toString() === req.user.id;
    const isPrivileged = ['admin', 'tpo'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: You are not authorized to view applicants for a job posted by another recruiter.'
      });
    }

    const applications = await Application.find({ job: jobId })
      .populate('student', 'name email avatar phone')
      .sort({ matchScore: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (error) {
    next(error);
  }
};

// 4. Update Application Status (IDOR Protected)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // IDOR Protection: Ensure recruiter owns the parent job or is an admin
    const isOwner = application.job && application.job.postedBy && application.job.postedBy.toString() === req.user.id;
    const isPrivileged = ['admin', 'tpo'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Security Alert: You cannot modify applicant status for positions you did not post.'
      });
    }

    application.status = status;
    if (remarks) application.recruiterRemarks = remarks;

    application.timeline.push({
      stage: status.replace('_', ' ').toUpperCase(),
      date: new Date(),
      notes: remarks || `Status updated to ${status}`
    });

    await application.save();

    res.status(200).json({ success: true, message: 'Status updated successfully', application });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus
};