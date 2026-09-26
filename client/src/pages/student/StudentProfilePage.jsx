import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { getFileUrl } from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Building2, 
  Award, 
  Briefcase, 
  Code, 
  FileText, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  RefreshCw,
  Eye,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentProfilePage = () => {
  const { user, profile, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'resume' | 'skills' | 'projects' | 'experience' | 'certifications'
  
  // Basic & Academic Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    college: '',
    degree: 'B.Tech',
    branch: 'CSE',
    cgpa: '',
    gradYear: 2026
  });

  // Skills State
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');

  // Projects State
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: ''
  });
  const [showAddProject, setShowAddProject] = useState(false);

  // Experience State
  const [experience, setExperience] = useState([]);
  const [newExp, setNewExp] = useState({
    company: '',
    role: '',
    duration: '',
    description: ''
  });
  const [showAddExp, setShowAddExp] = useState(false);

  // Certifications State
  const [certifications, setCertifications] = useState([]);
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialUrl: ''
  });
  const [showAddCert, setShowAddCert] = useState(false);

  // Resume Upload State
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState('');
  const [resumeError, setResumeError] = useState('');

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Sync Form Data with Auth Context Profile
  useEffect(() => {
    if (user || profile) {
      setFormData({
        name: user?.name || '',
        phone: user?.phone || profile?.phone || '',
        location: profile?.location || '',
        college: profile?.college || 'Engineering College',
        degree: profile?.degree || 'B.Tech',
        branch: profile?.branch || 'CSE',
        cgpa: profile?.cgpa || '',
        gradYear: profile?.gradYear || 2026
      });
      setSkills(profile?.skills || ['React.js', 'Node.js', 'JavaScript', 'MongoDB']);
      setProjects(profile?.projects || []);
      setExperience(profile?.experience || []);
      setCertifications(profile?.certifications || []);
    }
  }, [user, profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1. Save Basic & Academic Info
  const handleSaveBasicInfo = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        college: formData.college,
        degree: formData.degree,
        branch: formData.branch,
        cgpa: formData.cgpa ? Number(formData.cgpa) : 0,
        gradYear: Number(formData.gradYear),
        skills,
        projects,
        experience,
        certifications
      };

      const res = await updateProfile(payload);
      if (res?.success) {
        setSaveSuccess('Profile updated successfully!');
        setTimeout(() => setSaveSuccess(''), 4000);
      }
    } catch (err) {
      setSaveError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // 2. Resume PDF Upload Handler
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setResumeError('Please select a PDF resume file.');
      return;
    }

    if (!resumeFile.name.toLowerCase().endsWith('.pdf')) {
      setResumeError('Only PDF format (.pdf) is supported.');
      return;
    }

    setUploadingResume(true);
    setResumeSuccess('');
    setResumeError('');

    try {
      const fileData = new FormData();
      fileData.append('resume', resumeFile);
      fileData.append('targetRole', profile?.branch === 'CSE' ? 'Software Engineer' : 'Developer');

      const res = await api.post('/ai/resume-upload-analyze', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success) {
        setResumeSuccess('PDF Resume uploaded and analyzed successfully by AI!');
        setResumeFile(null);
        // Refresh profile in context
        const meRes = await api.get('/auth/me');
        if (meRes.success) {
          updateProfile({ ...meRes.profile, ...meRes.user });
        }
      }
    } catch (err) {
      setResumeError(err.message || 'Failed to upload PDF resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  // 3. Add Skill
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill('');
      updateProfile({ skills: updated });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updated = skills.filter((s) => s !== skillToRemove);
    setSkills(updated);
    updateProfile({ skills: updated });
  };

  // 4. Add Project
  const handleAddProjectSubmit = (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;

    const techArray = newProject.technologies
      ? newProject.technologies.split(',').map((t) => t.trim())
      : [];

    const updated = [
      ...projects,
      {
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        technologies: techArray,
        githubUrl: newProject.githubUrl.trim(),
        liveUrl: newProject.liveUrl.trim()
      }
    ];

    setProjects(updated);
    setNewProject({ name: '', description: '', technologies: '', githubUrl: '', liveUrl: '' });
    setShowAddProject(false);
    updateProfile({ projects: updated });
  };

  const handleRemoveProject = (index) => {
    const updated = projects.filter((_, i) => i !== index);
    setProjects(updated);
    updateProfile({ projects: updated });
  };

  // 5. Add Experience
  const handleAddExpSubmit = (e) => {
    e.preventDefault();
    if (!newExp.company.trim() || !newExp.role.trim()) return;

    const updated = [
      ...experience,
      {
        company: newExp.company.trim(),
        role: newExp.role.trim(),
        duration: newExp.duration.trim(),
        description: newExp.description.trim()
      }
    ];

    setExperience(updated);
    setNewExp({ company: '', role: '', duration: '', description: '' });
    setShowAddExp(false);
    updateProfile({ experience: updated });
  };

  const handleRemoveExp = (index) => {
    const updated = experience.filter((_, i) => i !== index);
    setExperience(updated);
    updateProfile({ experience: updated });
  };

  // Calculate completion percentage
  let completion = 30;
  if (user?.name) completion += 10;
  if (formData.phone) completion += 10;
  if (formData.cgpa) completion += 15;
  if (skills.length >= 3) completion += 15;
  if (profile?.resumeUrl) completion += 20;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Profile Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-indigo-500/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black text-white shadow-inner shrink-0">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              (user?.name || 'S').charAt(0).toUpperCase()
            )}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              {user?.name || 'Student Name'}
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm flex items-center gap-2">
              <span>{user?.email}</span> • <span>{formData.phone || 'No Phone Added'}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/20">
                🎓 {formData.branch} • {formData.degree} ({formData.gradYear})
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                {formData.college || 'Engineering College'}
              </span>
            </div>
          </div>
        </div>

        {/* Completion Widget */}
        <div className="w-full md:w-52 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span>Profile Rating</span>
            <span className="font-extrabold text-emerald-300">{completion}%</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${completion}%` }} />
          </div>
          <p className="text-[11px] text-white/80">
            {profile?.resumeUrl ? '✓ Resume Uploaded' : '⚠️ Upload Resume PDF'}
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800/80 p-1.5 border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'personal'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Basic & Academic</span>
        </button>

        <button
          onClick={() => setActiveTab('resume')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'resume'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-500" />
          <span>PDF Resume & ATS</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'skills'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Code className="w-4 h-4 text-emerald-500" />
          <span>Skills ({skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4 text-amber-500" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('experience')}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'experience'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-blue-500" />
          <span>Experience ({experience.length})</span>
        </button>
      </div>

      {/* Global Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {saveError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* TAB 1: BASIC & ACADEMIC INFO */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSaveBasicInfo} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                Personal & Academic Details
              </h2>
              <p className="text-xs text-slate-500">Update your student record for placement eligibility matching.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Suman Kumar"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Contact Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College / University Name</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Apex Institute of Technology"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Location / City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore, Karnataka"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Degree</label>
              <select
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="M.Tech">M.Tech (Master of Technology)</option>
                <option value="BCA">BCA (Bachelor of Computer Applications)</option>
                <option value="MCA">MCA (Master of Computer Applications)</option>
                <option value="B.Sc">B.Sc Computer Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Branch / Specialization</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CSE">CSE (Computer Science & Engineering)</option>
                <option value="IT">IT (Information Technology)</option>
                <option value="ECE">ECE (Electronics & Communication)</option>
                <option value="EEE">EEE (Electrical Engineering)</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="OTHER">Other Stream</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Cumulative CGPA (0.00 to 10.00)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="8.50"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Graduation Year / Batch</label>
              <select
                name="gradYear"
                value={formData.gradYear}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Basic Details</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PDF RESUME MANAGEMENT */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  PDF Resume & AI ATS Score
                </h2>
                <p className="text-xs text-slate-500">Upload your PDF resume to auto-attach to job applications and run AI ATS scoring.</p>
              </div>
            </div>

            {/* Current Resume Card */}
            {profile?.resumeUrl ? (
              <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {profile.resumeOriginalName || 'Uploaded_Resume.pdf'}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="text-emerald-600 font-semibold">✓ Active for Job Applications</span>
                      <span>• Score: {profile.resumeScore || 85}/100</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={getFileUrl(profile.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </a>

                  <Link
                    to="/student/resume"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI ATS Test</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold">No PDF Resume Uploaded Yet!</p>
                  <p>Upload your PDF resume below to automatically attach it when applying for jobs.</p>
                </div>
              </div>
            )}

            {/* Resume Upload Form */}
            <form onSubmit={handleResumeUpload} className="space-y-4 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upload / Update PDF Resume (.pdf file)
              </label>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/40">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => setResumeFile(e.target.files[0] || null)}
                  className="hidden"
                  id="resume-upload-input"
                />
                <label htmlFor="resume-upload-input" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {resumeFile ? resumeFile.name : 'Click to browse or drag & drop your PDF Resume'}
                  </p>
                  <p className="text-[11px] text-slate-400">PDF files only (Max 10 MB)</p>
                </label>
              </div>

              {resumeSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{resumeSuccess}</span>
                </div>
              )}

              {resumeError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{resumeError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={uploadingResume || !resumeFile}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingResume ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{uploadingResume ? 'Uploading & Analyzing with AI...' : 'Upload PDF Resume'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS MANAGEMENT */}
      {activeTab === 'skills' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-emerald-500" />
                Technical & Soft Skills
              </h2>
              <p className="text-xs text-slate-500">Skills are matched by AI against recruiter job requirements.</p>
            </div>
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. React.js, Python, Docker, MongoDB"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </form>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                Projects Portfolio
              </h2>
              <p className="text-xs text-slate-500">Add your web apps, open source contributions, or college projects.</p>
            </div>
            <button
              onClick={() => setShowAddProject(!showAddProject)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          {showAddProject && (
            <form onSubmit={handleAddProjectSubmit} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add New Project</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="e.g. CareerBridgeAI Platform"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Technologies (comma separated)</label>
                  <input
                    type="text"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Description</label>
                <textarea
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="Built AI-powered job search engine..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repo URL</label>
                  <input
                    type="url"
                    value={newProject.githubUrl}
                    onChange={(e) => setNewProject({ ...newProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Website URL</label>
                  <input
                    type="url"
                    value={newProject.liveUrl}
                    onChange={(e) => setNewProject({ ...newProject, liveUrl: e.target.value })}
                    placeholder="https://your-app.vercel.app"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Save Project
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{proj.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{proj.description}</p>
                  {proj.technologies?.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-500" />
                Internships & Work Experience
              </h2>
              <p className="text-xs text-slate-500">Highlight previous internships, freelance, or research roles.</p>
            </div>
            <button
              onClick={() => setShowAddExp(!showAddExp)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          {showAddExp && (
            <form onSubmit={handleAddExpSubmit} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Add Experience</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Organization *</label>
                  <input
                    type="text"
                    required
                    value={newExp.company}
                    onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                    placeholder="e.g. Razorpay / Infosys"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={newExp.role}
                    onChange={(e) => setNewExp({ ...newExp, role: e.target.value })}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration</label>
                <input
                  type="text"
                  value={newExp.duration}
                  onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                  placeholder="e.g. May 2025 - Aug 2025 (3 Months)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddExp(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
                >
                  Save Experience
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {experience.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{exp.role}</h4>
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{exp.company} • <span className="text-slate-500 font-normal">{exp.duration}</span></p>
                  {exp.description && <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">{exp.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExp(idx)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProfilePage;
