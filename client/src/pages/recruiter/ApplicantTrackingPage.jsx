import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, CheckCircle, XCircle, Clock, Calendar, AlertCircle } from 'lucide-react';

const ApplicantTrackingPage = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all recruiter jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs');
        if (res.success && res.jobs.length > 0) {
          setJobs(res.jobs);
          setSelectedJobId(res.jobs[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  // Fetch applicants for selected job
  useEffect(() => {
    if (!selectedJobId) return;
    const fetchApplicants = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/applications/job/${selectedJobId}`);
        if (res.success) {
          setApplicants(res.applications);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplicants();
  }, [selectedJobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      const res = await api.put(`/applications/${appId}/status`, { status: newStatus });
      if (res.success) {
        setMessage(`Candidate status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
        setApplicants(
          applicants.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-500" />
          Applicant Tracking System (ATS)
        </h1>
        <p className="text-sm text-slate-500">Screen candidate submissions, review AI compatibility scores, and schedule interview rounds.</p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {message}
        </div>
      )}

      {/* Select Job Filter */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Select Job Role</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full sm:w-80 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.companyName})
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
          {applicants.length} Total Applicants
        </span>
      </div>

      {/* Applicants List */}
      {loading ? (
        <p className="text-sm text-slate-400 py-8 text-center animate-pulse">Loading candidate applications...</p>
      ) : applicants.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No applicants yet for this role</h3>
          <p className="text-xs text-slate-400">Applications from registered students will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applicants.map((app) => (
            <div
              key={app._id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 font-bold flex items-center justify-center text-sm">
                    {app.student?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.student?.name || 'Student Candidate'}</h4>
                    <p className="text-xs text-slate-400">{app.student?.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ⚡ {app.matchScore || 85}% AI Match
                  </span>
                  <span>•</span>
                  <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className="capitalize font-medium text-indigo-600 dark:text-indigo-400">
                    Status: {app.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2">
                <select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
                >
                  <option value="applied">Applied</option>
                  <option value="under_review">Under Review</option>
                  <option value="shortlisted">Shortlist</option>
                  <option value="interview_scheduled">Schedule Interview</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ApplicantTrackingPage;
