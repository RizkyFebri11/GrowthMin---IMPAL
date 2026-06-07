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

  // Dismissal states
  const [dismissalModalOpen, setDismissalModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [managerPassword, setManagerPassword] = useState('');
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [dismissalError, setDismissalError] = useState('');

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
        const formatted = targetsData
          .filter(t => {
            const user = usersMap[t.id_user];
            if (!user) return false;
            // Only show staff from the same team if the current user is a manager
            if (currentUser?.role === 'manajer') {
              return user.tim === currentUser.tim && user.role === 'staff';
            }
            return true;
          })
          .map(t => {
            const user = usersMap[t.id_user] || { nama: 'Unknown', role: 'staff' };
            const actualRev = userActualRev[t.id_user] || 0;
            const targetRevVal = Number(t.target_revenue) || 1;
            const progressPercent = Math.min(100, Math.round((actualRev / targetRevVal) * 100));

            return {
              id: t.id_target,
              id_user: t.id_user,
              name: user.nama,
              role: user.role === 'manajer' ? 'Manager' : 'Staff',
              leads: t.target_leads || 0,
              closing: t.target_closing || 0,
              revenue: t.target_revenue >= 1000000000 ? `Rp ${(t.target_revenue/1000000000).toFixed(1)}M` : t.target_revenue >= 1000000 ? `Rp ${(t.target_revenue/1000000).toFixed(1)}Jt` : `Rp ${Number(t.target_revenue).toLocaleString('id-ID')}`,
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
  }, [currentUser]);

  const handleOpenDismissalModal = (staff) => {
    setSelectedStaff(staff);
    setManagerPassword('');
    setAgreementChecked(false);
    setDismissalError('');
    setDismissalModalOpen(true);
  };

  const handleCloseDismissalModal = () => {
    setDismissalModalOpen(false);
    setSelectedStaff(null);
    setManagerPassword('');
    setAgreementChecked(false);
    setDismissalError('');
  };

  const handleConfirmDismissal = async () => {
    setDismissalError('');
    if (!agreementChecked) {
      setDismissalError('Anda harus menyetujui pernyataan keputusan pemecatan.');
      return;
    }
    if (!managerPassword) {
      setDismissalError('Password manajer wajib diisi.');
      return;
    }

    try {
      // Validate password
      let isPasswordCorrect = false;
      if (currentUser?.password) {
        isPasswordCorrect = managerPassword === currentUser.password;
      } else {
        const { data: managerData, error: managerFetchError } = await supabase
          .from('users')
          .select('password')
          .eq('id_user', currentUser.id_user)
          .single();
        
        if (managerFetchError || !managerData) {
          throw new Error('Gagal memverifikasi password manajer.');
        }
        isPasswordCorrect = managerPassword === managerData.password;
      }

      if (!isPasswordCorrect) {
        setDismissalError('Password manajer salah. Verifikasi gagal.');
        return;
      }

      // Cascade delete staff records in Supabase
      // A. Fetch KPI results first
      const { data: kpis } = await supabase
        .from('kpi_results')
        .select('id_kpi')
        .eq('id_user', selectedStaff.id_user);

      if (kpis && kpis.length > 0) {
        const kpiIds = kpis.map(k => k.id_kpi);
        // B. Delete evaluations of those KPIs
        await supabase
          .from('evaluations')
          .delete()
          .in('id_kpi', kpiIds);
      }

      // C. Delete KPI results
      await supabase
        .from('kpi_results')
        .delete()
        .eq('id_user', selectedStaff.id_user);

      // D. Delete targets
      await supabase
        .from('targets')
        .delete()
        .eq('id_user', selectedStaff.id_user);

      // E. Delete daily logs
      await supabase
        .from('daily_logs')
        .delete()
        .eq('id_user', selectedStaff.id_user);

      // F. Delete user
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id_user', selectedStaff.id_user);

      if (deleteUserError) {
        throw new Error(deleteUserError.message);
      }

      // Success notification
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Pemberhentian Berhasil',
        message: `Staf ${selectedStaff.name} telah resmi diberhentikan, dan seluruh data terkait telah dihapus dari sistem.`
      });
      handleCloseDismissalModal();
      fetchTargetsData();
    } catch (err) {
      console.error(err);
      setDismissalError(`Gagal melakukan pemberhentian: ${err.message}`);
    }
  };

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
                    <th className="px-4 py-3 font-semibold rounded-r-lg text-center">Aksi</th>
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
                      <td className="px-4 py-4 text-center">
                        {currentUser?.role === 'manajer' ? (
                          <button
                            onClick={() => handleOpenDismissalModal(t)}
                            className="text-red-500 hover:text-red-700 font-semibold text-xs bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded transition-colors"
                          >
                            Pecat
                          </button>
                        ) : (
                          <button className="text-slate-300 cursor-not-allowed" disabled>
                            <MoreVertical size={16} className="mx-auto" />
                          </button>
                        )}
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

      {/* Dismissal (PHK) Formal Modal */}
      {dismissalModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border-t-4 border-t-red-500 w-full max-w-2xl overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">Surat Pemberhentian Hubungan Kerja (PHK)</h3>
              <button onClick={handleCloseDismissalModal} className="text-slate-400 hover:text-slate-600 font-bold text-lg">&times;</button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              
              {/* Formal Letter Layout */}
              <div className="border border-slate-200 bg-slate-50 p-6 rounded-xl font-serif text-slate-800 shadow-inner relative">
                {/* Letter Header */}
                <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                  <h2 className="text-xl font-bold tracking-wide uppercase">SURAT KETERANGAN PEMBERHENTIAN HUBUNGAN KERJA</h2>
                  <p className="text-xs font-sans text-slate-500 mt-1">Nomor: SK-PHK/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}</p>
                </div>

                {/* Letter Body */}
                <div className="space-y-4 text-sm leading-relaxed">
                  <p>Yang bertanda tangan di bawah ini:</p>
                  <div className="pl-4 font-sans text-xs space-y-1">
                    <div><span className="inline-block w-24 font-semibold">Nama</span>: {currentUser?.nama || 'Manager'}</div>
                    <div><span className="inline-block w-24 font-semibold">Jabatan</span>: Manager Tim {currentUser?.tim || '-'}</div>
                    <div><span className="inline-block w-24 font-semibold">Instansi</span>: GrowthMin Corp.</div>
                  </div>

                  <p>Dengan ini menyatakan menerbitkan Surat Pemberhentian Hubungan Kerja kepada:</p>
                  <div className="pl-4 font-sans text-xs space-y-1">
                    <div><span className="inline-block w-24 font-semibold">Nama Staf</span>: {selectedStaff.name}</div>
                    <div><span className="inline-block w-24 font-semibold">Jabatan</span>: Staff Tim {currentUser?.tim || '-'}</div>
                  </div>

                  <p>
                    Terhitung sejak tanggal surat ini diterbitkan, yaitu pada tanggal <strong>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>, hubungan kerja antara GrowthMin Corp. dengan Saudara/i yang bersangkutan dinyatakan <strong>berakhir</strong>.
                  </p>
                  <p>
                    Keputusan ini diambil setelah mempertimbangkan evaluasi kinerja bulanan serta pencapaian target yang telah disepakati bersama. Seluruh hak dan kewajiban Saudara/i sebagai staf di GrowthMin secara resmi dihentikan.
                  </p>
                  <p>
                    Kami menyampaikan ucapan terima kasih yang sebesar-besarnya atas segala usaha, kerja keras, dan dedikasi yang telah Saudara/i berikan kepada perusahaan selama masa bakti Anda. Kami berharap Saudara/i sukses dalam karir di masa depan.
                  </p>
                </div>

                {/* Signatures */}
                <div className="mt-8 flex justify-between text-xs font-sans">
                  <div>
                    <p className="mb-12">Pihak Penerima (Staf),</p>
                    <p className="font-semibold underline">{selectedStaff.name}</p>
                  </div>
                  <div className="text-right">
                    <p>Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="mb-12">Hormat Kami, Manager {currentUser?.tim || '-'}</p>
                    <p className="font-semibold underline">{currentUser?.nama || 'Manager'}</p>
                  </div>
                </div>
              </div>

              {/* Error Feedback */}
              {dismissalError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                  {dismissalError}
                </div>
              )}

              {/* Checkbox Agreement */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 text-[#2D2B52] border-slate-300 rounded focus:ring-[#2D2B52]"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Saya secara sadar dan bertanggung jawab menyetujui keputusan pemecatan ini serta menerbitkan surat hubungan kerja formal di atas.
                </span>
              </label>

              {/* Password Verification */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Verifikasi Sandi Manajer</label>
                <input
                  type="password"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  placeholder="Masukkan sandi Anda untuk konfirmasi"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={handleCloseDismissalModal}
                type="button"
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDismissal}
                type="button"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-all shadow-md"
              >
                Konfirmasi Pemberhentian
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaTarget;
