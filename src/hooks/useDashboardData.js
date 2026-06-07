import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export const useDashboardData = (currentUser) => {
  const [chartData, setChartData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [targetProgress, setTargetProgress] = useState({ targetRevenue: 0, actualRevenue: 0, percentage: 0, shortfall: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (silent = false) => {
      if (!silent) setIsLoading(true);
      
      const { data: usersData } = await supabase.from('users').select('id_user, nama, role, tim');
      const usersMap = {};
      if (usersData) {
        usersData.forEach(u => {
          usersMap[u.id_user] = {
            nama: u.nama,
            role: u.role,
            tim: u.tim,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nama)}&background=random`
          };
        });
      }

      const { data: logsData } = await supabase.from('daily_logs').select('*');
      
      const now = new Date();
      const curMonth = now.getMonth() + 1;
      const curYear = now.getFullYear();

      // Fetch targets for the current month and year
      const { data: targetsData } = await supabase
        .from('targets')
        .select('*')
        .eq('bulan', curMonth)
        .eq('tahun', curYear);

      // Calculate dynamic Target Progress
      let targetVal = 0;
      let actualVal = 0;

      if (currentUser) {
        if (currentUser.role === 'staff') {
          // Staff: Personal monthly targets
          if (targetsData) {
            const personalTarget = targetsData.find(t => t.id_user === currentUser.id_user);
            targetVal = personalTarget ? (Number(personalTarget.target_revenue) || 0) : 0;
          }
          if (logsData) {
            logsData.forEach(log => {
              if (log.id_user === currentUser.id_user) {
                const logDate = new Date(log.tanggal);
                if (logDate.getMonth() + 1 === curMonth && logDate.getFullYear() === curYear) {
                  actualVal += Number(log.nominal_revenue) || 0;
                }
              }
            });
          }
        } else {
          // Manager: Cumulative team targets
          const teamUserIds = [];
          if (usersData) {
            usersData.forEach(u => {
              if (u.tim === currentUser.tim && u.role === 'staff') {
                teamUserIds.push(u.id_user);
              }
            });
          }

          if (targetsData && teamUserIds.length > 0) {
            targetsData.forEach(t => {
              if (teamUserIds.includes(t.id_user)) {
                targetVal += Number(t.target_revenue) || 0;
              }
            });
          }

          if (logsData && teamUserIds.length > 0) {
            logsData.forEach(log => {
              if (teamUserIds.includes(log.id_user)) {
                const logDate = new Date(log.tanggal);
                if (logDate.getMonth() + 1 === curMonth && logDate.getFullYear() === curYear) {
                  actualVal += Number(log.nominal_revenue) || 0;
                }
              }
            });
          }
        }
      }

      const percentage = targetVal > 0 ? Math.min(100, Math.round((actualVal / targetVal) * 100)) : 0;
      const shortfall = targetVal > actualVal ? targetVal - actualVal : 0;

      setTargetProgress({
        targetRevenue: targetVal,
        actualRevenue: actualVal,
        percentage,
        shortfall
      });

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

  return { chartData, leaderboard, evaluations, targetProgress, isLoading };
};
