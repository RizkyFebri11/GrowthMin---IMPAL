import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useDashboardData } from '../hooks/useDashboardData';

const Leaderboard = ({ currentUser }) => {
  const { chartData, leaderboard, isLoading } = useDashboardData(currentUser);

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800">Tren Performa Bulanan</h3>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Legend align="right" verticalAlign="top" iconType="circle" wrapperStyle={{ top: -40, right: 0 }} />
              <Bar dataKey="Revenue" stackId="a" fill="#818cf8" radius={[0, 0, 4, 4]} barSize={30} />
              <Bar dataKey="Leads" stackId="a" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
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
              <tr key={u.id} className="hover:bg-slate-50">
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

export default Leaderboard;
