import React from 'react';
import { ChevronRight, MessageSquare, Printer, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TopStatsRow from '../components/TopStatsRow';
import { EVALUATIONS } from '../data/mockData';
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard = ({ currentUser }) => {
  const { chartData, leaderboard, isLoading } = useDashboardData(currentUser);
  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="animate-in fade-in duration-300">
      <TopStatsRow />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">Laporan Performa (Tren Bulanan)</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                <Calendar size={16} className="text-slate-500" />
                <select className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer">
                  <option>Semua Rentang Waktu</option>
                  <option>Bulan Ini (Mei 2026)</option>
                  <option>Bulan Lalu (April 2026)</option>
                </select>
              </div>
              <button onClick={() => alert('Dokumen Laporan PDF sedang diunduh...')} className="flex items-center gap-2 bg-[#5D5FEF] hover:bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                <Printer size={16} /> Cetak PDF
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend align="right" verticalAlign="top" iconType="circle" wrapperStyle={{ top: -40, right: 0 }} />
                <Bar dataKey="Revenue" stackId="a" fill="#818cf8" radius={[0, 0, 4, 4]} barSize={30} />
                <Bar dataKey="Leads" stackId="a" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-800 uppercase">Catatan Evaluasi</h3>
            <ChevronRight size={16} className="text-slate-400" />
          </div>
          
          <div className="flex-1 space-y-3">
            {EVALUATIONS.map(ev => (
              <div key={ev.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-indigo-500">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-400 font-medium">{ev.date}</span>
                  <span className="text-[10px] text-indigo-600 font-medium">{ev.sender}</span>
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">"{ev.text}"</p>
              </div>
            ))}
          </div>

          <div className="bg-[#2D2B52] rounded-2xl p-6 text-white shadow-lg mt-2 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 flex gap-1 h-full">
               <div className="w-2 h-full bg-white"></div>
               <div className="w-2 h-full bg-white mt-4"></div>
               <div className="w-2 h-full bg-white mt-8"></div>
               <div className="w-2 h-full bg-white mt-2"></div>
            </div>
            <h4 className="text-sm font-medium mb-1 relative z-10">Target Bulan Ini</h4>
            <div className="flex items-baseline gap-2 mb-4 relative z-10">
              <span className="text-4xl font-bold">82%</span>
              <span className="text-xs text-indigo-200">Tercapai</span>
            </div>
            <div className="w-full bg-indigo-900/50 h-2 rounded-full mb-3 relative z-10">
              <div className="bg-white h-2 rounded-full" style={{width: '82%'}}></div>
            </div>
            <p className="text-[10px] text-indigo-200 relative z-10">Kekurangan: Rp 12,400,000</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Leaderboard Bulan Ini</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50/50">
            <tr className="text-slate-500 text-xs">
              <th className="px-6 py-4 font-medium">Rank</th>
              <th className="px-6 py-4 font-medium">Staff</th>
              <th className="px-6 py-4 font-medium text-center">Leads</th>
              <th className="px-6 py-4 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leaderboard.length === 0 ? <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500">Belum ada data</td></tr> : leaderboard.map((u, i) => (
              <tr key={u.id}>
                <td className="px-6 py-4 font-bold text-slate-800">{i + 1}.</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={u.avatar} alt={u.nama} className="w-8 h-8 rounded-full bg-slate-200" />
                  <span className="font-medium text-slate-700 text-sm">{u.nama}</span>
                </td>
                <td className="px-6 py-4 text-center text-slate-700 text-sm font-medium">{u.leads}</td>
                <td className="px-6 py-4 font-bold text-slate-800 text-sm">{u.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
