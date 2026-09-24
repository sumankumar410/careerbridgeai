import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Sparkles, 
  Database, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Search,
  BookOpen,
  Server,
  Smartphone,
  UserCheck,
  UserX,
  FileText,
  Clock,
  Eye,
  Lock,
  ChevronDown
} from 'lucide-react';

const AdminDashboard = ({ initialTab = 'overview' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'users' | 'jobs' | 'applications' | 'questions'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [applicationsList, setApplicationsList] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState('all');

  // Form: Create User Modal
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    status: 'active'
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Form: Add Question
  const [newQuestion, setNewQuestion] = useState({
    role: 'React Developer',
    category: 'React Internals',
    question: '',
    idealAnswer: '',
    difficulty: 'Intermediate',
    coreKeywords: ''
  });
  const [addingQ, setAddingQ] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Stats
      const statsRes = await api.get('/admin/stats');
      if (statsRes.success) setStats(statsRes.stats);

      // 2. Users
      const usersRes = await api.get('/admin/users');
      if (usersRes.success) setUsersList(usersRes.users || []);

      // 3. Jobs
      const jobsRes = await api.get('/admin/jobs');
      if (jobsRes.success) setJobsList(jobsRes.jobs || []);

      // 4. Applications
      const appsRes = await api.get('/admin/applications');
      if (appsRes.success) setApplicationsList(appsRes.applications || []);

      // 5. Questions
      const questionsRes = await api.get('/admin/questions');
      if (questionsRes.success) setQuestionsList(questionsRes.customQuestions || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setErrorMsg(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4000);
  };

  // --- USER CONTROLS ---
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        showNotification(res.message);
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      if (res.success) {
        showNotification(res.message);
        setUsersList(prev => prev.map(u => u._id === userId ? { ...u, status: nextStatus } : u));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.success) {
        showNotification(res.message);
        setUsersList(prev => prev.filter(u => u._id !== userId));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete user');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      alert('Please fill in name, email, and password.');
      return;
    }

    setIsCreatingUser(true);
    try {
      const res = await api.post('/admin/users', newUserForm);
      if (res.success) {
        showNotification(res.message);
        setUsersList(prev => [res.user, ...prev]);
        setShowCreateUserModal(false);
        setNewUserForm({ name: '', email: '', password: '', role: 'student', phone: '', status: 'active' });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // --- JOB CONTROLS ---
  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const res = await api.put(`/admin/jobs/${jobId}/status`, { status: newStatus });
      if (res.success) {
        showNotification(res.message);
        setJobsList(prev => prev.map(j => j._id === jobId ? { ...j, status: newStatus } : j));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId, jobTitle) => {
    if (!window.confirm(`Delete job "${jobTitle}" and all its student applications?`)) return;
    try {
      const res = await api.delete(`/admin/jobs/${jobId}`);
      if (res.success) {
        showNotification(res.message);
        setJobsList(prev => prev.filter(j => j._id !== jobId));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete job');
    }
  };

  // --- APPLICATION CONTROLS ---
  const handleUpdateAppStatus = async (appId, newStatus) => {
    try {
      const res = await api.put(`/admin/applications/${appId}/status`, { status: newStatus });
      if (res.success) {
        showNotification(res.message);
        setApplicationsList(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update application');
    }
  };

  // --- QUESTION CONTROLS ---
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.question.trim() || !newQuestion.idealAnswer.trim()) {
      alert('Please fill in both Question and Ideal Answer.');
      return;
    }

    setAddingQ(true);
    try {
      const res = await api.post('/admin/questions', newQuestion);
      if (res.success) {
        showNotification('Question added successfully to platform question bank!');
        setQuestionsList(prev => [res.question, ...prev]);
        setNewQuestion({
          role: 'React Developer',
          category: 'React Internals',
          question: '',
          idealAnswer: '',
          difficulty: 'Intermediate',
          coreKeywords: ''
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add question');
    } finally {
      setAddingQ(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Delete this question from question bank?')) return;
    try {
      const res = await api.delete(`/admin/questions/${qId}`);
      if (res.success) {
        setQuestionsList(prev => prev.filter(q => q._id !== qId));
        showNotification('Question removed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete question');
    }
  };

  // Filters
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.phone || '').includes(searchTerm);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredJobs = jobsList.filter(j => {
    return (j.title || '').toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
           (j.companyName || '').toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
           (j.location || '').toLowerCase().includes(jobSearchTerm.toLowerCase());
  });

  const filteredApps = applicationsList.filter(a => {
    return appStatusFilter === 'all' || a.status === appStatusFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Admin Console Master Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <span className="text-xs uppercase font-bold tracking-widest text-purple-300 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-800">
              Master Admin Console &bull; Full Platform Authority
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            CareerBridge Full System Control
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Logged in as <strong>{user?.name || 'Administrator'}</strong> ({user?.email}). Manage users, toggle permissions, moderate jobs, track applications, and update AI questions.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setShowCreateUserModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create User / Admin</span>
          </button>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Action & Error Alerts */}
      {actionMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs (Mobile-friendly horizontal scroll + Desktop Flex) */}
      <div className="flex overflow-x-auto no-scrollbar sm:flex-wrap rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700 gap-1 pb-2 sm:pb-1.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 sm:flex-1 ${
            activeTab === 'overview'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          📊 System Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 sm:flex-1 ${
            activeTab === 'users'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          👥 User Directory ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 sm:flex-1 ${
            activeTab === 'jobs'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          💼 Jobs Management ({jobsList.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 sm:flex-1 ${
            activeTab === 'applications'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          📄 Applications ({applicationsList.length})
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 sm:flex-1 ${
            activeTab === 'questions'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          🧠 Question Bank ({questionsList.length})
        </button>
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Users</span>
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {stats?.totalUsers ?? usersList.length}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>Students: <strong>{stats?.studentCount ?? 0}</strong></span>
                <span>•</span>
                <span>Recruiters: <strong>{stats?.recruiterCount ?? 0}</strong></span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Live Jobs</span>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {jobsList.length}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Active Listings Across All Companies
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Applications</span>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {applicationsList.length}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Candidate Applications Tracked
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Custom Questions</span>
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                {questionsList.length}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                Database Technical Questions
              </p>
            </div>
          </div>

          {/* Cloud Integrations Status */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-500" />
              Active Backend Integrations & System Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" /> Database Engine
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {stats?.system?.database || 'MongoDB Atlas (Cloud Cluster Active)'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-indigo-500" /> SMS Gateway
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {stats?.system?.smsGateway || 'Twilio SMS Gateway (+14013897520)'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" /> Interview Evaluator
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  Semantic Concept Evaluator & Google OAuth
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL USERS DIRECTORY & CONTROL */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Platform Users Directory & Permissions
              </h3>
              <p className="text-xs text-slate-500">
                Full authority to change user roles, toggle account status (block/activate), and remove accounts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Administrators</option>
                <option value="tpo">TPO Officers</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role (Editable)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-[10px]">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                        )}
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.email === 'admin@careerbridge.com' ? (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Master Admin
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="student">Student</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="tpo">TPO</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.status === 'blocked'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.email !== 'admin@careerbridge.com' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusToggle(u._id, u.status || 'active')}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              u.status === 'blocked'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {u.status === 'blocked' ? 'Unblock' : 'Block User'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: JOBS MANAGEMENT (FULL CONTROL) */}
      {activeTab === 'jobs' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Platform Jobs Directory & Moderation
              </h3>
              <p className="text-xs text-slate-500">
                Full authority to toggle active status or delete job postings across all registered companies.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, company, location..."
                value={jobSearchTerm}
                onChange={(e) => setJobSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Job Title & Company</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredJobs.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{j.title}</div>
                      <div className="text-slate-500 text-[11px]">{j.companyName}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {j.location}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {j.salary}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        j.status === 'closed'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {j.status || 'active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleJobStatus(j._id, j.status || 'active')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-all"
                        >
                          {j.status === 'closed' ? 'Reopen Job' : 'Close Job'}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(j._id, j.title)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete job"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: APPLICATIONS TRACKING (FULL CONTROL) */}
      {activeTab === 'applications' && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                All Student Applications Across Platform
              </h3>
              <p className="text-xs text-slate-500">
                Track candidate pipeline and adjust application status directly as Administrator.
              </p>
            </div>

            <select
              value={appStatusFilter}
              onChange={(e) => setAppStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Application Statuses</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="selected">Selected</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Applied Job & Company</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Status (Admin Update)</th>
                  <th className="py-3 px-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-400">
                      No applications found for this filter.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        <div>{a.student?.name || 'Candidate'}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{a.student?.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{a.job?.title || 'Job'}</div>
                        <div className="text-slate-400 text-[11px]">{a.job?.companyName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {a.matchScore ?? 75}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={a.status}
                          onChange={(e) => handleUpdateAppStatus(a._id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                        >
                          <option value="applied">Applied</option>
                          <option value="under_review">Under Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview_scheduled">Interview Scheduled</option>
                          <option value="selected">Selected</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: QUESTION BANK MANAGER */}
      {activeTab === 'questions' && (
        <div className="space-y-8">
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <PlusCircle className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Interview Question to Platform Bank
                </h3>
                <p className="text-xs text-slate-500">
                  Save technical interview questions in MongoDB Atlas. Candidates can practice these with precision AI answer evaluation.
                </p>
              </div>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Role
                  </label>
                  <select
                    value={newQuestion.role}
                    onChange={(e) => setNewQuestion({ ...newQuestion, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    <option value="React Developer">React Developer</option>
                    <option value="MERN Developer">MERN Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="General">General / All Roles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category / Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. System Design, JavaScript, React"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Question Title *
                </label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. Explain how async/await works under the hood with JavaScript Promises and event loop."
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ideal Technical Answer *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain the ideal expected points, technical keywords, and mechanism..."
                  value={newQuestion.idealAnswer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, idealAnswer: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Core Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. async, await, promise, microtask, non-blocking, try catch"
                  value={newQuestion.coreKeywords}
                  onChange={(e) => setNewQuestion({ ...newQuestion, coreKeywords: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={addingQ}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {addingQ ? 'Saving Question...' : 'Publish Question to Bank'}
              </button>
            </form>
          </div>

          {/* List of Custom Questions */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Questions in MongoDB Bank ({questionsList.length})
            </h3>

            {questionsList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No custom questions added yet. Use the form above to add questions!
              </p>
            ) : (
              <div className="space-y-3">
                {questionsList.map((q) => (
                  <div key={q._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          {q.role}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {q.category}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                        title="Delete question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {q.question}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      <strong>Ideal Answer:</strong> {q.idealAnswer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE NEW USER / ADMIN MODAL */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Create Platform User
                </h3>
              </div>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Vikas Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="user@careerbridge.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="student">Student</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="tpo">TPO</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isCreatingUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
