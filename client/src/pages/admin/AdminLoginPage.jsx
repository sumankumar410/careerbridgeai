import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  RefreshCw,
  Server,
  KeyRound,
  Sparkles
} from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@careerbridge.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide administrator email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (res?.user) {
        if (res.user.role !== 'admin') {
          setError('Access Denied. Your account does not possess administrator privileges.');
          return;
        }
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-white">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/20 ring-4 ring-purple-500/10">
            <ShieldCheck className="w-9 h-9 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              CareerBridge Master Admin
            </h1>
            <p className="text-xs text-purple-300/80 font-medium uppercase tracking-wider mt-1">
              Restricted Access Console &bull; Full Platform Control
            </p>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-slate-900/90 border border-purple-500/20 shadow-2xl backdrop-blur-xl space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Credentials Pill */}
          <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-purple-300 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                Default Master Admin
              </span>
              <p className="text-slate-400 font-mono text-[11px]">admin@careerbridge.com &bull; password123</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@careerbridge.com');
                setPassword('password123');
                setError('');
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold transition-all shadow-sm"
            >
              Auto Fill
            </button>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@careerbridge.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Master Security Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Master Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate & Open Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 text-center border-t border-slate-800 text-xs text-slate-500">
            <span>CareerBridgeAI Protected Zone &bull; MongoDB Atlas Cloud Secured</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/login"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-all inline-flex items-center gap-1.5"
          >
            &larr; Return to Student & Recruiter Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
