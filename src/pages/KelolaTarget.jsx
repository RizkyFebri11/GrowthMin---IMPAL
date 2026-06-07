import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import TopStatsRow from '../components/TopStatsRow';
import { supabase } from '../config/supabase';
import Modal from '../components/Modal';

const KelolaTarget = ({ currentUser }) => {
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStaff, setNewStaff] = useState({ name: '', role: 'Staff', targetRevenue: '', startDate: '', endDate: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const fetchTargetsData = async () => {
    setIsLoading(true);
    try {
      // Fetch users
      const { data: usersData } = await supabase.from('users').select('*');
      const usersMap = {};
      if (usersData) {
        usersData.forEach(u => {
          usersMap[u.id_user] = u;
        });
      }

      // Fetch daily logs to compute actual revenue for progress
      const { data: logsData } = await supabase.from('daily_logs').select('id_user, nominal_revenue');
      const userActualRev = {};
      if (logsData) {
        logsData.forEach(log => {
          userActualRev[log.id_user] = (userActualRev[log.id_user] || 0) + (Number(log.nominal_revenue) || 0);
        });
      }

      // Fetch targets
      const { data: targetsData } = await supabase.from('targets').select('*');
      
      if (targetsData) {
        const formatted = targetsData.map(t => {
          const user = usersMap[t.id_user] || { nama: 'Unknown', role: 'staff' };
          const actualRev = userActualRev[t.id_user] || 0;
          const targetRevVal = Number(t.target_revenue) || 1;
          const progressPercent = Math.min(100, Math.round((actualRev / targetRevVal) * 100));

          return {
            id: t.id_target,
            name: user.nama,
            role: user.role === 'manajer' ? 'Manager' : 'Staff',
            leads: t.target_leads || 0,
            closing: t.target_closing || 0,
            revenue: t.target_revenue >= 1000000000 ? `Rp ${(t.target_revenue/1000000000).toFixed(1)}B` : t.target_revenue >= 1000000 ? `Rp ${(t.target_revenue/1000000).toFixed(1)}M` : `Rp ${Number(t.target_revenue).toLocaleString()}`,
            roas: `${t.target_roas || 0}x`,
            progress: progressPercent
          };
        });
        setTargets(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTargetsData();
  }, []);

  const handleAddStaff = async () => {
    setErrorMsg('');
    
    if (newStaff.startDate && newStaff.endDate) {
        const start = new Date(newStaff.startDate);
        const end = new Date(newStaff.endDate);
        if (end < start) {
            setErrorMsg('Tanggal Selesai tidak boleh lebih cepat daripada Tanggal Mulai!');
            return;
        }
    }

    if (newStaff.targetRevenue && /[^0-9]/.test(newStaff.targetRevenue)) {
        setErrorMsg('Target Revenue hanya boleh berisi nominal angka (jangan gunakan titik/simbol spesial)!');
        return;
    }

    if (!newStaff.name || !newStaff.role || !newStaff.targetRevenue || !newStaff.startDate || !newStaff.endDate) {
        setErrorMsg('Semua isian tidak boleh kosong!');
        return;
    }

    try {
      // 1. Insert user
      const dummyEmail = `${newStaff.name.toLowerCase().replace(/\s+/g, '')}_${Math.floor(Math.random() * 1000)}@growthmin.com`;
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            nama: newStaff.name,
            email: dummyEmail,
            password: 'password123',
            role: 'staff',
            tim: currentUser?.tim || 'Marketing A'
          }
        ])
        .select()
        .single();

      if (userError || !userData) {
        throw new Error(userError?.message || 'Gagal menambahkan user');
      }

      // 2. Insert target
      const targetBulan = new Date(newStaff.startDate).getMonth() + 1;
      const targetTahun = new Date(newStaff.startDate).getFullYear();
      
      const { error: targetError } = await supabase
        .from('targets')
        .insert([
          {
            id_user: userData.id_user,
            bulan: targetBulan,
            tahun: targetTahun,
            target_leads: 100, // default
            target_closing: 10, // default
            target_revenue: Number(newStaff.targetRevenue),
            target_roas: 4.0 // default
          }
        ]);

      if (targetError) {
        throw new Error(targetError.message);
      }

      setModal({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Staff baru dan targetnya berhasil ditambahkan ke database!' });
      setNewStaff({ name: '', role: 'Staff', targetRevenue: '', startDate: '', endDate: '' });
      fetchTargetsData();
    } catch (e) {
      console.error(e);
      setErrorMsg(`Gagal menyimpan data: ${e.message}`);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <TopStatsRow currentUser={currentUser} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden p-6">
          <h3 className="font-bold text-lg text-slate-800 mb-6">Daftar Staff dan Target Individu</h3>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 rounded-lg">
                  <tr className="text-slate-700">
                    <th className="px-4 py-3 font-semibold rounded-l-lg">Nama Staff</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Target Lead</th>
                    <th className="px-4 py-3 font-semibold">Target Closing</th>
                    <th className="px-4 py-3 font-semibold">Target Revenue</th>
                    <th className="px-4 py-3 font-semibold">ROAS Target</th>
                    <th className="px-4 py-3 font-semibold">Progress bar</th>
                    <th className="px-4 py-3 font-semibold rounded-r-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {targets.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-4 flex items-center gap-2">
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`} alt={t.name} className="w-6 h-6 rounded-full" />
                        <span className="font-medium text-slate-700">{t.name}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{t.role}</td>
                      <td className="px-4 py-4 text-slate-600">{t.leads}</td>
                      <td className="px-4 py-4 text-slate-600">{t.closing}</td>
                      <td className="px-4 py-4 text-slate-600">{t.revenue}</td>
                      <td className="px-4 py-4 text-slate-600">{t.roas}</td>
                      <td className="px-4 py-4">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2D2B52]" style={{width: `${t.progress}%`}}></div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-slate-400 hover:text-slate-600">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-lg text-slate-800 mb-4">Tambah Cepat Staff Baru</h3>
            {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-600 text-xs rounded-lg border border-red-200">{errorMsg}</div>}
            <form className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
                <input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} type="text" placeholder="Name" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                <input 
                  type="text" 
                  value="Staff" 
                  disabled 
                  className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-sm outline-none cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Revenue (Rp)</label>
                <input value={newStaff.targetRevenue} onChange={e => setNewStaff({...newStaff, targetRevenue: e.target.value})} type="text" placeholder="Contoh: 10000000" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                  <input value={newStaff.startDate} onChange={e => setNewStaff({...newStaff, startDate: e.target.value})} type="date" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                  <input value={newStaff.endDate} onChange={e => setNewStaff({...newStaff, endDate: e.target.value})} type="date" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500" />
                </div>
              </div>
              <button onClick={handleAddStaff} type="button" className="w-full bg-[#2D2B52] hover:bg-indigo-900 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
                Tambah
              </button>
            </form>
          </div>
          <div className="bg-slate-100 rounded-2xl flex-1 border border-slate-200 min-h-[150px]"></div>
        </div>
      </div>
      <Modal {...modal} onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default KelolaTarget;
