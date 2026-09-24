import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/common/GoogleSignInButton';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle, KeyRound, CheckCircle2, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';

const LoginPage = () => {
  const [portal, setPortal] = useState('user'); // 'user' | 'admin'
  const [loginMode, setLoginMode] = useState('password'); // 'password' | 'otp'
  const [otpChannel, setOtpChannel] = useState('mobile'); // 'mobile' | 'email'
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, sendOtp, loginWithOtp } = useAuth();
  const navigate = useNavigate();

  // Timer countdown for resend OTP
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const redirectByRole = (user) => {
    if (user?.role === 'recruiter') navigate('/recruiter/dashboard');
    else if (user?.role === 'tpo') navigate('/tpo/dashboard');
    else if (user?.role === 'admin') navigate('/admin/dashboard');
    else navigate('/student/dashboard');
  };

  // 1. Password Login
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res?.user) redirectByRole(res.user);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // 2. Request OTP (Mobile or Email)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const identifier = otpChannel === 'mobile' ? phone : email;
    if (!identifier.trim()) {
      setError(otpChannel === 'mobile' ? 'Please enter your mobile number.' : 'Please enter your email address.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await sendOtp({
        phone: otpChannel === 'mobile' ? phone : undefined,
        email: otpChannel === 'email' ? email : undefined,
        type: otpChannel,
        purpose: 'login'
      });
      if (res.success) {
        setOtpSent(true);
        setOtpTimer(30);
        setSuccessMsg(res.message);
      }
    } catch (err) {
      setError(err.message || 'Could not send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify OTP & Login
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await loginWithOtp({
        phone: otpChannel === 'mobile' ? phone : undefined,
        email: otpChannel === 'email' ? email : undefined,
        type: otpChannel
      }, otp);
      if (res?.user) redirectByRole(res.user);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-lg transition-all ${
            portal === 'admin'
              ? 'bg-purple-600 text-white shadow-purple-500/20'
              : 'bg-indigo-600 text-white shadow-indigo-500/20'
          }`}>
            {portal === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {portal === 'admin' ? 'Admin Console Login' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {portal === 'admin'
              ? 'System Administrator Access & Controls'
              : 'Sign in to CareerBridgeAI Platform'}
          </p>
        </div>

        {/* Portal Switcher: Student/Recruiter vs Admin */}
        <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setPortal('user');
              setEmail('');
              setPassword('');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              portal === 'user'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student / Recruiter</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPortal('admin');
              setLoginMode('password');
              setEmail('admin@careerbridge.com');
              setPassword('password123');
              setError('');
              setSuccessMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              portal === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>🛡️ Admin Portal</span>
          </button>
        </div>

        {/* Mode Toggle: Password vs OTP (Only in User Portal) */}
        {portal === 'user' && (
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setLoginMode('password'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                loginMode === 'password'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Password Sign In
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('otp'); setError(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'otp'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Login with OTP
            </button>
          </div>
        )}

        {/* Login Form Card */}
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



          {/* Google Sign In Option */}
          {portal === 'user' && (
            <div className="space-y-4">
              <GoogleSignInButton 
                text="Continue with Google" 
                role="student" 
                onError={(err) => setError(err)} 
              />
              
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">or sign in with</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
              </div>
            </div>
          )}

          {loginMode === 'password' ? (
            /* Password Login Form */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                  portal === 'admin'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                }`}
              >
                {loading
                  ? (portal === 'admin' ? 'Verifying Admin Access...' : 'Authenticating...')
                  : (portal === 'admin' ? '🛡️ Sign In to Admin Console' : 'Sign In with Password')}
                <ArrowRight className="w-4 h-4" />
              </button>

              {portal === 'admin' && (
                <p className="text-center text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                  Default: <strong>admin@careerbridge.com</strong> (password123)
                </p>
              )}
            </form>
          ) : (
            /* OTP Login Form */
            <div className="space-y-4">
              {/* Channel Selector: Mobile vs Email */}
              {!otpSent && (
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => { setOtpChannel('mobile'); setError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      otpChannel === 'mobile'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile SMS OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpChannel('email'); setError(''); }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      otpChannel === 'email'
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email OTP</span>
                  </button>
                </div>
              )}

              {otpChannel === 'mobile' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      disabled={otpSent}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      disabled={otpSent}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-75"
                    />
                  </div>
                </div>
              )}

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  {loading ? 'Sending Code...' : `Send Code to ${otpChannel === 'mobile' ? 'Mobile' : 'Email'}`}
                </button>
              ) : (
                <form onSubmit={handleOtpVerify} className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Enter 6-Digit Verification Code
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
                      onClick={() => setOtpSent(false)}
                      className="text-slate-500 hover:text-indigo-600 underline"
                    >
                      Change {otpChannel === 'mobile' ? 'Mobile' : 'Email'}
                    </button>

                    <button
                      type="button"
                      disabled={otpTimer > 0 || loading}
                      onClick={handleSendOtp}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold disabled:opacity-50 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      {otpTimer > 0 ? `Resend code in ${otpTimer}s` : 'Resend Code'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
              Create an Account with OTP
            </Link>
          </p>
        </div>

        {/* Dedicated Admin Portal Banner */}
        <div className="p-4 rounded-3xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Master Administration Portal</p>
              <p className="text-[11px] text-slate-500">Dedicated restricted access &bull; Full control</p>
            </div>
          </div>
          <Link
            to="/admin/login"
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 shrink-0"
          >
            <span>Admin Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
