import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, TrendingUp } from 'lucide-react';
import { supabase } from '../config/supabase';

const Topbar = ({ activeTab, currentUser }) => {
  const firstName = currentUser.nama.split(' ')[0];
  const [formattedDate, setFormattedDate] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Format real-time Date
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      setFormattedDate(now.toLocaleDateString('id-ID', options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time Notifications
  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      // Fetch users map to show names
      const { data: usersData } = await supabase.from('users').select('id_user, nama');
      const usersMap = {};
      if (usersData) {
        usersData.forEach(u => {
          usersMap[u.id_user] = u.nama;
        });
      }

      let items = [];

      if (currentUser.role === 'manajer') {
        // Manager: Fetch last 5 logs submitted by staff members
        const { data: logsData } = await supabase
          .from('daily_logs')
          .select('*')
          .order('id_log', { ascending: false })
          .limit(5);

        if (logsData) {
          items = logsData.map(log => {
            const staffName = usersMap[log.id_user] || 'Staff';
            const d = new Date(log.tanggal);
            const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            return {
              id: log.id_log,
              type: 'log',
              title: 'Laporan Progres Baru',
              message: `${staffName} menginput progres: ${log.jml_leads} Leads, ${log.jml_closing} Closing.`,
              date: dateStr
            };
          });
        }
      } else {
        // Staff: Fetch last 5 evaluations for their KPI results
        const { data: kpiData } = await supabase
          .from('kpi_results')
          .select('id_kpi')
          .eq('id_user', currentUser.id_user);

        if (kpiData && kpiData.length > 0) {
          const kpiIds = kpiData.map(k => k.id_kpi);
          const { data: evData } = await supabase
            .from('evaluations')
            .select('*')
            .in('id_kpi', kpiIds)
            .order('id_evaluasi', { ascending: false })
            .limit(5);

          if (evData) {
            items = evData.map(ev => {
              const managerName = usersMap[ev.id_manajer] || 'Manajer';
              const d = new Date(ev.tanggal_input);
              const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
              return {
                id: ev.id_evaluasi,
                type: 'evaluation',
                title: 'Evaluasi Manajer',
                message: `@${managerName} memberikan evaluasi: "${ev.catatan_evaluasi}"`,
                date: dateStr
              };
            });
          }
        }
      }

      setNotifications(items);

      // Calculate unread count using localStorage to check the last read ID
      const latestId = items[0]?.id || 0;
      const lastReadId = Number(localStorage.getItem(`last_read_notif_${currentUser.id_user}`)) || 0;
      if (latestId > lastReadId) {
        setUnreadCount(items.filter(item => item.id > lastReadId).length);
      } else {
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (currentUser) {
      // Listen to new inserts in daily_logs
      const dailyLogsChannel = supabase
        .channel('topbar-daily-logs-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'daily_logs' },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      // Listen to new inserts in evaluations
      const evaluationsChannel = supabase
        .channel('topbar-evaluations-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'evaluations' },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(dailyLogsChannel);
        supabase.removeChannel(evaluationsChannel);
      };
    }
  }, [currentUser]);

  // Click outside to close notifications dropdown
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.notification-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isDropdownOpen]);

  const toggleNotifications = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen && notifications.length > 0) {
      // Mark all as read when opened
      const latestId = notifications[0].id;
      localStorage.setItem(`last_read_notif_${currentUser.id_user}`, latestId.toString());
      setUnreadCount(0);
    }
  };

  return (
    <header className="flex justify-between items-start mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {activeTab === 'dashboard' ? `Halo, ${firstName}!` : 
           activeTab === 'targets' ? 'Manajemen Target' : 
           activeTab === 'tracking' ? 'Input Tracking' :
           activeTab === 'evaluasi' ? 'Evaluasi Mingguan' :
           'Leaderboard'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {formattedDate || 'Memuat tanggal...'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* Notification Bell Dropdown */}
        <div className="relative notification-container">
          <button 
            onClick={toggleNotifications}
            className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 relative hover:text-slate-600 hover:border-slate-300 shadow-sm transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <span className="font-bold text-sm text-slate-800">Notifikasi</span>
                {unreadCount > 0 && (
                  <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} Baru
                  </span>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">
                    Belum ada notifikasi baru
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-4 hover:bg-slate-50/50 transition-colors flex gap-3 items-start">
                      <div className={`p-2 rounded-lg mt-0.5 ${n.type === 'evaluation' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {n.type === 'evaluation' ? <MessageSquare size={14} /> : <TrendingUp size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-700 leading-tight mb-0.5">{n.title}</p>
                        <p className="text-xs text-slate-500 leading-normal line-clamp-3">{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block font-medium">{n.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-1.5 pr-4 flex items-center gap-3 shadow-sm">
          <img src={currentUser.avatar} alt="Profile" className="w-8 h-8 rounded-lg" />
          <div>
            <p className="text-sm font-bold text-slate-800 leading-none">{currentUser.nama.length > 20 ? currentUser.nama.substring(0, 17) + '...' : currentUser.nama}</p>
            <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{currentUser.tim} Team</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

