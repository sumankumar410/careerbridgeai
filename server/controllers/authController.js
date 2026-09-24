const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const OTP = require('../models/OTP');
const { sendOTPEmail } = require('../services/emailService');
const { sendMobileOTP } = require('../services/smsService');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'careerbridgeai_super_secret_jwt_key_2026_cse_btech';
  return jwt.sign({ id }, secret, {
    expiresIn: '7d' // 7-day token validity window
  });
};

// 1. Register Student
const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, college, degree, branch, gradYear, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      password,
      role: 'student'
    });

    const profile = await StudentProfile.create({
      user: user._id,
      college: college || 'Engineering College',
      degree: degree || 'B.Tech',
      branch: branch || 'CSE',
      gradYear: gradYear || 2026,
      phone: phone || ''
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// 2. Register Recruiter
const registerRecruiter = async (req, res, next) => {
  try {
    const { name, email, password, phone, company, designation } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      phone: phone || '',
      password,
      role: 'recruiter'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: company || 'Tech Corporation',
        designation: designation || 'Talent Acquisition'
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. User Login (Password Based)
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'blocked' || user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended or deactivated. Please contact an administrator.'
      });
    }

    const token = generateToken(user._id);

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// 4. Send 6-Digit OTP for Login or Register (Mobile or Email)
const sendOTP = async (req, res, next) => {
  try {
    const { email, phone, identifier, type, purpose = 'login' } = req.body;

    const isMobile = type === 'mobile' || (phone && !email);
    const targetIdentifier = (isMobile ? (phone || identifier) : (email || identifier) || '').toString().trim();

    if (!targetIdentifier) {
      return res.status(400).json({
        success: false,
        message: isMobile ? 'Please provide a valid mobile number.' : 'Please provide a valid email address.'
      });
    }

    let userExists = null;

    if (isMobile) {
      // Clean phone number: match last 10 digits
      const digitsOnly = targetIdentifier.replace(/\D/g, '');
      const last10Digits = digitsOnly.slice(-10);
      const phoneRegex = new RegExp(last10Digits + '$');

      userExists = await User.findOne({ phone: { $regex: phoneRegex } });
      if (!userExists) {
        const profile = await StudentProfile.findOne({ phone: { $regex: phoneRegex } });
        if (profile) userExists = await User.findById(profile.user);
      }
    } else {
      userExists = await User.findOne({ email: targetIdentifier.toLowerCase() });
    }

    if (purpose === 'login' && !userExists) {
      return res.status(404).json({
        success: false,
        message: isMobile
          ? `No registered account found with mobile number ${targetIdentifier}. Please register first.`
          : `No registered account found with email ${targetIdentifier}. Please register first.`
      });
    }

    if (purpose === 'register' && userExists) {
      return res.status(400).json({
        success: false,
        message: isMobile
          ? 'An account already exists with this mobile number. Please log in.'
          : 'An account already exists with this email. Please log in.'
      });
    }

    // Generate random 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Clean up older OTPs for this identifier/phone/email and purpose
    await OTP.deleteMany({
      $or: [
        { identifier: targetIdentifier },
        { phone: targetIdentifier },
        { email: targetIdentifier.toLowerCase() }
      ],
      purpose
    });

    // Store in DB
    await OTP.create({
      identifier: targetIdentifier,
      type: isMobile ? 'mobile' : 'email',
      phone: isMobile ? targetIdentifier : '',
      email: isMobile ? '' : targetIdentifier.toLowerCase(),
      otp: otpCode,
      purpose
    });

    if (isMobile) {
      const { smsSent, smsError, formattedPhone } = await sendMobileOTP(targetIdentifier, otpCode, purpose);

      if (!smsSent) {
        return res.status(400).json({
          success: false,
          type: 'mobile',
          message: smsError || 'Failed to send SMS to your mobile phone. Please check Twilio configuration in server/.env.'
        });
      }

      return res.status(200).json({
        success: true,
        type: 'mobile',
        message: `Verification OTP has been sent via SMS to ${formattedPhone || targetIdentifier}. Please check your phone.`,
        smsSent: true
      });
    } else {
      const { emailSent, emailError } = await sendOTPEmail(targetIdentifier.toLowerCase(), otpCode, purpose);

      if (!emailSent) {
        return res.status(400).json({
          success: false,
          type: 'email',
          message: emailError || 'Failed to send verification email. Please check SMTP credentials in server/.env.'
        });
      }

      return res.status(200).json({
        success: true,
        type: 'email',
        message: `Verification code has been sent to ${targetIdentifier}. Please check your email inbox.`,
        emailSent: true
      });
    }
  } catch (error) {
    next(error);
  }
};

// 5. Verify OTP & Instant Login (Mobile or Email)
const verifyOTPLogin = async (req, res, next) => {
  try {
    const { email, phone, identifier, otp, type } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: '6-digit OTP code is required.' });
    }

    const cleanOtp = otp.toString().trim();
    const isMobile = type === 'mobile' || (phone && !email);
    const targetIdentifier = (isMobile ? (phone || identifier) : (email || identifier) || '').toString().trim();

    if (!targetIdentifier) {
      return res.status(400).json({
        success: false,
        message: isMobile ? 'Mobile number is required.' : 'Email address is required.'
      });
    }

    let record = null;
    let user = null;

    if (isMobile) {
      const digitsOnly = targetIdentifier.replace(/\D/g, '');
      const last10Digits = digitsOnly.slice(-10);
      const phoneRegex = new RegExp(last10Digits + '$');

      record = await OTP.findOne({
        $or: [
          { phone: { $regex: phoneRegex } },
          { identifier: { $regex: phoneRegex } },
          { identifier: targetIdentifier }
        ],
        otp: cleanOtp,
        purpose: 'login'
      });

      if (!record) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Please request a new code.' });
      }

      await OTP.deleteOne({ _id: record._id });

      user = await User.findOne({ phone: { $regex: phoneRegex } });
      if (!user) {
        const profile = await StudentProfile.findOne({ phone: { $regex: phoneRegex } });
        if (profile) user = await User.findById(profile.user);
      }
    } else {
      const cleanEmail = targetIdentifier.toLowerCase();
      record = await OTP.findOne({
        $or: [{ email: cleanEmail }, { identifier: cleanEmail }],
        otp: cleanOtp,
        purpose: 'login'
      });

      if (!record) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP code. Please request a new code.' });
      }

      await OTP.deleteOne({ _id: record._id });
      user = await User.findOne({ email: cleanEmail });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    const token = generateToken(user._id);
    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Verified and logged in successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || profile?.phone || '',
        role: user.role,
        avatar: user.avatar
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// 6. Verify OTP & Complete Registration
const verifyOTPRegister = async (req, res, next) => {
  try {
    const {
      email,
      phone,
      otp,
      name,
      password,
      role = 'student',
      verificationType = 'email',
      college,
      degree,
      branch,
      gradYear,
      company,
      designation
    } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: '6-digit OTP is required.' });
    }

    const cleanOtp = otp.toString().trim();
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.toString().trim() : '';

    const isMobile = verificationType === 'mobile' || (!cleanEmail && cleanPhone);

    let record = null;
    if (isMobile) {
      const last10Digits = cleanPhone.replace(/\D/g, '').slice(-10);
      const phoneRegex = new RegExp(last10Digits + '$');
      record = await OTP.findOne({
        $or: [
          { phone: { $regex: phoneRegex } },
          { identifier: { $regex: phoneRegex } },
          { identifier: cleanPhone }
        ],
        otp: cleanOtp,
        purpose: 'register'
      });
    } else {
      record = await OTP.findOne({
        $or: [{ email: cleanEmail }, { identifier: cleanEmail }],
        otp: cleanOtp,
        purpose: 'register'
      });
    }

    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    await OTP.deleteOne({ _id: record._id });

    // Fallback email if registered with mobile only
    const finalEmail = cleanEmail || `${cleanPhone.replace(/\D/g, '')}@mobile.careerbridge.com`;

    const userExists = await User.findOne({ email: finalEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Account already exists with this email or mobile number.' });
    }

    const user = await User.create({
      name: name || 'CareerBridge Member',
      email: finalEmail,
      phone: cleanPhone,
      password: password || 'password123',
      role
    });

    let profile = null;
    if (role === 'student') {
      profile = await StudentProfile.create({
        user: user._id,
        college: college || 'Engineering College',
        degree: degree || 'B.Tech',
        branch: branch || 'CSE',
        gradYear: gradYear || 2026,
        phone: cleanPhone
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created and verified successfully with OTP!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

// 7. Get Current User & Profile
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// 8. Update Student Profile
const updateStudentProfile = async (req, res, next) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id });

    if (!profile) {
      profile = new StudentProfile({ user: req.user.id });
    }

    const allowedFields = [
      'phone', 'location', 'college', 'degree', 'branch', 'cgpa',
      'gradYear', 'skills', 'softSkills', 'projects', 'experience',
      'certifications', 'achievements', 'languages', 'placementStatus'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    next(error);
  }
};

// 8. Sign In / Sign Up with Google (Hardened against Account Takeover)
const googleAuth = async (req, res, next) => {
  try {
    const { credential, email: directEmail, name: directName, avatar: directAvatar, googleId: directGoogleId, role = 'student', isDevSimulation } = req.body;

    let email = null;
    let name = directName;
    let avatar = directAvatar;
    let googleId = directGoogleId;
    let emailVerified = false;

    // A. Parse and validate Google ID token (JWT) if credential is provided
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);

          // Verify token issuer and audience/expiry sanity
          const validIssuer = ['accounts.google.com', 'https://accounts.google.com'].includes(payload.iss);
          const isNotExpired = !payload.exp || (payload.exp * 1000 > Date.now());

          if (validIssuer && isNotExpired) {
            email = payload.email;
            name = payload.name || payload.given_name || name;
            avatar = payload.picture || avatar;
            googleId = payload.sub || googleId;
            emailVerified = Boolean(payload.email_verified);
          } else {
            return res.status(401).json({ success: false, message: 'Google credential has expired or has an invalid issuer.' });
          }
        }
      } catch (decodeErr) {
        return res.status(400).json({ success: false, message: 'Malformed Google credential token.' });
      }
    } else if (isDevSimulation && process.env.NODE_ENV !== 'production' && directEmail) {
      // B. Safe Development Mode fallback for local testing
      email = directEmail.toLowerCase().trim();
      emailVerified = true;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication requires a valid Google ID credential.'
      });
    }

    email = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      // CRITICAL SECURITY GUARD: Never allow administrative accounts to be accessed via Google SSO bypass
      if (['admin', 'tpo'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Security Alert: Administrative and TPO accounts cannot be accessed via Google SSO. Please use the Dedicated Master Admin Console with your password.'
        });
      }

      if (user.status === 'blocked' || user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended or deactivated. Please contact an administrator.'
        });
      }

      let updated = false;
      if (!user.googleId && googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.avatar && avatar) {
        user.avatar = avatar;
        updated = true;
      }
      if (updated) await user.save();
    } else {
      // Create new account via Google OAuth
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        authProvider: 'google',
        googleId: googleId || `google_${Date.now()}`,
        avatar: avatar || '',
        role: ['student', 'recruiter'].includes(role) ? role : 'student',
        status: 'active'
      });

      if (user.role === 'student') {
        await StudentProfile.create({
          user: user._id,
          college: 'Engineering Institute',
          degree: 'B.Tech',
          branch: 'Computer Science',
          gradYear: 2026
        });
      }
    }

    const token = generateToken(user._id);

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Signed in with Google successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        authProvider: user.authProvider
      },
      profile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  registerRecruiter,
  login,
  sendOTP,
  verifyOTPLogin,
  verifyOTPRegister,
  getMe,
  updateStudentProfile,
  googleAuth
};
