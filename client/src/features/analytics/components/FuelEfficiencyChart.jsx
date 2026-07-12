import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FuelEfficiencyChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Sort by efficiency descending and take top 10 for better readability
    return [...data].sort((a, b) => b.efficiency - a.efficiency).slice(0, 10);
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Fuel Efficiency (Top 10 Vehicles)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="regNumber" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`${value} km/L`, 'Efficiency']}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="efficiency" name="Efficiency (km/L)" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FuelEfficiencyChart;
