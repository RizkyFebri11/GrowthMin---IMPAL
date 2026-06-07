import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from './StatCard';
import { supabase } from '../config/supabase';

const TopStatsRow = ({ currentUser }) => {
  const [stats, setStats] = useState({ leads: 0, closing: 0, revenue: 0, spend: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      let query = supabase.from('daily_logs').select('*');
      if (currentUser?.role === 'staff') query = query.eq('id_user', currentUser.id_user);
      const { data, error } = await query;
      if (error || !data) return;

      const aggregated = data.reduce((acc, curr) => {
        acc.leads += Number(curr.jml_leads) || 0;
        acc.closing += Number(curr.jml_closing) || 0;
        acc.revenue += Number(curr.nominal_revenue) || 0;
        acc.spend += Number(curr.nominal_spend) || 0;
        return acc;
      }, { leads: 0, closing: 0, revenue: 0, spend: 0 });
      
      setStats(aggregated);
    };

    if (currentUser) {
      fetchStats();

      // Set up real-time subscription for live updates
      const channel = supabase
        .channel('daily-logs-stats-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_logs'
          },
          () => {
            fetchStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

  const formatRp = (val) => {
    if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}M`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard title="Total Leads" value={stats.leads.toLocaleString('id-ID')} icon={Users} color="bg-blue-400" trend="-" trendLabel="vs Target" />
      <StatCard title="Closing Deals" value={stats.closing.toLocaleString('id-ID')} icon={CheckCircle2} color="bg-emerald-500" trend="-" trendLabel="vs Target" />
      <StatCard title="Total Revenue" value={formatRp(stats.revenue)} icon={DollarSign} color="bg-amber-400" trend="-" trendLabel="vs Target" />
      <StatCard title="Marketing Spend" value={formatRp(stats.spend)} icon={TrendingUp} color="bg-indigo-500" trend="-" trendLabel="vs Target" />
    </div>
  );
};

export default TopStatsRow;
