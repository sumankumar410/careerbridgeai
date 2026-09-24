const fs = require('fs');
const pdfParse = require('pdf-parse');
const {
  analyzeResume,
  generateInterviewQuestions,
  evaluateInterviewAnswer,
  getCareerChatResponse
} = require('../services/aiService');
const StudentProfile = require('../models/StudentProfile');

// 1. Upload PDF Resume & Run AI ATS Analysis
const handleResumeUploadAndAnalyze = async (req, res, next) => {
  try {
    const { targetRole } = req.body;
    let resumeText = '';
    let uploadedFile = null;

    if (req.file) {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      resumeText = pdfData.text || '';
      uploadedFile = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: `/uploads/resumes/${req.file.filename}`,
        size: req.file.size
      };
    } else if (req.body.resumeText) {
      resumeText = req.body.resumeText;
    } else if (req.user) {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (profile) {
        const skills = (profile.skills || []).join(' ');
        const projects = (profile.projects || []).map(p => `${p.name || ''} ${p.description || ''}`).join(' ');
        resumeText = `${skills} ${projects}`.trim();
      }
    }

    if (!resumeText.trim()) {
      resumeText = 'Computer Science Student with skills in React, Node.js, JavaScript, MongoDB, HTML, CSS, Git, and REST APIs. Built full-stack web applications.';
    }

    const report = await analyzeResume(resumeText, targetRole || 'MERN Developer');

    // If logged-in student, update profile with new resume metadata & ATS score
    if (req.user && req.user.role === 'student') {
      const updateData = {
        resumeScore: report.score,
        resumeParsedText: resumeText.slice(0, 5000)
      };
      if (uploadedFile) {
        updateData.resumeUrl = uploadedFile.url;
        updateData.resumeOriginalName = uploadedFile.originalName;
      }
      await StudentProfile.findOneAndUpdate({ user: req.user.id }, updateData, { new: true, upsert: true });
    }

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully by CareerBridgeAI ATS Engine',
      file: uploadedFile,
      report
    });
  } catch (error) {
    next(error);
  }
};

// 2. Text-Based Resume Analysis (JSON Body)
const handleResumeAnalysis = async (req, res, next) => {
  try {
    const { targetRole, resumeText: customText } = req.body;
    let resumeText = customText || '';

    if (!resumeText && req.user) {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (profile) {
        const skills = (profile.skills || []).join(' ');
        const projects = (profile.projects || []).map(p => `${p.name || ''} ${p.description || ''}`).join(' ');
        resumeText = `${skills} ${projects}`.trim();
      }
    }

    if (!resumeText.trim()) {
      resumeText = 'Computer Science Student with skills in React, Node.js, JavaScript, MongoDB, HTML, CSS, Git, and REST APIs.';
    }

    const report = await analyzeResume(resumeText, targetRole || 'MERN Developer');

    res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

// 3. AI Interview Questions
const handleInterviewQuestions = async (req, res, next) => {
  try {
    const { role, difficulty } = req.query;
    const data = await generateInterviewQuestions(role, difficulty);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    next(error);
  }
};

// 4. AI Evaluate Answer
const handleEvaluateAnswer = async (req, res, next) => {
  try {
    const { question, answer, idealAnswer, role, category, coreKeywords } = req.body;
    const evaluation = await evaluateInterviewAnswer(question, answer, { idealAnswer, role, category, coreKeywords });
    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    next(error);
  }
};

// 5. AI Career Assistant Chat
const handleCareerChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    const reply = await getCareerChatResponse(message, history);
    res.status(200).json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};

// 6. Save Custom Interview Question
const handleSaveCustomQuestion = async (req, res, next) => {
  try {
    const InterviewQuestion = require('../models/InterviewQuestion');
    const { role, category, question, idealAnswer, difficulty, coreKeywords } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    let processedKeywords = [];
    if (Array.isArray(coreKeywords)) processedKeywords = coreKeywords;
    else if (typeof coreKeywords === 'string') processedKeywords = coreKeywords.split(',').map(s => s.trim()).filter(Boolean);

    const newQ = await InterviewQuestion.create({
      role: role || 'General',
      category: category || 'Custom Question',
      question: question.trim(),
      idealAnswer: (idealAnswer || 'Clear technical definition, underlying mechanism, and real-world trade-offs.').trim(),
      difficulty: difficulty || 'Intermediate',
      coreKeywords: processedKeywords,
      createdBy: req.user ? req.user.id : null,
      isCustom: true
    });

    res.status(201).json({ success: true, message: 'Custom question saved successfully!', question: newQ });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleResumeUploadAndAnalyze,
  handleResumeAnalysis,
  handleInterviewQuestions,
  handleEvaluateAnswer,
  handleCareerChat,
  handleSaveCustomQuestion
};
