import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Briefcase, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Building2, MapPin, DollarSign } from 'lucide-react';

const PostJobPage = () => {
  const [searchParams] = useSearchParams();
  const editJobId = searchParams.get('edit');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    responsibilities: '',
    requiredSkills: '',
    minCGPA: 7.0,
    eligibleBranches: ['CSE', 'IT'],
    experience: '0-2 Years',
    salary: '12-16 LPA',
    location: 'Bengaluru, India',
    jobType: 'Full-time',
    openings: 3,
    deadline: '2026-10-30',
    status: 'active'
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // If in edit mode, load existing job data
  useEffect(() => {
    if (editJobId) {
      const fetchJob = async () => {
        setFetching(true);
        try {
          const res = await api.get(`/jobs/${editJobId}`);
          if (res.success && res.job) {
            const j = res.job;
            setFormData({
              title: j.title || '',
              companyName: j.companyName || '',
              description: j.description || '',
              responsibilities: Array.isArray(j.responsibilities) ? j.responsibilities.join('\n') : '',
              requiredSkills: Array.isArray(j.requiredSkills) ? j.requiredSkills.join(', ') : '',
              minCGPA: j.minCGPA || 7.0,
              eligibleBranches: j.eligibleBranches || ['CSE', 'IT'],
              experience: j.experience || '0-2 Years',
              salary: j.salary || '',
              location: j.location || '',
              jobType: j.jobType || 'Full-time',
              openings: j.openings || 3,
              deadline: j.deadline ? j.deadline.split('T')[0] : '2026-10-30',
              status: j.status || 'active'
            });
          }
        } catch (err) {
          setMessage({ type: 'error', text: 'Could not load job details for editing.' });
        } finally {
          setFetching(false);
        }
      };
      fetchJob();
    }
  }, [editJobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleBranchToggle = (branch) => {
    if (formData.eligibleBranches.includes(branch)) {
      setFormData({
        ...formData,
        eligibleBranches: formData.eligibleBranches.filter((b) => b !== branch)
      });
    } else {
      setFormData({
        ...formData,
        eligibleBranches: [...formData.eligibleBranches, branch]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        responsibilities: formData.responsibilities.split('\n').map((r) => r.trim()).filter(Boolean),
        minCGPA: parseFloat(formData.minCGPA) || 6.0,
        openings: parseInt(formData.openings) || 1
      };

      if (editJobId) {
        // Update existing job
        const res = await api.put(`/jobs/${editJobId}`, payload);
        if (res.success) {
          setMessage({ type: 'success', text: 'Job updated successfully!' });
          setTimeout(() => navigate('/recruiter/dashboard'), 1500);
        }
      } else {
        // Create new job
        const res = await api.post('/jobs', payload);
        if (res.success) {
          setMessage({ type: 'success', text: 'Job posted successfully!' });
          setTimeout(() => navigate('/recruiter/dashboard'), 1500);
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Operation failed. Please verify fields.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p className="animate-pulse">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/recruiter/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
          {editJobId ? 'Edit Mode' : 'New Job Posting'}
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-500" />
          {editJobId ? 'Update Job Opening' : 'Post a New Job Opening'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Define eligibility criteria, branch restrictions, and tech stack for automated AI matching.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Row 1: Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Full Stack MERN Developer"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              required
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Razorpay / Google"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Row 2: Location, Salary, Job Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Location *
            </label>
            <input
              type="text"
              required
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bengaluru, India (Hybrid)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Package / Salary *
            </label>
            <input
              type="text"
              required
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 14-18 LPA"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Employment Type
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            >
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Remote">Remote</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
        </div>

        {/* Row 3: Min CGPA Cutoff & Eligible Branches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Minimum CGPA Cutoff (0-10) *
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              name="minCGPA"
              value={formData.minCGPA}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">Students below this CGPA will automatically be flagged as ineligible.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Eligible Engineering Branches
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'].map((branch) => {
                const checked = formData.eligibleBranches.includes(branch);
                return (
                  <button
                    type="button"
                    key={branch}
                    onClick={() => handleBranchToggle(branch)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      checked
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {branch}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 4: Required Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Required Skills (Comma separated) *
          </label>
          <input
            type="text"
            required
            name="requiredSkills"
            value={formData.requiredSkills}
            onChange={handleChange}
            placeholder="e.g. React, Node.js, MongoDB, JavaScript, Tailwind CSS"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Row 5: Job Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Job Description & Role Overview *
          </label>
          <textarea
            rows="3"
            required
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the engineering team and what the candidate will work on..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Row 6: Key Responsibilities */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Key Responsibilities (One per line)
          </label>
          <textarea
            rows="3"
            name="responsibilities"
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="Build responsive React components&#10;Design RESTful APIs in Node.js&#10;Optimize database queries and indexes"
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Row 7: Deadline, Openings & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Application Deadline
            </label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Number of Openings
            </label>
            <input
              type="number"
              min="1"
              name="openings"
              value={formData.openings}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Job Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white font-medium"
            >
              <option value="active">Active (Open)</option>
              <option value="closed">Closed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Link
            to="/recruiter/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : editJobId ? 'Update Job Opening' : 'Publish Job Opening'}
          </button>
        </div>

      </form>

    </div>
  );
};

export default PostJobPage;
