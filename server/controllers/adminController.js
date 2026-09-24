const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const InterviewQuestion = require('../models/InterviewQuestion');
const { generateInterviewQuestions } = require('../services/aiService');

// 1. Get Platform Stats & System Health
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const recruiterCount = await User.countDocuments({ role: 'recruiter' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const customQuestionsCount = await InterviewQuestion.countDocuments();

    // System integrations check
    const hasAtlas = Boolean(process.env.MONGO_URI && process.env.MONGO_URI.includes('mongodb+srv'));
    const hasTwilio = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        studentCount,
        recruiterCount,
        adminCount,
        totalJobs,
        totalApplications,
        customQuestionsCount,
        system: {
          database: hasAtlas ? 'MongoDB Atlas (Cloud Active)' : 'Local MongoDB (Active)',
          smsGateway: hasTwilio ? 'Twilio SMS Gateway (Live Active)' : 'SMS Gateway (Not Configured)',
          aiEngine: 'CareerBridge Semantic Concept Evaluator (Active)'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Get All Users (Admin Directory)
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// 3. Delete User by ID
const deleteAdminUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user.email === 'admin@careerbridge.com') {
      return res.status(400).json({ success: false, message: 'Primary System Administrator cannot be deleted.' });
    }

    await User.findByIdAndDelete(req.params.id);
    await StudentProfile.deleteMany({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: `User ${user.name} (${user.email}) deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Platform Questions
const getPlatformQuestions = async (req, res, next) => {
  try {
    const dbQuestions = await InterviewQuestion.find().sort({ createdAt: -1 });
    const reactDefault = await generateInterviewQuestions('React Developer');
    const mernDefault = await generateInterviewQuestions('MERN Developer');

    res.status(200).json({
      success: true,
      customQuestions: dbQuestions,
      defaultCount: (reactDefault.questions?.length || 0) + (mernDefault.questions?.length || 0)
    });
  } catch (error) {
    next(error);
  }
};

// 5. Add New Question Manually
const addPlatformQuestion = async (req, res, next) => {
  try {
    const { role, category, question, idealAnswer, difficulty, coreKeywords } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question text is required.' });
    }

    if (!idealAnswer || !idealAnswer.trim()) {
      return res.status(400).json({ success: false, message: 'Ideal technical answer is required.' });
    }

    // Process keywords
    let processedKeywords = [];
    if (Array.isArray(coreKeywords)) {
      processedKeywords = coreKeywords;
    } else if (typeof coreKeywords === 'string') {
      processedKeywords = coreKeywords.split(',').map(s => s.trim()).filter(Boolean);
    }

    const newQuestion = await InterviewQuestion.create({
      role: role || 'React Developer',
      category: category || 'Technical',
      question: question.trim(),
      idealAnswer: idealAnswer.trim(),
      difficulty: difficulty || 'Intermediate',
      coreKeywords: processedKeywords,
      createdBy: req.user ? req.user.id : null,
      isCustom: true
    });

    res.status(201).json({
      success: true,
      message: 'Interview question added successfully to platform question bank!',
      question: newQuestion
    });
  } catch (error) {
    next(error);
  }
};

// 6. Delete Custom Question
const deletePlatformQuestion = async (req, res, next) => {
  try {
    const q = await InterviewQuestion.findById(req.params.id);
    if (!q) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    await InterviewQuestion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Question removed from question bank.' });
  } catch (error) {
    next(error);
  }
};

// 7. Update User Role
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'recruiter', 'tpo', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email === 'admin@careerbridge.com' && role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Primary administrator role cannot be altered.' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

// 8. Update User Status (Active / Blocked / Inactive)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'blocked', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.email === 'admin@careerbridge.com' && status !== 'active') {
      return res.status(400).json({ success: false, message: 'Primary administrator cannot be blocked.' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account is now marked as ${status}`,
      user: { id: user._id, name: user.name, email: user.email, status: user.status }
    });
  } catch (error) {
    next(error);
  }
};

// 9. Create New User Directly by Admin
const createAdminUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'student', phone, status = 'active' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || '',
      status
    });

    if (role === 'student') {
      await StudentProfile.create({
        user: newUser._id,
        college: 'Engineering College',
        degree: 'B.Tech',
        branch: 'CSE',
        gradYear: 2026
      });
    }

    res.status(201).json({
      success: true,
      message: `User ${name} created successfully with role ${role}`,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status }
    });
  } catch (error) {
    next(error);
  }
};

// 10. Get All Platform Jobs (Admin Full Access)
const getAdminJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('postedBy', 'name email company').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (error) {
    next(error);
  }
};

// 11. Toggle Job Status (Admin Control)
const updateJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    job.status = status || (job.status === 'active' ? 'closed' : 'active');
    await job.save();

    res.status(200).json({
      success: true,
      message: `Job status updated to ${job.status}`,
      job
    });
  } catch (error) {
    next(error);
  }
};

// 12. Delete Job (Admin Control)
const deleteAdminJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job posting not found' });
    }

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ job: req.params.id });

    res.status(200).json({
      success: true,
      message: `Job '${job.title}' and associated applications removed.`
    });
  } catch (error) {
    next(error);
  }
};

// 13. Get All Applications Across Platform
const getAdminApplications = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email phone avatar')
      .populate('job', 'title companyName location salary')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      applications
    });
  } catch (error) {
    next(error);
  }
};

// 14. Update Application Status (Admin Control)
const updateAdminApplicationStatus = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (status) app.status = status;
    if (remarks) app.recruiterRemarks = remarks;

    app.timeline.push({
      stage: status || 'Status Updated',
      notes: remarks || 'Updated by System Administrator'
    });

    await app.save();

    res.status(200).json({
      success: true,
      message: `Application status updated to ${app.status}`,
      application: app
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  updateUserRole,
  updateUserStatus,
  createAdminUser,
  getPlatformQuestions,
  addPlatformQuestion,
  deletePlatformQuestion,
  getAdminJobs,
  updateJobStatus,
  deleteAdminJob,
  getAdminApplications,
  updateAdminApplicationStatus
};
