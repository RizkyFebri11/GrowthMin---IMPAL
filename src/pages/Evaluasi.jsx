import React, { useState, useEffect } from 'react';
import TopStatsRow from '../components/TopStatsRow';
import { supabase } from '../config/supabase';
import { Trash2, Edit3, Check, X } from 'lucide-react';

const Evaluasi = ({ currentUser }) => {
  if (!currentUser) return null;

  const [selectedUser, setSelectedUser] = useState('');
  const [catatan, setCatatan] = useState('');
  const [staffUsers, setStaffUsers] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  
  const isManager = currentUser.role === 'manajer';

  const fetchEvaluationsData = async () => {
    setIsLoading(true);
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      const usersMap = {};
      if (usersData) {
        usersData.forEach(u => {
          usersMap[u.id_user] = u;
        });
        setStaffUsers(usersData.filter(u => u.role === 'staff'));
      }

      const { data: evData } = await supabase.from('evaluations').select('*');
      const { data: kpiData } = await supabase.from('kpi_results').select('id_kpi, id_user');

      const kpiUserMap = {};
      if (kpiData) {
        kpiData.forEach(k => {
          kpiUserMap[k.id_kpi] = k.id_user;
        });
      }

      const formattedEvaluations = [];
      if (evData) {
        const sortedEv = [...evData].sort((a, b) => new Date(b.tanggal_input) - new Date(a.tanggal_input));
        sortedEv.forEach(ev => {
          const staffUserId = kpiUserMap[ev.id_kpi];
          if (currentUser?.role === 'staff' && staffUserId !== currentUser?.id_user) {
            return;
          }
          const staffName = usersMap[staffUserId]?.nama || 'Staff';
          const managerName = usersMap[ev.id_manajer]?.nama || 'Manager';
          const d = new Date(ev.tanggal_input);
          const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;

          formattedEvaluations.push({
            id: ev.id_evaluasi,
            sender: `@${managerName} (Untuk: ${staffName})`,
            date: dateStr,
            text: ev.catatan_evaluasi,
            id_manajer: ev.id_manajer
          });
        });
      }
      setEvaluations(formattedEvaluations);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluationsData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser || !catatan) {
        alert('Harap lengkapi semua isian!');
        return;
    }

    setIsSubmitting(true);
    try {
      // 1. Find the latest KPI record for the selected user to associate with
      let { data: kpiRecord, error: kpiError } = await supabase
        .from('kpi_results')
        .select('id_kpi')
        .eq('id_user', Number(selectedUser))
        .order('tahun', { ascending: false })
        .order('bulan', { ascending: false })
        .limit(1);

      let kpiId;
      if (kpiRecord && kpiRecord.length > 0) {
        kpiId = kpiRecord[0].id_kpi;
      } else {
        // If no KPI record exists, insert a default/empty KPI record for May 2026
        const { data: newKpi, error: createKpiError } = await supabase
          .from('kpi_results')
          .insert([
            {
              id_user: Number(selectedUser),
              bulan: 5,
              tahun: 2026,
              total_leads: 0,
              total_closing: 0,
              total_revenue: 0,
              avg_roas: 0,
              perf_score: 0
            }
          ])
          .select()
          .single();
        
        if (createKpiError || !newKpi) {
          throw new Error(createKpiError?.message || 'Gagal membuat rekam KPI');
        }
        kpiId = newKpi.id_kpi;
      }

      // 2. Insert the evaluation
      const { error: evalError } = await supabase
        .from('evaluations')
        .insert([
          {
            id_kpi: kpiId,
            id_manajer: currentUser.id_user,
            catatan_evaluasi: catatan,
            tanggal_input: new Date().toISOString()
          }
        ]);

      if (evalError) {
        throw new Error(evalError.message);
      }

      alert('Evaluasi berhasil disimpan!');
      setCatatan('');
      setSelectedUser('');
      fetchEvaluationsData(); // Reload list
    } catch (err) {
      console.error(err);
      alert(`Gagal mengirim evaluasi: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id_evaluasi) => {
    console.log('handleDelete called for ID:', id_evaluasi);
    if (!window.confirm('Apakah Anda yakin ingin menghapus evaluasi ini?')) return;
    try {
      const { error } = await supabase
        .from('evaluations')
        .delete()
        .eq('id_evaluasi', id_evaluasi);
      if (error) throw error;
      alert('Evaluasi berhasil dihapus!');
      fetchEvaluationsData();
    } catch (err) {
      console.error(err);
      alert(`Gagal menghapus evaluasi: ${err.message}`);
    }
  };

  const handleStartEdit = (evalItem) => {
    setEditingId(evalItem.id);
    setEditingText(evalItem.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (id_evaluasi) => {
    if (!editingText.trim()) {
      alert('Catatan evaluasi tidak boleh kosong!');
      return;
    }
    try {
      const { error } = await supabase
        .from('evaluations')
        .update({ catatan_evaluasi: editingText })
        .eq('id_evaluasi', id_evaluasi);
      if (error) throw error;
      alert('Evaluasi berhasil diperbarui!');
      setEditingId(null);
      setEditingText('');
      fetchEvaluationsData();
    } catch (err) {
      console.error(err);
      alert(`Gagal memperbarui evaluasi: ${err.message}`);
    }
  };

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
                <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 bg-white" required>
                    <option value="">-- Pilih Staff --</option>
                    {staffUsers.map(staff => (
                        <option key={staff.id_user} value={staff.id_user}>{staff.nama}</option>
                    ))}
                </select>
                </div>
                <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Catatan Evaluasi</label>
                <textarea rows="4" value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 resize-none" placeholder="Masukkan komentar atau penilaian kinerja..." required></textarea>
                </div>
                <button type="submit" disabled={isSubmitting} className={`w-full bg-[#2D2B52] hover:bg-indigo-900 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                  {isSubmitting ? 'Mengirim...' : 'Kirim Evaluasi'}
                </button>
            </form>
            </div>
        )}

        <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit ${isManager ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <h3 className="font-bold text-lg text-slate-800 mb-6">Riwayat Evaluasi</h3>
          {isLoading ? (
            <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>
          ) : (
            <div className="flex flex-col gap-4">
              {evaluations.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm italic">Belum ada evaluasi</div>
              ) : (
                evaluations.map((evalItem) => {
                  const isEditing = editingId === evalItem.id;
                  const canEditOrDelete = isManager && Number(evalItem.id_manajer) === Number(currentUser?.id_user);
                  return (
                    <div key={evalItem.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2 relative">
                        <div className="flex justify-between items-center pr-20">
                            <span className="font-semibold text-sm text-slate-700">{evalItem.sender}</span>
                            <span className="text-xs text-slate-500">{evalItem.date}</span>
                        </div>
                        
                        {isEditing ? (
                          <div className="flex flex-col gap-2 mt-1">
                            <textarea
                              rows="3"
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 resize-none bg-white"
                            />
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={handleCancelEdit} 
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-xs font-semibold flex items-center gap-1"
                              >
                                <X size={12} /> Batal
                              </button>
                              <button 
                                onClick={() => handleSaveEdit(evalItem.id)} 
                                className="px-3 py-1 bg-[#2D2B52] hover:bg-indigo-900 text-white rounded text-xs font-semibold flex items-center gap-1"
                              >
                                <Check size={12} /> Simpan
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600 pr-10">{evalItem.text}</p>
                        )}
                        
                        {canEditOrDelete && !isEditing && (
                          <div className="absolute right-4 top-4 flex gap-2">
                            <button 
                              onClick={() => handleStartEdit(evalItem)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              title="Edit Catatan"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(evalItem.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Hapus Catatan"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Evaluasi;
