const express = require('express');
const router = express.Router();
const { uploadResume } = require('../config/multer');
const {
  handleResumeUploadAndAnalyze,
  handleResumeAnalysis,
  handleInterviewQuestions,
  handleEvaluateAnswer,
  handleCareerChat,
  handleSaveCustomQuestion
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// 1. PDF Resume Upload & ATS Analysis (Multer processes multipart stream first)
router.post('/resume-upload-analyze', (req, res, next) => {
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      console.error('[Multer Error]:', err.message);
      return res.status(400).json({ success: false, message: err.message });
    }
    
    // If token is present, decode user; else continue as guest
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      return protect(req, res, () => handleResumeUploadAndAnalyze(req, res, next));
    }
    handleResumeUploadAndAnalyze(req, res, next);
  });
});

// 2. Text Based Analysis
router.post('/resume-analyze', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => handleResumeAnalysis(req, res, next));
  }
  handleResumeAnalysis(req, res, next);
});

// 3. Interview Preparation
router.get('/interview-questions', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => handleInterviewQuestions(req, res, next));
  }
  handleInterviewQuestions(req, res, next);
});

router.post('/evaluate-answer', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => handleEvaluateAnswer(req, res, next));
  }
  handleEvaluateAnswer(req, res, next);
});

// Save custom interview question manually
router.post('/custom-question', (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => handleSaveCustomQuestion(req, res, next));
  }
  handleSaveCustomQuestion(req, res, next);
});

// 4. Career Chatbot
router.post('/career-chat', handleCareerChat);

module.exports = router;
