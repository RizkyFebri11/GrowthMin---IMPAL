import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../config/supabase';

const Leaderboard = ({ currentUser }) => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      const { data: logsData } = await supabase.from('daily_logs').select('*');
      if (usersData) setUsers(usersData);
      if (logsData) setLogs(logsData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('leaderboard-logs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_logs' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;

  // Process data
  const usersMap = {};
  users.forEach(u => {
    usersMap[u.id_user] = {
      nama: u.nama,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nama)}&background=random`
    };
  });

  // Filter logs for Leaderboard
  const filteredLogs = logs.filter(log => {
    if (selectedMonth === 'all') return true;
    const logDate = new Date(log.tanggal);
    return logDate.getMonth() + 1 === Number(selectedMonth);
  });

  // Compute leaderboard values
  const userStats = {};
  filteredLogs.forEach(log => {
    if (!userStats[log.id_user]) {
      userStats[log.id_user] = {
        id: log.id_user,
        nama: usersMap[log.id_user]?.nama || 'Unknown',
        avatar: usersMap[log.id_user]?.avatar || '',
        leads: 0,
        revenueNum: 0
      };
    }
    userStats[log.id_user].leads += Number(log.jml_leads) || 0;
    userStats[log.id_user].revenueNum += Number(log.nominal_revenue) || 0;
  });

  const sortedLeaderboard = Object.values(userStats)
    .sort((a, b) => b.revenueNum - a.revenueNum)
    .map(u => ({
      ...u,
      revenue: u.revenueNum >= 1000000000 
        ? `Rp ${(u.revenueNum/1000000000).toFixed(1)}M` 
        : u.revenueNum >= 1000000 
          ? `Rp ${(u.revenueNum/1000000).toFixed(1)}Jt` 
          : `Rp ${u.revenueNum.toLocaleString('id-ID')}`
    }));

  // Compute chartData (always shows trend across all months)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyStats = {};
  logs.forEach(log => {
    const d = new Date(log.tanggal);
    const m = months[d.getMonth()];
    if (!monthlyStats[m]) monthlyStats[m] = { name: m, Revenue: 0, Leads: 0 };
    monthlyStats[m].Revenue += (Number(log.nominal_revenue) || 0) / 1000000;
    monthlyStats[m].Leads += Number(log.jml_leads) || 0;
  });
  const chartData = Object.values(monthlyStats).sort((a,b) => months.indexOf(a.name) - months.indexOf(b.name));

  const getMonthName = (m) => {
    const names = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return names[Number(m) - 1] || '';
  };

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
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="font-bold text-lg text-slate-800">
            {selectedMonth === 'all' ? 'Leaderboard Keseluruhan' : `Leaderboard Bulan ${getMonthName(selectedMonth)}`}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Filter:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-700 outline-none focus:border-indigo-500 shadow-sm"
            >
              <option value="all">Semua Bulan (Keseluruhan)</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
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
            {sortedLeaderboard.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-4 text-center text-slate-500">Belum ada data untuk bulan ini</td></tr>
            ) : sortedLeaderboard.map((u, i) => (
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
