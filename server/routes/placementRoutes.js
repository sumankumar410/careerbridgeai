const express = require('express');
const router = express.Router();
const {
  getDrives,
  createDrive,
  registerForDrive,
  getPlacementStats
} = require('../controllers/placementController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/drives', getDrives);
router.post('/drives', protect, authorize('tpo', 'admin'), createDrive);
router.post('/drives/:id/register', protect, authorize('student'), registerForDrive);
router.get('/stats', protect, authorize('tpo', 'admin'), getPlacementStats);

module.exports = router;