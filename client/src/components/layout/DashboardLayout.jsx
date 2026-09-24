import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

const DashboardLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar toggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />
      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        <Sidebar 
          isMobileOpen={mobileSidebarOpen} 
          closeMobileSidebar={() => setMobileSidebarOpen(false)} 
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;