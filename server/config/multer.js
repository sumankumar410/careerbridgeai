const multer = require('multer');
const path = require('path');
const fs = require('fs');

const resumeDir = path.join(__dirname, '../uploads/resumes');
const avatarDir = path.join(__dirname, '../uploads/avatars');

[resumeDir, avatarDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Resume PDF Storage with randomized alphanumeric filenames
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resumeDir),
  filename: (req, file, cb) => {
    const randomHex = require('crypto').randomBytes(16).toString('hex');
    cb(null, `resume-${Date.now()}-${randomHex}.pdf`);
  }
});

// Avatar Storage with randomized alphanumeric filenames
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const randomHex = require('crypto').randomBytes(16).toString('hex');
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${Date.now()}-${randomHex}${safeExt}`);
  }
});

// Strictly validate PDF Resumes
const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const isPdfExt = ext === '.pdf';
    const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';

    if (isPdfExt && isPdfMime) {
      cb(null, true);
    } else {
      cb(new Error('Security Policy: Only genuine PDF (.pdf) documents are permitted.'), false);
    }
  }
});

// Strictly validate Avatars
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5 MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedExts.includes(ext) && allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Security Policy: Only image files (.jpg, .jpeg, .png, .webp) are permitted.'), false);
    }
  }
});

module.exports = { uploadResume, uploadAvatar };
