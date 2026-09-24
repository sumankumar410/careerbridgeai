import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, PlusCircle, Edit3, Trash2, Eye, MapPin, DollarSign, Users } from 'lucide-react';

const ManageJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.success) setJobs(res.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job) => {
    try {
      const newStatus = job.status === 'active' ? 'closed' : 'active';
      const res = await api.put(`/jobs/${job._id}`, { status: newStatus });
      if (res.success) {
        setMessage(`Job status changed to ${newStatus}`);
        fetchJobs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-500" />
            Manage Job Postings
          </h1>
          <p className="text-sm text-slate-500">View, edit criteria, or close active job vacancies.</p>
        </div>

        <Link
          to="/recruiter/jobs/new"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Role
        </Link>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {message}
        </div>
      )}

      {/* Jobs Table & Cards */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{job.title}</h3>
                <button
                  onClick={() => handleToggleStatus(job)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full cursor-pointer ${
                    job.status === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {job.status === 'active' ? '● Active' : 'Closed'}
                </button>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                {job.companyName} • {job.location} • <span className="text-slate-500 font-normal">{job.salary}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                <span>Min CGPA: {job.minCGPA}</span>
                <span>•</span>
                <span>Branches: {job.eligibleBranches?.join(', ')}</span>
                <span>•</span>
                <span>Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <Link
                to={`/recruiter/applicants`}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Applicants
              </Link>
              <Link
                to={`/recruiter/jobs/new?edit=${job._id}`}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit / Update
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ManageJobsPage;
