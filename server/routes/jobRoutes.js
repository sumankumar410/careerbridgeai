const express = require('express');
const router = express.Router();
const { getJobs, getJobById, createJob, updateJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getJobs);
router.get('/:id', (req, res, next) => {
  // If authorization token exists, parse user for eligibility
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return protect(req, res, () => getJobById(req, res, next));
  }
  getJobById(req, res, next);
});

router.post('/', protect, authorize('recruiter', 'tpo', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'tpo', 'admin'), updateJob);

module.exports = router;
