import React, { useState } from 'react';
import api, { getFileUrl } from '../../services/api';
import { 
  Sparkles, 
  FileCheck, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  X, 
  Download, 
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Code
} from 'lucide-react';

const ResumeAnalyzerPage = () => {
  const [targetRole, setTargetRole] = useState('MERN Developer');
  const [selectedFile, setSelectedFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [uploadedFileData, setUploadedFileData] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Resume file size must be less than 5 MB.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only.');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleAnalyze = async () => {
    setError('');
    if (activeTab === 'upload' && !selectedFile) {
      setError('Please select or drag-and-drop a PDF resume first.');
      return;
    }
    if (activeTab === 'text' && !textInput.trim()) {
      setError('Please paste your resume text first.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'upload' && selectedFile) {
        // Multipart Form-Data upload
        const formData = new FormData();
        formData.append('resume', selectedFile);
        formData.append('targetRole', targetRole);

        const res = await api.post('/ai/resume-upload-analyze', formData);

        if (res.success) {
          setReport(res.report);
          setUploadedFileData(res.file);
        }
      } else {
        // Text-based analysis
        const res = await api.post('/ai/resume-analyze', {
          targetRole,
          resumeText: textInput
        });

        if (res.success) {
          setReport(res.report);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-teal-600 text-emerald-500 border-emerald-500';
    if (score >= 65) return 'from-amber-500 to-orange-600 text-amber-500 border-amber-500';
    return 'from-rose-500 to-red-600 text-rose-500 border-rose-500';
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ATS Screening & Keyword Optimizer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <FileCheck className="w-7 h-7 text-indigo-500" />
          AI Resume ATS Analyzer
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Upload your PDF resume. Our AI parser extracts your skills, evaluates formatting and keyword density against target engineering roles, and gives you a certified ATS score.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Role Selector & Mode Toggle Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              1. Select Target Job Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MERN Developer">MERN Stack Developer</option>
              <option value="React Developer">Frontend Engineer (React / TypeScript)</option>
              <option value="Backend Developer">Backend Systems Engineer (Node.js / Express)</option>
              <option value="Full Stack Developer">Full Stack Engineer (Web & Cloud)</option>
              <option value="Software Engineer">Software Engineer (DSA & Core CS)</option>
              <option value="Data Analyst">Data Analyst (Python, SQL & BI)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              2. Choose Input Method
            </label>
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Upload PDF Resume
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'text'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Paste Resume Text
              </button>
            </div>
          </div>
        </div>

        {/* Upload Mode Area */}
        {activeTab === 'upload' ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
              selectedFile
                ? 'border-indigo-500/60 bg-indigo-50/20 dark:bg-indigo-950/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            {selectedFile ? (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document Ready
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                    Replace PDF
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <label className="cursor-pointer font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                    Click to upload your resume PDF
                    <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                  </label>
                  <p className="text-xs text-slate-400 mt-1">or drag and drop your file here (Max 5MB)</p>
                </div>
                <span className="inline-block text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                  PDF format recommended for accurate ATS parsing
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-500">
              Paste your resume content (Summary, Skills, Education, Projects):
            </label>
            <textarea
              rows="6"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. John Doe - Full Stack Developer with experience in React, Node.js, MongoDB, Express, JavaScript, Tailwind CSS..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {loading ? 'AI ATS Engine is Parsing & Scoring Resume...' : 'Analyze Resume with AI'}
        </button>

      </div>

      {/* AI Analysis Report Dashboard */}
      {report && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Score Hero Card */}
          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-indigo-900/50 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6 text-center md:text-left">
              {/* Radial Score Gauge */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center bg-slate-950 border-4 border-indigo-500 shadow-xl shadow-indigo-500/30 shrink-0">
                <div className="text-center">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">{report.score}</span>
                  <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-semibold">ATS Score</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                  {report.score >= 80 ? '🟢 Strong ATS Screening Match' : '🟡 Needs Keyword Optimization'}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Target Role: {report.targetRole}
                </h2>
                <p className="text-xs text-slate-300 max-w-md">
                  Resume scanned for ATS keywords, quantifiable impact, and tech stack alignment for {report.targetRole}.
                </p>
                {uploadedFileData && (
                  <p className="text-[11px] text-indigo-300 font-medium pt-1">
                    📄 File parsed: {uploadedFileData.originalName}
                  </p>
                )}
              </div>
            </div>

            {uploadedFileData?.url && (
              <a
                href={getFileUrl(uploadedFileData.url)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all shrink-0"
              >
                <Download className="w-4 h-4" /> Download Uploaded Resume
              </a>
            )}
          </div>

          {/* Sub-Category Progress Bars */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500" />
              Category Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
              {[
                { name: 'Technical Skills', val: report.categories?.skills || 85 },
                { name: 'Experience & Interns', val: report.categories?.experience || 75 },
                { name: 'Projects & Code Links', val: report.categories?.projects || 80 },
                { name: 'ATS Formatting', val: report.categories?.formatting || 88 },
                { name: 'Keyword Alignment', val: report.categories?.keywords || 82 },
              ].map((cat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <span>{cat.name}</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{cat.val}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Resume Strengths Identified
              </h3>
              <ul className="space-y-3">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses / Gaps */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Areas for ATS Improvement
              </h3>
              <ul className="space-y-3">
                {report.weaknesses.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Missing Skills & ATS Keywords */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-indigo-500" />
                Missing Core Skills for {report.targetRole}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Recruiters search for these exact terms in ATS screenings. Add them if you possess these skills:
              </p>
              <div className="flex flex-wrap gap-2">
                {report.missingSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center gap-1.5"
                  >
                    + {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-purple-500" />
                Recommended High-Impact ATS Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.suggestedKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold"
                  >
                    ✦ {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations checklist */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
                Actionable Recommendations to Reach 90+ Score:
              </h3>
              <div className="space-y-2">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default ResumeAnalyzerPage;
