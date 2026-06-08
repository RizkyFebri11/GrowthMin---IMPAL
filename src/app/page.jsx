"use client";

import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Dashboard from '../pages/Dashboard';
import KelolaTarget from '../pages/KelolaTarget';
import Leaderboard from '../pages/Leaderboard';
import InputTracking from '../pages/InputTracking';
import Evaluasi from '../pages/Evaluasi';
import Login from '../pages/Login';
import Profile from '../pages/Profile';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={(user) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab('dashboard'); // Reset tab on login
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans overflow-x-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false); // Close sidebar on mobile
        }} 
        onLogout={() => setIsAuthenticated(false)} 
        currentUser={currentUser} 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 lg:ml-64 ml-0 p-4 sm:p-8 min-h-screen">
        <Topbar activeTab={activeTab} currentUser={currentUser} setSidebarOpen={setSidebarOpen} />

        {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} setActiveTab={setActiveTab} />}
        {activeTab === 'targets' && <KelolaTarget currentUser={currentUser} />}
        {activeTab === 'tracking' && <InputTracking currentUser={currentUser} />}
        {activeTab === 'leaderboard' && <Leaderboard currentUser={currentUser} />}
        {activeTab === 'evaluasi' && <Evaluasi currentUser={currentUser} />}
        {activeTab === 'profile' && <Profile currentUser={currentUser} onUpdateUser={setCurrentUser} />}
      </main>
    </div>
  );
};

export default App;
