import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Edit2, Trash2, History, X, Plus } from 'lucide-react';
import { supabase } from '../config/supabase';
import Modal from '../components/Modal';

const InputTracking = ({ currentUser }) => {
  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const [formData, setFormData] = useState({
    tanggal: '',
    leads: 0,
    closing: 0,
    spend: 0,
    revenue: 0
  });
  
  const [historyLogs, setHistoryLogs] = useState([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [editingLogId, setEditingLogId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHistory = async () => {
    if (!currentUser?.id_user) return;
    setIsFetchingHistory(true);
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('id_user', currentUser.id_user)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      setHistoryLogs(data || []);
    } catch (err) {
      console.error('Error fetching tracking history:', err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentUser]);

  const showModal = (type, title, message, onConfirm = null) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const increment = (field) => {
    setFormData(prev => ({ ...prev, [field]: Number(prev[field]) + 1 }));
  };

  const decrement = (field) => {
    setFormData(prev => ({ ...prev, [field]: Math.max(0, Number(prev[field]) - 1) }));
  };

  const handleEditClick = (log) => {
    setEditingLogId(log.id_log);
    setFormData({
      tanggal: log.tanggal,
      leads: log.jml_leads,
      closing: log.jml_closing,
      spend: log.nominal_spend,
      revenue: log.nominal_revenue
    });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setFormData({
      tanggal: '',
      leads: 0,
      closing: 0,
      spend: 0,
      revenue: 0
    });
  };

  const handleDeleteClick = (logId) => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title: 'Hapus Log Harian',
      message: 'Apakah Anda yakin ingin menghapus data tracking harian ini? Tindakan ini tidak dapat dibatalkan.',
      onConfirm: () => handleConfirmDelete(logId)
    });
  };

  const handleConfirmDelete = async (logId) => {
    try {
      const { error } = await supabase
        .from('daily_logs')
        .delete()
        .eq('id_log', logId);

      if (error) throw error;

      showModal('success', 'Berhasil', 'Data log harian berhasil dihapus!');
      
      if (editingLogId === logId) {
        handleCancelEdit();
      }
      
      fetchHistory();
    } catch (err) {
      console.error('Error deleting log:', err);
      showModal('error', 'Gagal', `Gagal menghapus data: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return showModal('error', 'Akses Ditolak', 'Silakan login terlebih dahulu!');

    if (!formData.tanggal) {
      showModal('error', 'Validasi Gagal', 'Field required: Tanggal Tracking wajib diisi!');
      return;
    }

    if (Number(formData.leads) < 0 || Number(formData.closing) < 0 || Number(formData.spend) < 0 || Number(formData.revenue) < 0) {
      showModal('error', 'Validasi Gagal', 'Error: Nominal tidak boleh bernilai kurang dari 0!');
      return;
    }

    if (isNaN(Number(formData.leads)) || isNaN(Number(formData.closing)) || isNaN(Number(formData.spend)) || isNaN(Number(formData.revenue))) {
      showModal('error', 'Validasi Gagal', 'Error: Input harus berupa nominal angka valid!');
      return;
    }
    
    setIsSubmitting(true);
    let error;
    if (editingLogId) {
      const { error: err } = await supabase
        .from('daily_logs')
        .update({
          tanggal: formData.tanggal,
          jml_leads: Number(formData.leads),
          jml_closing: Number(formData.closing),
          nominal_revenue: Number(formData.revenue),
          nominal_spend: Number(formData.spend)
        })
        .eq('id_log', editingLogId);
      error = err;
    } else {
      const { error: err } = await supabase.from('daily_logs').insert([
        {
          id_user: currentUser.id_user,
          tanggal: formData.tanggal,
          jml_leads: Number(formData.leads),
          jml_closing: Number(formData.closing),
          nominal_revenue: Number(formData.revenue),
          nominal_spend: Number(formData.spend)
        }
      ]);
      error = err;
    }
    setIsSubmitting(false);

    if (error) {
      console.error(error);
      showModal('error', 'Gagal', 'Gagal mengirim data. Coba lagi!');
      return;
    }

    showModal('success', 'Berhasil', editingLogId ? 'Data harian berhasil diperbarui!' : 'Data harian berhasil dikirim ke database!');
    setFormData({
      tanggal: '',
      leads: 0,
      closing: 0,
      spend: 0,
      revenue: 0
    });
    setEditingLogId(null);
    fetchHistory();
  };

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="animate-in fade-in duration-300 min-h-screen pb-10">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        
        {/* Left Column: Form Card */}
        <div className="xl:col-span-2 bg-white rounded-[20px] shadow-[0_0_8.8px_1px_rgba(0,0,0,0.09)] border border-slate-100 overflow-hidden flex flex-col">
          {/* Header Ribbon */}
          <div className={`${editingLogId ? 'bg-amber-600' : 'bg-[#4F46E5]'} relative px-8 py-6 overflow-hidden flex-shrink-0 transition-colors duration-300`}>
            {/* Abstract pattern lines */}
            <div className="absolute right-0 top-0 w-48 h-full opacity-20 pointer-events-none">
              <div className="w-[50px] h-2 bg-white rounded-full absolute -rotate-[60deg] top-2 right-8"></div>
              <div className="w-[50px] h-2 bg-white rounded-full absolute -rotate-[60deg] top-5 right-4"></div>
              <div className="w-[50px] h-2 bg-white rounded-full absolute -rotate-[60deg] top-10 right-5"></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-white text-2xl font-black mb-0.5">
                {editingLogId ? 'Edit Log Harian' : 'Data Log Harian'}
              </h2>
              <p className="text-white/95 text-xs font-medium">
                {editingLogId ? 'Ubah data tracking log yang telah dipilih' : 'Kirim leads, closing, revenue, dan spend harian'}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tanggal Tracking */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Tanggal Tracking</label>
              <input 
                type="date" 
                name="tanggal"
                value={formData.tanggal}
                onChange={handleChange}
                className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Grid for Leads & Closing */}
            <div className="grid grid-cols-2 gap-4">
              {/* Jumlah Leads */}
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Jumlah Leads</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" 
                    name="leads"
                    value={formData.leads}
                    onChange={handleChange}
                    className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    required
                  />
                  <div className="absolute right-2 flex flex-col gap-0.5">
                    <button type="button" onClick={() => increment('leads')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                      <ChevronUp size={12} className="text-black" />
                    </button>
                    <button type="button" onClick={() => decrement('leads')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                      <ChevronDown size={12} className="text-black" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Jumlah Closing */}
              <div className="space-y-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Jumlah Closing</label>
                <div className="relative flex items-center">
                  <input 
                    type="number" 
                    name="closing"
                    value={formData.closing}
                    onChange={handleChange}
                    className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                    min="0"
                    required
                  />
                  <div className="absolute right-2 flex flex-col gap-0.5">
                    <button type="button" onClick={() => increment('closing')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                      <ChevronUp size={12} className="text-black" />
                    </button>
                    <button type="button" onClick={() => decrement('closing')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                      <ChevronDown size={12} className="text-black" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Spend */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Spend (Rp)</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  name="spend"
                  value={formData.spend}
                  onChange={handleChange}
                  className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  required
                />
                <div className="absolute right-2 flex flex-col gap-0.5">
                  <button type="button" onClick={() => increment('spend')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronUp size={12} className="text-black" />
                  </button>
                  <button type="button" onClick={() => decrement('spend')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronDown size={12} className="text-black" />
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue */}
            <div className="space-y-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Nominal Revenue (Rp)</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  className="w-full h-11 bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  required
                />
                <div className="absolute right-2 flex flex-col gap-0.5">
                  <button type="button" onClick={() => increment('revenue')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronUp size={12} className="text-black" />
                  </button>
                  <button type="button" onClick={() => decrement('revenue')} className="bg-slate-200 hover:bg-slate-300 p-0.5 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronDown size={12} className="text-black" />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              {editingLogId && (
                <button 
                  type="button" 
                  onClick={handleCancelEdit}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 h-11 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1.5"
                >
                  <X size={16} /> Batal
                </button>
              )}
              <button 
                type="submit"
                disabled={isSubmitting}
                className={`flex-[2] text-white h-11 rounded-xl shadow-md hover:shadow-lg transition-all font-bold text-sm flex items-center justify-center gap-1.5 ${
                  editingLogId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#4F46E5] hover:bg-indigo-700'
                } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {editingLogId ? 'Simpan' : 'Kirim Data'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: History Cards */}
        <div className="xl:col-span-3 bg-white rounded-[20px] shadow-[0_0_8.8px_1px_rgba(0,0,0,0.09)] border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <History size={20} className="text-indigo-600" />
              <h3 className="font-bold text-lg text-slate-800">Histori Input Harian</h3>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full">
              {historyLogs.length} Entri
            </span>
          </div>

          {/* History List Content */}
          <div className="p-6 overflow-y-auto max-h-[600px] flex-1">
            {isFetchingHistory ? (
              <div className="py-20 flex justify-center items-center flex-col gap-3">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
                <span className="text-xs text-slate-400 font-medium">Memuat histori log...</span>
              </div>
            ) : historyLogs.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border border-dashed border-slate-200">
                  <History size={28} />
                </div>
                <h4 className="font-bold text-slate-700 mb-1">Belum Ada Histori</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Silakan masukkan dan kirim data log harian Anda pada form di sebelah kiri untuk melihat histori input di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {historyLogs.map((log) => {
                  const isEditingThis = editingLogId === log.id_log;
                  return (
                    <div 
                      key={log.id_log} 
                      className={`p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isEditingThis 
                          ? 'border-amber-400 bg-amber-50/20 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      {/* Left: Info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-800">{formatDate(log.tanggal)}</span>
                          {isEditingThis && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                              Sedang Diedit
                            </span>
                          )}
                        </div>
                        
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-xs">
                          <div>
                            <span className="text-slate-400 block font-medium">Leads:</span>
                            <span className="font-bold text-slate-700">{log.jml_leads}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Closing:</span>
                            <span className="font-bold text-slate-700">{log.jml_closing}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Spend:</span>
                            <span className="font-bold text-emerald-700">{formatRupiah(log.nominal_spend)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Revenue:</span>
                            <span className="font-bold text-indigo-700">{formatRupiah(log.nominal_revenue)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex md:flex-col items-center justify-end gap-2 md:self-stretch md:justify-center border-t md:border-t-0 pt-2.5 md:pt-0 border-slate-100">
                        <button 
                          onClick={() => handleEditClick(log)}
                          className="flex-1 md:flex-none p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors flex items-center justify-center gap-1 text-xs font-semibold px-3 md:px-2.5"
                          title="Edit Log"
                        >
                          <Edit2 size={14} /> <span className="md:hidden">Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(log.id_log)}
                          className="flex-1 md:flex-none p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors flex items-center justify-center gap-1 text-xs font-semibold px-3 md:px-2.5"
                          title="Hapus Log"
                        >
                          <Trash2 size={14} /> <span className="md:hidden">Hapus</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
      <Modal {...modal} onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

export default InputTracking;
