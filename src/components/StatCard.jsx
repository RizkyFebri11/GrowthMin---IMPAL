import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, trend, trendLabel }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-xs text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">{value}</h3>
      <span className={`text-[10px] font-medium px-2 py-1 rounded bg-emerald-50 text-emerald-600`}>
        {trend} {trendLabel}
      </span>
    </div>
    <div className={`${color} p-2.5 rounded-xl text-white`}>
      <Icon size={20} />
    </div>
  </div>
);

export default StatCard;
