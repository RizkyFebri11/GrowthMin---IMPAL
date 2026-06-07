import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Target, Trophy, LogOut, FileText, MessageSquare } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, onLogout, currentUser }) => {
  const isManager = currentUser?.role === 'manajer';
  const [avatarUrl, setAvatarUrl] = useState(`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.nama || 'U')}&background=4F46E5&color=fff&bold=true`);

  useEffect(() => {
    const updateAvatar = () => {
      const savedUrl = localStorage.getItem(`profile_avatar_url_${currentUser?.id_user}`);
      if (savedUrl) {
        setAvatarUrl(savedUrl);
      } else {
        const savedConfig = localStorage.getItem(`profile_avatar_config_${currentUser?.id_user}`);
        if (savedConfig) {
          try {
            const parsed = JSON.parse(savedConfig);
            if (parsed.type === 'initials') {
              setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.nama || 'U')}&background=${parsed.value}&color=fff&bold=true`);
            } else {
              setAvatarUrl(parsed.value);
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.nama || 'U')}&background=4F46E5&color=fff&bold=true`);
        }
      }
    };

    updateAvatar();
    
    window.addEventListener('storage', updateAvatar);
    window.addEventListener('profile_updated', updateAvatar);
    
    return () => {
      window.removeEventListener('storage', updateAvatar);
      window.removeEventListener('profile_updated', updateAvatar);
    };
  }, [currentUser]);

  return (
    <aside className="w-64 bg-white border-r border-slate-100 fixed h-full flex flex-col z-20">
      <div className="p-6">
        <div className="h-32 w-full flex items-center justify-center mb-6">
          <img src="/Logo GrowthMin.png" alt="GrowthMin Logo" className="h-full w-full object-contain scale-110" />
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

          <button
            onClick={() => setActiveTab('evaluasi')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'evaluasi' ? 'bg-[#5D5FEF] text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MessageSquare size={18} /> Evaluasi
          </button>
        </nav>
      </div>

      <div className="mt-auto p-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`w-full text-left bg-slate-50 p-4 rounded-xl mb-4 border flex items-center gap-3 transition-all ${
            activeTab === 'profile' ? 'border-[#5D5FEF] bg-indigo-50/20 shadow-sm' : 'border-slate-100 hover:bg-slate-100 hover:border-slate-200'
          }`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
            <img 
              src={avatarUrl} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-slate-400 uppercase font-semibold leading-none mb-1">Signed in as</p>
            <p className="text-sm font-bold text-slate-800 leading-tight truncate">{currentUser.nama}</p>
            <p className="text-[10px] font-bold text-[#5D5FEF] uppercase mt-0.5 truncate leading-none">
              {currentUser.role === 'manajer' ? 'Manager' : 'Staff'} - {currentUser.tim}
            </p>
          </div>
        </button>
        
        <button onClick={onLogout} className="flex items-center gap-2 text-rose-500 font-medium text-sm hover:text-rose-600 transition-colors w-full justify-center lg:justify-start">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
