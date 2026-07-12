import React from 'react';

const KPICard = ({ title, value, icon: Icon, trend, description, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        {Icon && (
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Icon size={20} />
          </div>
        )}
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {trend && (
          <span className={`text-sm font-medium ${trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-slate-500 mt-2">{description}</p>
      )}
    </div>
  );
};

export default KPICard;
