require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Job = require('../models/Job');
const PlacementDrive = require('../models/PlacementDrive');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Cleaning existing database records...');
    await User.deleteMany();
    await StudentProfile.deleteMany();
    await Job.deleteMany();
    await PlacementDrive.deleteMany();

    console.log('[Seeder] Creating Demo Users for all 4 roles...');
    
    // 1. Demo Student
    const studentUser = await User.create({
      name: 'Aman Sharma',
      email: 'student@careerbridge.com',
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
      softSkills: ['Problem Solving', 'Team Collaboration', 'Communication'],
      projects: [
        {
          name: 'CloudTask Manager',
          description: 'A full-stack project tracking application with JWT authentication, real-time board updates, and MongoDB aggregation.',
          technologies: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
          githubUrl: 'https://github.com/demo/cloudtask',
          liveUrl: 'https://cloudtask-demo.vercel.app'
        }
      ],
      experience: [
        {
          company: 'Nexus Tech Labs',
          role: 'Full Stack Web Intern',
          duration: '3 Months (Summer 2025)',
          description: 'Built RESTful microservices and optimized React re-renders improving page load by 30%.'
        }
      ],
      resumeScore: 84
    });

    // 2. Demo Recruiter
    const recruiterUser = await User.create({
      name: 'Priya Verma',
      email: 'recruiter@careerbridge.com',
      password: 'password123',
      role: 'recruiter'
    });

    // 3. Demo TPO
    const tpoUser = await User.create({
      name: 'Dr. Rajesh Khanna',
      email: 'tpo@careerbridge.com',
      password: 'password123',
      role: 'tpo'
    });

    // 4. Demo Admin
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@careerbridge.com',
      password: 'password123',
      role: 'admin'
    });

    console.log('[Seeder] Creating Realistic Job Openings...');
    const jobs = [
      {
        title: 'Full Stack MERN Developer',
        companyName: 'Razorpay',
        postedBy: recruiterUser._id,
        description: 'Join our payment experience engineering team building scalable financial platforms handling millions of transactions.',
        responsibilities: ['Build modular React frontend components', 'Design RESTful APIs in Node.js/Express', 'Ensure high test coverage and security standards'],
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
    ];

    await Job.insertMany(jobs);

    console.log('[Seeder] Creating Campus Placement Drives...');
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

    console.log('----------------------------------------------------');
    console.log('✅ SEEDING COMPLETE! DEMO ACCOUNTS CREATED:');
    console.log('1. Student:   student@careerbridge.com   / password123');
    console.log('2. Recruiter: recruiter@careerbridge.com / password123');
    console.log('3. TPO:       tpo@careerbridge.com       / password123');
    console.log('4. Admin:     admin@careerbridge.com     / password123');
    console.log('----------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error(`[Seeder Error] ${error.message}`);
    process.exit(1);
  }
};

seedData();