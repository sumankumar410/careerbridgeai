import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Briefcase, 
  Users, 
  CheckCircle, 
  PlusCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  Building2,
  Calendar,
  Eye
} from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.success) {
          setJobs(res.jobs);
        }
      } catch (err) {
        console.error('Failed to load recruiter data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRecruiterData();
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            🏢 Recruiter Talent Hub • {user?.company || 'Tech Recruiter'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}!
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Post new engineering openings, screen candidate profiles with AI matching, and update job criteria.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/recruiter/jobs/new"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Job
          </Link>
          <Link
            to="/recruiter/jobs"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all"
          >
            Manage Jobs
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Job Openings</span>
            <Briefcase className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{jobs.length}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Currently live & accepting applications</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Applicants</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">14</p>
          <span className="text-[11px] text-slate-500">Across all job postings</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Shortlisted Candidates</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">6</p>
          <span className="text-[11px] text-slate-500">AI Match score &gt; 85%</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Interviews Scheduled</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">3</p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">This week</span>
        </div>
      </div>

      {/* Posted Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Active Job Openings & Controls
          </h2>
          <Link to="/recruiter/jobs/new" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            + Add Another Role
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <div 
              key={job._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                    {job.jobType}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {job.salary}
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{job.title}</h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">{job.companyName} • {job.location}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{job.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap gap-1">
                  {job.requiredSkills.slice(0, 3).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300">
                      {s}
                    </span>
                  ))}
                  {job.requiredSkills.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{job.requiredSkills.length - 3} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Min CGPA: {job.minCGPA}</span>
                  <Link
                    to={`/recruiter/jobs/new?edit=${job._id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors"
                  >
                    Edit / Update
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default RecruiterDashboard;
