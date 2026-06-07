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

  if (!isAuthenticated || !currentUser) {
    return <Login onLogin={(user) => {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab('dashboard'); // Reset tab on login
    }} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsAuthenticated(false)} currentUser={currentUser} />

      <main className="flex-1 ml-64 p-8">
        <Topbar activeTab={activeTab} currentUser={currentUser} />

        {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} />}
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
