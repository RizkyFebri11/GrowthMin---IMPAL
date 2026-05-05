import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../config/supabase';

const InputTracking = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    tanggal: '',
    leads: 0,
    closing: 0,
    spend: 0,
    revenue: 0
  });

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Silakan login terlebih dahulu!');

    // Validasi Error IMK Task
    if (!formData.tanggal) {
      alert('Field required: Tanggal Tracking wajib diisi!');
      return;
    }

    if (Number(formData.leads) < 0 || Number(formData.closing) < 0 || Number(formData.spend) < 0 || Number(formData.revenue) < 0) {
      alert('Error: Nominal tidak boleh bernilai kurang dari 0!');
      return;
    }

    if (isNaN(Number(formData.leads)) || isNaN(Number(formData.closing)) || isNaN(Number(formData.spend)) || isNaN(Number(formData.revenue))) {
      alert('Error: Input harus berupa nominal angka valid!');
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await supabase.from('daily_logs').insert([
      {
        id_user: currentUser.id_user,
        tanggal: formData.tanggal,
        jml_leads: Number(formData.leads),
        jml_closing: Number(formData.closing),
        nominal_revenue: Number(formData.revenue),
        nominal_spend: Number(formData.spend)
      }
    ]);
    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert('Gagal mengirim data. Coba lagi!');
      return;
    }

    alert('Data berhasil dikirim ke database!');
    setFormData({
      tanggal: '',
      leads: 0,
      closing: 0,
      spend: 0,
      revenue: 0
    });
  };

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="bg-white rounded-[20px] shadow-[0_0_8.8px_1px_rgba(0,0,0,0.09)] border border-slate-100 overflow-hidden flex-1 flex flex-col">
        
        {/* Purple Header Ribbon */}
        <div className="bg-[#4F46E5] relative px-10 py-8 lg:py-12 overflow-hidden flex-shrink-0">
          {/* Abstract pattern lines on the right */}
          <div className="absolute right-0 top-0 w-64 h-full opacity-20 pointer-events-none">
            <div className="w-[71px] h-3 bg-white rounded-full absolute -rotate-[60deg] top-4 right-10"></div>
            <div className="w-[71px] h-3 bg-white rounded-full absolute -rotate-[60deg] top-8 right-4"></div>
            <div className="w-[71px] h-3 bg-white rounded-full absolute -rotate-[60deg] top-16 right-5"></div>
            <div className="w-[71px] h-3 bg-white rounded-full absolute -rotate-[60deg] top-12 right-16"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-white text-3xl font-black mb-1">Data Log Harian</h2>
            <p className="text-white/90 text-[15px]">Lead, Closing, Revenue, Spend</p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 lg:p-10 flex-1 flex flex-col pt-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8 flex-1">
            
            {/* Tanggal Tracking */}
            <div className="space-y-2">
              <label className="text-slate-700 text-sm font-bold uppercase tracking-wide">Tanggal Tracking</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange}
                  className="w-full h-[60px] bg-[#F8FAFC] border border-slate-200 rounded-[16px] px-6 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                  required
                />
              </div>
            </div>

            {/* Jumlah Leads */}
            <div className="space-y-2">
              <label className="text-slate-700 text-sm font-bold uppercase tracking-wide">Jumlah Leads</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  name="leads"
                  value={formData.leads}
                  onChange={handleChange}
                  className="w-full h-[60px] bg-[#F8FAFC] border border-slate-200 rounded-[16px] px-6 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  required
                />
                <div className="absolute right-4 flex flex-col gap-0.5">
                  <button type="button" onClick={() => increment('leads')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronUp size={14} className="text-black" />
                  </button>
                  <button type="button" onClick={() => decrement('leads')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronDown size={14} className="text-black" />
                  </button>
                </div>
              </div>
            </div>

            {/* Jumlah Closing */}
            <div className="space-y-2">
              <label className="text-slate-700 text-sm font-bold uppercase tracking-wide">Jumlah Closing</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  name="closing"
                  value={formData.closing}
                  onChange={handleChange}
                  className="w-full h-[60px] bg-[#F8FAFC] border border-slate-200 rounded-[16px] px-6 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  required
                />
                <div className="absolute right-4 flex flex-col gap-0.5">
                  <button type="button" onClick={() => increment('closing')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronUp size={14} className="text-black" />
                  </button>
                  <button type="button" onClick={() => decrement('closing')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronDown size={14} className="text-black" />
                  </button>
                </div>
              </div>
            </div>

            {/* Spend */}
            <div className="space-y-2">
              <label className="text-slate-700 text-sm font-bold uppercase tracking-wide">Spend (Rp)</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  name="spend"
                  value={formData.spend}
                  onChange={handleChange}
                  className="w-full h-[60px] bg-[#F8FAFC] border border-slate-200 rounded-[16px] px-6 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  required
                />
                <div className="absolute right-4 flex flex-col gap-0.5">
                  <button type="button" onClick={() => increment('spend')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronUp size={14} className="text-black" />
                  </button>
                  <button type="button" onClick={() => decrement('spend')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronDown size={14} className="text-black" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Nominal Revenue (Full Width) */}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-slate-700 text-sm font-bold uppercase tracking-wide">Nominal Revenue (Rp)</label>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleChange}
                  className="w-full h-[60px] bg-[#F8FAFC] border border-slate-200 rounded-[16px] px-6 text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  required
                />
                <div className="absolute right-4 flex flex-col gap-0.5">
                  <button type="button" onClick={() => increment('revenue')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronUp size={14} className="text-black" />
                  </button>
                  <button type="button" onClick={() => decrement('revenue')} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-sm flex items-center justify-center transition-colors">
                    <ChevronDown size={14} className="text-black" />
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-10 flex justify-center pb-4">
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full max-w-xl bg-[#4F46E5] hover:bg-indigo-700 text-white h-[64px] rounded-[16px] shadow-[0_0_8.8px_1px_rgba(0,0,0,0.09)] hover:shadow-lg transition-all flex items-center justify-center text-xl font-extrabold tracking-wide ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'MENGIRIM...' : 'KIRIM DATA KE DATABASE'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default InputTracking;
