import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck,
  Sparkles,
  Bot,
  TrendingUp,
  User,
  PlusCircle,
  Users,
  Building2,
  BarChart3,
  CalendarCheck
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
  const { user } = useAuth();
  if (!user) return null;

  // Role based menu items
  const menuConfig = {
    student: [
      { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { name: 'Job Discovery', path: '/student/jobs', icon: Briefcase },
      { name: 'My Applications', path: '/student/applications', icon: CalendarCheck },
      { name: 'AI Resume Analyzer', path: '/student/resume', icon: FileCheck },
      { name: 'AI Interview Prep', path: '/student/interview-prep', icon: Sparkles },
      { name: 'AI Career Assistant', path: '/student/ai-assistant', icon: Bot },
      { name: 'Skill Gap Analysis', path: '/student/skill-gap', icon: TrendingUp },
      { name: 'My Profile', path: '/student/profile', icon: User },
    ],
    recruiter: [
      { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
      { name: 'Post New Job', path: '/recruiter/jobs/new', icon: PlusCircle },
      { name: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
      { name: 'Applicant Tracking', path: '/recruiter/applicants', icon: Users },
    ],
    tpo: [
      { name: 'Placement Dashboard', path: '/tpo/dashboard', icon: LayoutDashboard },
      { name: 'Placement Drives', path: '/tpo/drives', icon: Building2 },
      { name: 'Student Directory', path: '/tpo/students', icon: Users },
      { name: 'Analytics & Reports', path: '/tpo/reports', icon: BarChart3 },
    ],
    admin: [
      { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'User Management', path: '/admin/users', icon: Users },
      { name: 'Jobs Moderation', path: '/admin/jobs', icon: Briefcase },
      { name: 'Applications', path: '/admin/applications', icon: CalendarCheck },
      { name: 'Question Bank', path: '/admin/questions', icon: Sparkles },
    ]
  };

  const navItems = menuConfig[user.role] || menuConfig.student;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={closeMobileSidebar} 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container with Mobile Smooth Scroll */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out flex flex-col justify-between p-4 overflow-y-auto scrollbar-thin ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {user.role} Portal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom AI Status Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Powered</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Resume matching & mock interview evaluations active.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;