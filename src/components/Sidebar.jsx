import React from 'react';
import { LayoutDashboard, Target, Trophy, LogOut, FileText } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, currentUser }) => {
  const isManager = currentUser.role === 'manajer';

  return (
    <aside className="w-64 bg-white border-r border-slate-100 fixed h-full flex flex-col z-20">
      <div className="p-6">
        <div className="bg-slate-200 h-12 rounded flex items-center justify-center font-bold text-slate-500 text-sm tracking-widest mb-8">
          [LOGO]
        </div>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#5D5FEF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          {isManager ? (
            <button
              onClick={() => setActiveTab('targets')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'targets' ? 'bg-[#5D5FEF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Target size={18} /> Kelola Target
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('tracking')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'tracking' ? 'bg-[#5D5FEF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <FileText size={18} /> Input Tracking
            </button>
          )}

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'leaderboard' ? 'bg-[#5D5FEF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Trophy size={18} /> Leaderboard
          </button>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
          <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Signed in as</p>
          <p className="text-sm font-bold text-slate-800 leading-tight">{currentUser.nama}</p>
          <p className="text-[10px] font-bold text-[#5D5FEF] uppercase mt-0.5">{currentUser.role} - {currentUser.tim}</p>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-rose-500 font-medium text-sm hover:text-rose-600 transition-colors w-full justify-center lg:justify-start">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
