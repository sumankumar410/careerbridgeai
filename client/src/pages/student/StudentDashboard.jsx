import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Sparkles, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/applications/my')
        ]);
        if (jobsRes.success) setJobs(jobsRes.jobs.slice(0, 3));
        if (appsRes.success) setApplications(appsRes.applications);
      } catch (err) {
        console.error('Failed to load dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const completionPercentage = profile?.skills?.length ? 85 : 45;

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
            🎓 {profile?.branch || 'CSE'} Department • Batch {profile?.gradYear || 2026}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-indigo-100 text-sm max-w-xl">
            Your profile is ready for campus placement drives and AI job matching.
          </p>
        </div>

        <div className="w-full md:w-56 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span>Profile Completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
          <Link to="/student/profile" className="text-[11px] text-white/80 hover:text-white flex items-center gap-1">
            Complete your skills & projects <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Applications</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{applications.length}</p>
          <span className="text-[11px] text-slate-500">Active submissions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Shortlisted</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {applications.filter(a => a.status === 'shortlisted').length}
          </p>
          <span className="text-[11px] text-slate-500">Selected for next rounds</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Resume ATS Score</span>
            <FileCheck className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {profile?.resumeScore || 84}<span className="text-sm font-normal text-slate-400">/100</span>
          </p>
          <Link to="/student/resume" className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            View AI Analysis Report →
          </Link>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Academic CGPA</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {profile?.cgpa || 8.7}<span className="text-sm font-normal text-slate-400">/10</span>
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Eligible for 95% drives</span>
        </div>
      </div>

      {/* Main Content Split: Recommended Jobs & Applications Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recommended Jobs */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              AI Recommended Jobs
            </h2>
            <Link to="/student/jobs" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All Jobs →
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div 
                key={job._id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{job.title}</h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{job.companyName}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                    {job.salary}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                  <span>•</span>
                  <span>Min CGPA: {job.minCGPA}</span>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">92% AI Match</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Link
                    to="/student/jobs"
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all"
                  >
                    Quick Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Widget: AI Tools Quick Launch */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Placement Tools</h2>
          
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">AI Mock Interview</h4>
                <p className="text-xs text-slate-500">Practice role questions & get instant grading</p>
              </div>
            </div>
            <Link
              to="/student/interview-prep"
              className="block w-full py-2 text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Start Practice Session
            </Link>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Skill Gap Analysis</h4>
                <p className="text-xs text-slate-500">Compare with dream companies & roadmap</p>
              </div>
            </div>
            <Link
              to="/student/skill-gap"
              className="block w-full py-2 text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              View Learning Roadmap
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;