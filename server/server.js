const path = require('path');
// Load environment variables from server/.env or root .env
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/security');
const { protect, authorize } = require('./middleware/authMiddleware');

// Models for Auto-Seeding
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Job = require('./models/Job');
const PlacementDrive = require('./models/PlacementDrive');

// Route imports
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const placementRoutes = require('./routes/placementRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// 1. HTTP Security Headers (Protection against Clickjacking, MIME sniffing, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));

// 2. Controlled CORS Whitelisting
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS Security Policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.options('*', cors());

// Body parsing with size constraints (Protection against Large Payload DoS)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 3. Static Uploads Serving with strict security headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'");
  next();
}, express.static(path.join(__dirname, 'uploads')));

// 4. Global API Rate Limiter
app.use('/api', apiLimiter);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'CareerBridgeAI API Server',
    timestamp: new Date().toISOString()
  });
});

// Auto-seed function to ensure demo accounts are ALWAYS ready
const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Auto-Seed] Empty database detected. Seeding demo accounts and jobs...');
      
      const studentUser = await User.create({
        name: 'Aman Sharma',
        email: 'student@careerbridge.com',
        phone: '+91 9876543210',
        password: 'password123',
        role: 'student'
      });

      await StudentProfile.create({
        user: studentUser._id,
        phone: '+91 9876543210',
        college: 'Apex Institute of Technology',
        degree: 'B.Tech',
        branch: 'CSE',
        cgpa: 8.7,
        gradYear: 2026,
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'Express', 'Tailwind CSS', 'Git'],
        softSkills: ['Problem Solving', 'Team Collaboration'],
        projects: [
          {
            name: 'CloudTask Manager',
            description: 'Full-stack task manager with JWT auth and real-time updates.',
            technologies: ['React', 'Node.js', 'MongoDB'],
            githubUrl: 'https://github.com/demo/cloudtask',
            liveUrl: 'https://cloudtask-demo.vercel.app'
          }
        ],
        resumeScore: 84
      });

      const recruiterUser = await User.create({
        name: 'Priya Verma',
        email: 'recruiter@careerbridge.com',
        phone: '+91 9811223344',
        password: 'password123',
        role: 'recruiter'
      });

      const tpoUser = await User.create({
        name: 'Dr. Rajesh Khanna',
        email: 'tpo@careerbridge.com',
        phone: '+91 9822334455',
        password: 'password123',
        role: 'tpo'
      });

      const adminUser = await User.create({
        name: 'System Administrator',
        email: 'admin@careerbridge.com',
        phone: '+91 9833445566',
        password: 'password123',
        role: 'admin'
      });

      await Job.create([
        {
          title: 'Full Stack MERN Developer',
          companyName: 'Razorpay',
          postedBy: recruiterUser._id,
          description: 'Join our payment experience engineering team building scalable financial platforms handling millions of transactions.',
          responsibilities: ['Build modular React frontend components', 'Design RESTful APIs in Node.js/Express'],
          requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'Tailwind CSS'],
          minCGPA: 7.5,
          eligibleBranches: ['CSE', 'IT', 'ECE'],
          salary: '14-18 LPA',
          location: 'Bengaluru, India (Hybrid)',
          jobType: 'Full-time',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Frontend Engineer (React / TypeScript)',
          companyName: 'Microsoft',
          postedBy: recruiterUser._id,
          description: 'Looking for passionate software engineers to craft delightful user interfaces for enterprise cloud services.',
          responsibilities: ['Develop accessible web components', 'Collaborate with UX designers and backend engineers'],
          requiredSkills: ['React', 'JavaScript', 'HTML/CSS', 'Git'],
          minCGPA: 8.0,
          eligibleBranches: ['CSE', 'IT'],
          salary: '18-24 LPA',
          location: 'Hyderabad, India',
          jobType: 'Full-time',
          deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Backend Systems Engineer',
          companyName: 'Amazon AWS',
          postedBy: recruiterUser._id,
          description: 'Work on distributed systems, high throughput event streams, and cloud infrastructure.',
          responsibilities: ['Design distributed microservices', 'Optimize database queries and caching layers'],
          requiredSkills: ['Node.js', 'MongoDB', 'SQL', 'Docker'],
          minCGPA: 7.0,
          eligibleBranches: ['CSE', 'IT', 'ECE'],
          salary: '16-22 LPA',
          location: 'Bengaluru, India',
          jobType: 'Full-time',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
        }
      ]);

      await PlacementDrive.create({
        companyName: 'Google Cloud Campus Drive 2026',
        jobRole: 'Associate Software Engineer',
        packageLPA: '22 LPA',
        driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        venue: 'Main Auditorium & Virtual Lab 3',
        minCGPA: 8.0,
        eligibleBranches: ['CSE', 'IT'],
        selectionRounds: ['Online Coding Round', 'Technical Interview 1', 'Technical Interview 2', 'HR Fitment Round']
      });

      console.log('✅ [Auto-Seed] Demo accounts & initial jobs populated successfully!');
    } else {
      await User.updateOne({ email: 'student@careerbridge.com', $or: [{ phone: '' }, { phone: { $exists: false } }] }, { phone: '+91 9876543210' });
      await User.updateOne({ email: 'recruiter@careerbridge.com', $or: [{ phone: '' }, { phone: { $exists: false } }] }, { phone: '+91 9811223344' });
    }
  } catch (err) {
    console.error('[Auto-Seed Error]:', err.message);
  }
};

// Protected Route to manually re-seed demo accounts (Admin Only)
app.get('/api/seed', protect, authorize('admin'), async (req, res) => {
  try {
    await seedDemoData();
    res.status(200).json({ success: true, message: 'Demo accounts verified and seeded successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/admin', adminRoutes);

// Global Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database, Seed & Start Server
connectDB().then(async () => {
  await seedDemoData();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CareerBridgeAI Backend Running on Port: ${PORT}`);
    console.log(`🛡️ Security: Helmet HTTP Headers & Rate Limiting ACTIVE`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`⚡ Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
});
