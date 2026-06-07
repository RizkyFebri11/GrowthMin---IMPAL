import React, { useState, useEffect } from 'react';
import { User, Shield, Briefcase, Camera, Save, Settings, Heart, Star, Users, Award } from 'lucide-react';
import { supabase } from '../config/supabase';
import Modal from '../components/Modal';

// Predefined premium preset avatars from Unsplash
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
];

// Predefined initials background colors (tailored modern palette)
const INITIALS_COLORS = [
  { name: 'Indigo', hex: '4F46E5' },
  { name: 'Emerald', hex: '10B981' },
  { name: 'Amber', hex: 'F59E0B' },
  { name: 'Rose', hex: 'F43F5E' },
  { name: 'Slate', hex: '475569' },
  { name: 'Cyan', hex: '06B6D4' }
];

const Profile = ({ currentUser, onUpdateUser }) => {
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [name, setName] = useState(currentUser?.nama || '');
  const [team, setTeam] = useState(currentUser?.tim || 'Marketing A');
  const [isSaving, setIsSaving] = useState(false);

  // Avatar states
  const [avatarType, setAvatarType] = useState('initials'); // 'initials' | 'preset' | 'url'
  const [initialsBg, setInitialsBg] = useState('4F46E5');
  const [presetUrl, setPresetUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');

  // Stats states (Managers vs Staff)
  const [teamCount, setTeamCount] = useState(0);
  const [teamTargetRevenue, setTeamTargetRevenue] = useState(0);
  const [staffTarget, setStaffTarget] = useState(null);
  const [logsCount, setLogsCount] = useState(0);

  const isManager = currentUser?.role === 'manajer';

  useEffect(() => {
    // Load saved avatar setting from localStorage
    const savedConfig = localStorage.getItem(`profile_avatar_config_${currentUser?.id_user}`);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setAvatarType(parsed.type || 'initials');
        if (parsed.type === 'initials') setInitialsBg(parsed.value);
        else if (parsed.type === 'preset') setPresetUrl(parsed.value);
        else if (parsed.type === 'url') setCustomUrl(parsed.value);
      } catch (e) {
        console.error(e);
      }
    }

    // Fetch dynamic metrics based on role
    if (isManager) {
      fetchManagerStats();
    } else {
      fetchStaffStats();
    }
  }, [currentUser]);

  const fetchManagerStats = async () => {
    if (!currentUser) return;
    try {
      // 1. Get active staff count in the same team
      const { data: teamUsers, error: usersErr } = await supabase
        .from('users')
        .select('id_user')
        .eq('tim', currentUser.tim)
        .eq('role', 'staff');
      
      if (!usersErr && teamUsers) {
        setTeamCount(teamUsers.length);
        
        const userIds = teamUsers.map(u => u.id_user);
        if (userIds.length > 0) {
          const now = new Date();
          const curMonth = now.getMonth() + 1;
          const curYear = now.getFullYear();

          // 2. Get cumulative team target revenue
          const { data: targetsData, error: targetsErr } = await supabase
            .from('targets')
            .select('target_revenue')
            .in('id_user', userIds)
            .eq('bulan', curMonth)
            .eq('tahun', curYear);

          if (!targetsErr && targetsData) {
            const total = targetsData.reduce((acc, curr) => acc + (Number(curr.target_revenue) || 0), 0);
            setTeamTargetRevenue(total);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStaffStats = async () => {
    if (!currentUser) return;
    try {
      const now = new Date();
      const curMonth = now.getMonth() + 1;
      const curYear = now.getFullYear();

      // 1. Get personal monthly target
      const { data: targetData, error: targetErr } = await supabase
        .from('targets')
        .select('*')
        .eq('id_user', currentUser.id_user)
        .eq('bulan', curMonth)
        .eq('tahun', curYear);

      if (!targetErr && targetData && targetData.length > 0) {
        setStaffTarget(targetData[0]);
      }

      // 2. Get number of daily logs submitted
      const { data: logsData, error: logsErr } = await supabase
        .from('daily_logs')
        .select('id_log')
        .eq('id_user', currentUser.id_user);

      if (!logsErr && logsData) {
        setLogsCount(logsData.length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showModal = (type, title, message) => {
    setModal({ isOpen: true, type, title, message });
  };

  // Compute the temporary avatar URL to show in preview
  const getPreviewAvatarUrl = () => {
    if (avatarType === 'initials') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=${initialsBg}&color=fff&bold=true`;
    }
    if (avatarType === 'preset') {
      return presetUrl || PRESET_AVATARS[0];
    }
    if (avatarType === 'url') {
      return customUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=4F46E5&color=fff&bold=true`;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return showModal('error', 'Validasi Gagal', 'Nickname/Nama tidak boleh kosong!');

    setIsSaving(true);
    try {
      // 1. Update users table in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          nama: name,
          tim: team
        })
        .eq('id_user', currentUser.id_user);

      if (error) throw error;

      // 2. Determine avatar value based on selection
      let finalAvatarVal = '';
      if (avatarType === 'initials') finalAvatarVal = initialsBg;
      else if (avatarType === 'preset') finalAvatarVal = presetUrl || PRESET_AVATARS[0];
      else if (avatarType === 'url') finalAvatarVal = customUrl;

      // 3. Save avatar configuration to localStorage
      const avatarConfig = { type: avatarType, value: finalAvatarVal };
      localStorage.setItem(`profile_avatar_config_${currentUser.id_user}`, JSON.stringify(avatarConfig));
      localStorage.setItem(`profile_avatar_url_${currentUser.id_user}`, getPreviewAvatarUrl());

      // 4. Update parent component state instantly
      onUpdateUser({
        ...currentUser,
        nama: name,
        tim: team
      });

      // Dispatch event to sync sidebar avatar in real-time
      window.dispatchEvent(new Event('profile_updated'));

      showModal('success', 'Berhasil', 'Profil Anda telah berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      showModal('error', 'Gagal Menyimpan', `Terjadi kesalahan saat menyimpan profil: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 border border-indigo-100 flex items-center justify-center">
          <User size={20} className="stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Pengaturan Profil</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Avatar Editor Preview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="relative group mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-md relative">
              <img 
                src={getPreviewAvatarUrl()} 
                alt="Avatar Preview" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
            <div className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-md">
              <Camera size={16} />
            </div>
          </div>
          
          <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{name || 'Nama User'}</h3>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5D5FEF] uppercase mt-1 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
            <Shield size={12} /> {currentUser?.role} - {team}
          </span>

          {/* Quick Info Cards based on Roles */}
          <div className="w-full mt-6 space-y-3 pt-6 border-t border-slate-100">
            {isManager ? (
              <>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Staf Dikelola</span>
                    <span className="font-extrabold text-slate-700 text-sm">{teamCount} Orang</span>
                  </div>
                  <Users size={20} className="text-slate-400" />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Bulanan Tim</span>
                    <span className="font-extrabold text-slate-700 text-sm">{formatRupiah(teamTargetRevenue)}</span>
                  </div>
                  <Award size={20} className="text-slate-400" />
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Histori Log Harian</span>
                    <span className="font-extrabold text-slate-700 text-sm">{logsCount} Log Input</span>
                  </div>
                  <Star size={20} className="text-slate-400" />
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center text-left">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Revenue Anda</span>
                    <span className="font-extrabold text-slate-700 text-sm">
                      {staffTarget ? formatRupiah(staffTarget.target_revenue) : 'Rp 0'}
                    </span>
                  </div>
                  <Award size={20} className="text-slate-400" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Profile Form Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-50 pb-3">
              <User size={18} className="text-indigo-600" />
              Detail Informasi Pengguna
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Nickname / Nama */}
              <div className="space-y-2">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Nickname / Nama Lengkap</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap" 
                  className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Team selection */}
              <div className="space-y-2">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Tim / Divisi Kerja</label>
                <select 
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="Marketing A">Marketing A</option>
                  <option value="Marketing B">Marketing B</option>
                  <option value="Marketing C">Marketing C</option>
                </select>
              </div>

              {/* Avatar Selector Section */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider block">Atur Foto Profil</label>
                
                {/* Selector type buttons */}
                <div className="flex border border-slate-100 rounded-xl overflow-hidden p-1 bg-slate-50">
                  <button 
                    type="button"
                    onClick={() => setAvatarType('initials')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${avatarType === 'initials' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Warna Inisial
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAvatarType('preset')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${avatarType === 'preset' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Preset Ilustrasi
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAvatarType('url')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${avatarType === 'url' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    URL Gambar
                  </button>
                </div>

                {/* Sub-selector conditional rendering */}
                {avatarType === 'initials' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <span className="text-[11px] text-slate-400 block font-medium">Pilih warna latar belakang inisial nama Anda:</span>
                    <div className="flex flex-wrap gap-3">
                      {INITIALS_COLORS.map(c => (
                        <button 
                          key={c.hex}
                          type="button"
                          onClick={() => setInitialsBg(c.hex)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm transition-transform duration-200 border-2 hover:scale-105 ${initialsBg === c.hex ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent'}`}
                          style={{ backgroundColor: `#${c.hex}` }}
                          title={c.name}
                        >
                          {name ? name.substring(0,2).toUpperCase() : 'U'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {avatarType === 'preset' && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <span className="text-[11px] text-slate-400 block font-medium">Pilih salah satu foto profil berkualitas tinggi yang tersedia:</span>
                    <div className="grid grid-cols-4 gap-4">
                      {PRESET_AVATARS.map((url, i) => (
                        <button 
                          key={i}
                          type="button"
                          onClick={() => setPresetUrl(url)}
                          className={`aspect-square rounded-2xl overflow-hidden border-3 transition-all relative group shadow-sm hover:scale-105 ${presetUrl === url ? 'border-indigo-600 scale-105 shadow-md' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                          <img src={url} alt={`Preset ${i+1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {avatarType === 'url' && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <span className="text-[11px] text-slate-400 block font-medium">Tempel tautan / URL foto profil kustom Anda:</span>
                    <input 
                      type="url" 
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..." 
                      className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className={`bg-[#4F46E5] hover:bg-indigo-700 text-white h-11 px-8 rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-sm flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <Save size={16} /> {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
                </button>
              </div>

            </form>
          </div>
        </div>

      </div>
      <Modal {...modal} onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default Profile;
