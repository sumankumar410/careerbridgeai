import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Building2, 
  Phone, 
  ArrowRight, 
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Zap
} from 'lucide-react';

const RegisterPage = () => {
  const [regMode, setRegMode] = useState('direct'); // 'direct' | 'otp'
  const [role, setRole] = useState('student'); // 'student' | 'recruiter'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // OTP Verification Step
  const [otpStep, setOtpStep] = useState(false); // false = enter details, true = enter OTP
  const [verifyMethod, setVerifyMethod] = useState('mobile'); // 'mobile' | 'email'
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  
  // Student Form State
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    college: '',
    degree: 'B.Tech',
    branch: 'CSE',
    gradYear: 2026
  });

  // Recruiter Form State
  const [recruiterData, setRecruiterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    designation: ''
  });

  const { registerStudent, registerRecruiter, sendOtp, registerWithOtp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleStudentChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const handleRecruiterChange = (e) => {
    setRecruiterData({ ...recruiterData, [e.target.name]: e.target.value });
  };

  const currentEmail = role === 'student' ? studentData.email : recruiterData.email;
  const currentPhone = role === 'student' ? studentData.phone : recruiterData.phone;

  // Direct Instant Registration (1-Click, immediately saves to MongoDB)
  const handleDirectRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'student') {
        const res = await registerStudent(studentData);
        if (res?.success) {
          navigate('/student/dashboard');
        }
      } else {
        const res = await registerRecruiter(recruiterData);
        if (res?.success) {
          navigate('/recruiter/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Send OTP (Mobile or Email)
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (verifyMethod === 'mobile') {
      if (!currentPhone.trim()) {
        setError('Please enter your mobile phone number.');
        return;
      }
    } else {
      if (!currentEmail.trim()) {
        setError('Please enter your email address.');
        return;
      }
    }

    setError('');
    setLoading(true);

    try {
      const res = await sendOtp({
        phone: verifyMethod === 'mobile' ? currentPhone : undefined,
        email: verifyMethod === 'email' ? currentEmail : undefined,
        type: verifyMethod,
        purpose: 'register'
      });
      if (res.success) {
        setOtpStep(true);
        setOtpTimer(30);
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const baseData = role === 'student' ? studentData : recruiterData;
      const payload = {
        ...baseData,
        otp,
        role,
        verificationType: verifyMethod
      };

      const res = await registerWithOtp(payload);
      if (res?.success) {
        if (role === 'student') navigate('/student/dashboard');
        else navigate('/recruiter/dashboard');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {regMode === 'direct' ? 'Instant Account Creation (Direct)' : 'Register with Mobile / Email OTP'}
          </p>
        </div>

        {/* Registration Mode Switch Tabs */}
        {!otpStep && (
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setRegMode('direct'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                regMode === 'direct'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>⚡ Instant Registration</span>
            </button>
            <button
              type="button"
              onClick={() => { setRegMode('otp'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                regMode === 'otp'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-indigo-500" />
              <span>🔐 Register with OTP</span>
            </button>
          </div>
        )}

        {/* Role Switch Tabs */}
        {!otpStep && (
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setRole('student'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                role === 'student'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Registration</span>
            </button>
            <button
              type="button"
              onClick={() => { setRole('recruiter'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                role === 'recruiter'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Recruiter Registration</span>
            </button>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}



          {/* Sign Up with Google Option */}
          {!otpStep && (
            <div className="space-y-4">
              <GoogleSignInButton 
                text="Sign up with Google" 
                role={role} 
                onError={(err) => setError(err)} 
              />
              
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or register with email</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>
            </div>
          )}

          {!otpStep ? (
            /* Step 1: Input details */
            <form onSubmit={regMode === 'direct' ? handleDirectRegister : handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    name="name"
                    value={role === 'student' ? studentData.name : recruiterData.name}
                    onChange={role === 'student' ? handleStudentChange : handleRecruiterChange}
                    placeholder="e.g. Aman Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  {role === 'student' ? 'College / Personal Email' : 'Work / Company Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={role === 'student' ? studentData.email : recruiterData.email}
                    onChange={role === 'student' ? handleStudentChange : handleRecruiterChange}
                    placeholder={role === 'student' ? 'student@college.edu' : 'recruiter@company.com'}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    name="password"
                    value={role === 'student' ? studentData.password : recruiterData.password}
                    onChange={role === 'student' ? handleStudentChange : handleRecruiterChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Student Specific Fields */}
              {role === 'student' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        College / University
                      </label>
                      <input
                        type="text"
                        name="college"
                        value={studentData.college}
                        onChange={handleStudentChange}
                        placeholder="Apex Tech Institute"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="tel"
                          name="phone"
                          value={studentData.phone}
                          onChange={handleStudentChange}
                          placeholder="+91 9876543210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Degree
                      </label>
                      <select
                        name="degree"
                        value={studentData.degree}
                        onChange={handleStudentChange}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                      >
                        <option value="B.Tech">B.Tech</option>
                        <option value="M.Tech">M.Tech</option>
                        <option value="BCA">BCA</option>
                        <option value="MCA">MCA</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Branch
                      </label>
                      <select
                        name="branch"
                        value={studentData.branch}
                        onChange={handleStudentChange}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                      >
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                        <option value="EEE">EEE</option>
                        <option value="MECH">MECH</option>
                        <option value="CIVIL">CIVIL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Passout
                      </label>
                      <select
                        name="gradYear"
                        value={studentData.gradYear}
                        onChange={handleStudentChange}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                      >
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Recruiter Specific Fields */}
              {role === 'recruiter' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Company Name
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          name="company"
                          value={recruiterData.company}
                          onChange={handleRecruiterChange}
                          placeholder="Razorpay / Microsoft"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        Designation
                      </label>
                      <input
                        type="text"
                        required
                        name="designation"
                        value={recruiterData.designation}
                        onChange={handleRecruiterChange}
                        placeholder="Technical Recruiter"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Contact Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={recruiterData.phone}
                        onChange={handleRecruiterChange}
                        placeholder="+91 9811223344"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Channel Selector (Only in OTP mode) */}
              {regMode === 'otp' && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Choose Verification Channel:
                  </label>
                  <div className="flex rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setVerifyMethod('mobile')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        verifyMethod === 'mobile'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile SMS OTP</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifyMethod('email')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        verifyMethod === 'email'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email OTP</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                {loading
                  ? (regMode === 'direct' ? 'Creating Account & Saving...' : 'Sending Verification Code...')
                  : (regMode === 'direct' ? '⚡ Create Account & Get Started' : `Send Code to ${verifyMethod === 'mobile' ? 'Mobile' : 'Email'}`)}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Step 2: Enter OTP */
            <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center space-y-1">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  Step 2 of 2: Verify Code
                </span>
                <p className="text-xs text-slate-500 pt-2">
                  We sent a 6-digit code to <strong>{verifyMethod === 'mobile' ? (currentPhone || 'your mobile') : currentEmail}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Enter 6-Digit OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-base font-mono tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="text-slate-500 hover:text-indigo-600 underline"
                >
                  Edit Information
                </button>

                <button
                  type="button"
                  disabled={otpTimer > 0 || loading}
                  onClick={handleRequestOtp}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold disabled:opacity-50 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Finish Registration'}
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Sign In (with Password or OTP)
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
