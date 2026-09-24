import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getFileUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  X, 
  Check, 
  RefreshCw,
  Eye,
  FileCheck
} from 'lucide-react';

const JobDiscoveryPage = () => {
  const { user, profile, setProfile } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  
  // Application Modal States
  const [selectedJob, setSelectedJob] = useState(null);
  const [resumeSource, setResumeSource] = useState('new'); // 'new' | 'existing'
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [pageAlert, setPageAlert] = useState(null);

  const fileInputRef = useRef(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobs?keyword=${encodeURIComponent(keyword)}`);
      if (res.success) setJobs(res.jobs || []);
    } catch (err) {
      console.error('Jobs fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    if (user?.role === 'student') {
      try {
        const res = await api.get('/applications/my');
        if (res.success && res.applications) {
          const ids = new Set(res.applications.map(a => (typeof a.job === 'object' ? a.job._id : a.job)));
          setAppliedJobIds(ids);
        }
      } catch (err) {
        console.warn('Failed to load previous applications:', err.message);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [keyword]);

  useEffect(() => {
    fetchMyApplications();
  }, [user]);

  // Open apply modal for target job
  const handleOpenApplyModal = (job) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'student') {
      setPageAlert({
        type: 'warning',
        message: 'Only registered Student accounts can apply for job vacancies.'
      });
      return;
    }

    setSelectedJob(job);
    setModalError('');
    setResumeFile(null);
    // Default to existing resume if available, otherwise force new upload
    if (profile?.resumeUrl) {
      setResumeSource('existing');
    } else {
      setResumeSource('new');
    }
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setResumeFile(null);
    setModalError('');
    setSubmitting(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setModalError('Security policy: Only genuine PDF (.pdf) documents are accepted.');
      setResumeFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setModalError('File is too large! Maximum allowed PDF size is 10 MB.');
      setResumeFile(null);
      return;
    }

    setModalError('');
    setResumeFile(file);
  };

  // Submit Job Application with Mandatory Resume
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    // Strict Client Validation: A resume is strictly mandatory
    const hasExistingResume = resumeSource === 'existing' && Boolean(profile?.resumeUrl);
    const hasNewResumeFile = resumeSource === 'new' && Boolean(resumeFile);

    if (!hasExistingResume && !hasNewResumeFile) {
      setModalError('A PDF resume is strictly mandatory to apply for this job. Please select or upload your resume.');
      return;
    }

    setSubmitting(true);
    setModalError('');

    try {
      const formData = new FormData();
      formData.append('jobId', selectedJob._id);

      if (resumeSource === 'new' && resumeFile) {
        formData.append('resume', resumeFile);
      } else if (resumeSource === 'existing' && profile?.resumeUrl) {
        formData.append('resumeUrl', profile.resumeUrl);
      }

      const res = await api.post('/applications/apply', formData);

      if (res.success) {
        setAppliedJobIds(prev => new Set([...prev, selectedJob._id]));
        setPageAlert({
          type: 'success',
          message: `Application for "${selectedJob.title}" at ${selectedJob.companyName} submitted successfully with your PDF resume!`
        });

        // If a new resume was uploaded, update local profile state
        if (resumeSource === 'new' && res.application?.resumeUrl && setProfile) {
          setProfile(prev => ({
            ...prev,
            resumeUrl: res.application.resumeUrl,
            resumeOriginalName: resumeFile.name
          }));
        }

        handleCloseModal();
      }
    } catch (err) {
      setModalError(err.message || 'Failed to submit application. Please verify your resume file and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Job Discovery & Campus Placement Openings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Browse verified tech openings. Upload your tailored PDF resume to apply and calculate ATS compatibility.
          </p>
        </div>
      </div>

      {/* Global Alert Notification */}
      {pageAlert && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium animate-in fade-in duration-200 ${
          pageAlert.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : 'bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            {pageAlert.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span>{pageAlert.message}</span>
          </div>
          <button 
            onClick={() => setPageAlert(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Input Bar */}
      <div className="relative max-w-lg">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search by title, skills (e.g. React, Node.js), company, or location..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">Fetching verified job vacancies...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white">No Matching Openings Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords or clearing filters to view all campus placement openings.
          </p>
        </div>
      )}

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {jobs.map((job) => {
          const hasApplied = appliedJobIds.has(job._id);

          return (
            <div 
              key={job._id} 
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                      {job.title}
                    </h3>
                    <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                      {job.companyName}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {job.salary}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.requiredSkills?.map((s, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                  <span>•</span>
                  <span>Min CGPA: <strong>{job.minCGPA || 6.0}</strong></span>
                </div>

                {hasApplied ? (
                  <span className="px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
                    <Check className="w-3.5 h-3.5" />
                    Applied with Resume
                  </span>
                ) : (
                  <button
                    onClick={() => handleOpenApplyModal(job)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Resume &amp; Apply</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* MANDATORY RESUME UPLOAD APPLICATION MODAL */}
      {/* ==================================================== */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Job Application Submission</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {selectedJob.title}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedJob.companyName} &bull; {selectedJob.location} &bull; {selectedJob.salary}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error in Modal */}
            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Mandatory Resume Requirements Notice */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
              <FileCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Mandatory Requirement:</strong> You must attach a verified PDF resume. The system will extract your skills to calculate your live ATS match score for this position.
              </div>
            </div>

            {/* Resume Selection Section */}
            <form onSubmit={handleSubmitApplication} className="space-y-5">
              
              {/* Option A: Profile Resume Available */}
              {profile?.resumeUrl && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Select Resume Source:
                  </label>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setResumeSource('existing'); setResumeFile(null); setModalError(''); }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        resumeSource === 'existing'
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        {resumeSource === 'existing' && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Saved Profile Resume
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {profile.resumeOriginalName || 'Current Resume.pdf'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setResumeSource('new'); setModalError(''); }}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        resumeSource === 'new'
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <UploadCloud className="w-5 h-5 text-purple-600" />
                        {resumeSource === 'new' && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Upload New Resume
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Tailored for this role (.pdf)
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Input Area (Shown if 'new' or no profile resume exists) */}
              {(resumeSource === 'new' || !profile?.resumeUrl) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Upload Resume File (.PDF strictly required)
                  </label>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      resumeFile 
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-800/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {resumeFile ? (
                      <div className="space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {(resumeFile.size / 1024).toFixed(1)} KB &bull; Ready to submit
                        </p>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline block pt-1">
                          Click to select a different PDF file
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Click to upload your resume
                          </p>
                          <p className="text-[11px] text-slate-500">
                            PDF format only (Max 10 MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || (resumeSource === 'new' && !resumeFile && !profile?.resumeUrl)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting Application with Resume...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm &amp; Submit Application</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobDiscoveryPage;