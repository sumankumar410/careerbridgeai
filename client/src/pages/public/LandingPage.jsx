import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  Bot, 
  FileCheck, 
  Building2, 
  GraduationCap, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-24 py-12">
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Placement & Career Automation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
          Bridge Your Skills to Your <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 bg-clip-text text-transparent">
            Dream Career with AI
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Centralized intelligent platform connecting Students, Recruiters, and Placement Officers. 
          AI-driven resume ATS scoring, real-time job matching, and automated mock interview preparation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/jobs"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Briefcase className="w-4 h-4" />
            Find Jobs
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2 transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Dashboard Preview Card */}
        <div className="mt-12 rounded-3xl p-3 bg-gradient-to-b from-indigo-500/20 to-transparent border border-indigo-100 dark:border-slate-800 shadow-2xl max-w-5xl mx-auto">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">careerbridgeai.platform/dashboard</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">AI Resume Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">84</span>
                  <span className="text-xs text-slate-500">/ 100 ATS Ready</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[84%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Job Compatibility</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">92%</span>
                  <span className="text-xs text-slate-500">Razorpay MERN Role</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[92%]" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs text-slate-400 font-medium">Placement Status</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900 dark:text-white">Shortlisted</span>
                  <span className="text-xs text-indigo-500 font-medium">Round 2 Ready</span>
                </div>
                <span className="text-xs text-slate-400">Google Cloud Campus Drive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Engineered for Campus Placements & Hiring
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Everything students, recruiters, and placement officers need in one unified ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-indigo-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Resume ATS Analyzer</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Scan your resume against target roles. Get instantaneous ATS scores, missing keywords, and actionable recommendations.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Mock Interview Prep</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Practice real technical and HR questions. AI evaluates your answers, highlights missing points, and provides ideal model responses.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Campus Placement Drives</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              TPOs manage campus drives, eligibility cutoffs, and selection rounds while recruiters track and schedule interviews.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;