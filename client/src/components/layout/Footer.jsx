import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">CareerBridgeAI</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
              Next-Gen Campus Placement & Job Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span>
              Developed by <strong className="font-semibold text-slate-700 dark:text-slate-200">Suman Kumar</strong>
            </span>
            <span>•</span>
            <Link to="/admin/login" className="hover:text-purple-600 dark:hover:text-purple-400 font-semibold transition-colors flex items-center gap-1">
              🛡️ Master Admin
            </Link>
          </div>

          <div className="text-xs text-slate-400">
            © {new Date().getFullYear()} CareerBridgeAI. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;