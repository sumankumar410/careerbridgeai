const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// 1. Platform Stats
router.get('/stats', getAdminStats);

// 2. Full Users Management
router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteAdminUser);

// 3. Question Bank Management
router.get('/questions', getPlatformQuestions);
router.post('/questions', addPlatformQuestion);
router.delete('/questions/:id', deletePlatformQuestion);

// 4. Full Jobs Management
router.get('/jobs', getAdminJobs);
router.put('/jobs/:id/status', updateJobStatus);
router.delete('/jobs/:id', deleteAdminJob);

// 5. Full Applications Tracking
router.get('/applications', getAdminApplications);
router.put('/applications/:id/status', updateAdminApplicationStatus);

module.exports = router;
