import React from 'react';
import { Filter } from 'lucide-react';

const Topbar = ({ activeTab, currentUser }) => {
  const firstName = currentUser.nama.split(' ')[0];
  
  return (
    <header className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {activeTab === 'dashboard' ? `Halo, ${firstName}!` : 
           activeTab === 'targets' ? 'Manajemen Target' : 
           activeTab === 'tracking' ? 'Input Tracking' :
           'Leaderboard'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">Selasa, 7 April 2026</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 relative hover:text-slate-600 shadow-sm">
          <Filter size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
        </button>
        <div className="bg-white border border-slate-200 rounded-xl p-1.5 pr-4 flex items-center gap-3 shadow-sm">
          <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-lg" />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.nama.length > 20 ? currentUser.nama.substring(0, 17) + '...' : currentUser.nama}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{currentUser.tim} Team</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
