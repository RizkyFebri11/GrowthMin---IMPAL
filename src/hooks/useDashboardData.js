import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useDashboardData = (currentUser) => {
  const [chartData, setChartData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      const { data: usersData } = await supabase.from('users').select('id_user, nama');
      const usersMap = {};
      if (usersData) {
        usersData.forEach(u => {
          usersMap[u.id_user] = {
            nama: u.nama,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nama)}&background=random`
          };
        });
      }

      const { data: logsData } = await supabase.from('daily_logs').select('*');
      
      if (logsData) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyStats = {};
        const userStats = {};

        logsData.forEach(log => {
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

          if (currentUser?.role === 'staff' && log.id_user !== currentUser?.id_user) {
            return; 
          }
          
          const d = new Date(log.tanggal);
          const m = months[d.getMonth()];
          if (!monthlyStats[m]) monthlyStats[m] = { name: m, Revenue: 0, Leads: 0 };
          
          monthlyStats[m].Revenue += (Number(log.nominal_revenue) || 0) / 1000000;
          monthlyStats[m].Leads += Number(log.jml_leads) || 0;
        });

        const sortedChart = Object.values(monthlyStats).sort((a,b) => months.indexOf(a.name) - months.indexOf(b.name));
        setChartData(sortedChart);

        const sortedLeaderboard = Object.values(userStats)
          .sort((a,b) => b.revenueNum - a.revenueNum)
          .map(u => ({
            ...u,
            revenue: u.revenueNum >= 1000000000 ? `Rp ${(u.revenueNum/1000000000).toFixed(1)}B` : u.revenueNum >= 1000000 ? `Rp ${(u.revenueNum/1000000).toFixed(1)}M` : `Rp ${u.revenueNum.toLocaleString()}`
          }));
        setLeaderboard(sortedLeaderboard);
      }
      setIsLoading(false);
    };

    if (currentUser) fetchData();
  }, [currentUser]);

  return { chartData, leaderboard, isLoading };
};
