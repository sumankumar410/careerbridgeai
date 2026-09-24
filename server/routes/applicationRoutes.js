const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { uploadResume } = require('../config/multer');

// Apply for Job with mandatory/optional resume file upload via Multer multipart or JSON
router.post('/apply', protect, authorize('student'), (req, res, next) => {
  uploadResume.single('resume')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    applyForJob(req, res, next);
  });
});

router.get('/my', protect, authorize('student'), getMyApplications);
router.get('/job/:jobId', protect, authorize('recruiter', 'tpo', 'admin'), getJobApplicants);
router.put('/:id/status', protect, authorize('recruiter', 'tpo', 'admin'), updateApplicationStatus);

module.exports = router;