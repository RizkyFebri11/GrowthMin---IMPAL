import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useDashboardData = (currentUser) => {
  const [chartData, setChartData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (silent = false) => {
      if (!silent) setIsLoading(true);
      
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
            revenue: u.revenueNum >= 1000000000 ? `Rp ${(u.revenueNum/1000000000).toFixed(1)}M` : u.revenueNum >= 1000000 ? `Rp ${(u.revenueNum/1000000).toFixed(1)}Jt` : `Rp ${u.revenueNum.toLocaleString('id-ID')}`
          }));
        setLeaderboard(sortedLeaderboard);
      }

      // Fetch evaluations & kpi relation
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
        // Sort by tanggal_input desc
        const sortedEv = [...evData].sort((a, b) => new Date(b.tanggal_input) - new Date(a.tanggal_input));
        
        sortedEv.forEach(ev => {
          const evaluatedUserId = kpiUserMap[ev.id_kpi];
          if (currentUser?.role === 'staff' && evaluatedUserId !== currentUser?.id_user) {
            return;
          }
          
          const managerName = usersMap[ev.id_manajer]?.nama || 'Manager';
          const staffName = usersMap[evaluatedUserId]?.nama || 'Staff';
          
          const d = new Date(ev.tanggal_input);
          const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
          
          formattedEvaluations.push({
            id: ev.id_evaluasi,
            date: dateStr,
            sender: `@${managerName}`,
            text: ev.catatan_evaluasi,
            staffName: staffName,
            id_user: evaluatedUserId
          });
        });
      }
      setEvaluations(formattedEvaluations);

      if (!silent) setIsLoading(false);
    };

    if (currentUser) {
      fetchData();

      // Subscribe to real-time changes on daily_logs and evaluations tables
      const dailyLogsChannel = supabase
        .channel('dashboard-daily-logs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_logs'
          },
          () => {
            fetchData(true); // silent update
          }
        )
        .subscribe();

      const evaluationsChannel = supabase
        .channel('dashboard-evaluations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'evaluations'
          },
          () => {
            fetchData(true); // silent update
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(dailyLogsChannel);
        supabase.removeChannel(evaluationsChannel);
      };
    }
  }, [currentUser]);

  return { chartData, leaderboard, evaluations, isLoading };
};

