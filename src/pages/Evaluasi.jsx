import React, { useState } from 'react';
import TopStatsRow from '../components/TopStatsRow';
import { MOCK_USERS, EVALUATIONS } from '../data/mockData';

const Evaluasi = ({ currentUser }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [catatan, setCatatan] = useState('');
  const isManager = currentUser.role === 'manajer';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser || !catatan) {
        alert('Harap lengkapi semua isian!');
        return;
    }
    alert('Evaluasi berhasil disimpan (Mock)!');
    setCatatan('');
  };

  const staffUsers = MOCK_USERS.filter(u => u.role === 'staff');

  return (
    <div className="animate-in fade-in duration-300">
      <TopStatsRow currentUser={currentUser} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {isManager && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4 h-fit">
            <h3 className="font-bold text-lg text-slate-800">Berikan Evaluasi</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Pilih Staff</label>
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white">
                    <option value="">-- Pilih Staff --</option>
                    {staffUsers.map(staff => (
                        <option key={staff.id_user} value={staff.id_user}>{staff.nama}</option>
                    ))}
                </select>
                </div>
                <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Catatan Evaluasi</label>
                <textarea rows="4" value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 resize-none" placeholder="Masukkan komentar atau penilaian kinerja..."></textarea>
                </div>
                <button type="submit" className="w-full bg-[#2D2B52] hover:bg-indigo-900 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
                Kirim Evaluasi
                </button>
            </form>
            </div>
        )}

        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit ${isManager ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h3 className="font-bold text-lg text-slate-800 mb-6">Riwayat Evaluasi</h3>
          <div className="flex flex-col gap-4">
            {EVALUATIONS.map(evalItem => (
                <div key={evalItem.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <span className="font-semibold text-sm text-slate-700">{evalItem.sender}</span>
                        <span className="text-xs text-slate-500">{evalItem.date}</span>
                    </div>
                    <p className="text-sm text-slate-600">{evalItem.text}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Evaluasi;
