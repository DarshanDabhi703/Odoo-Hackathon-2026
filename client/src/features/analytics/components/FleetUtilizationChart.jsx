import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  'Available': '#10b981', // emerald-500
  'On Trip': '#3b82f6',   // blue-500
  'In Shop': '#f59e0b',   // amber-500
  'Retired': '#64748b'    // slate-500
};

const FleetUtilizationChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>;
  }

  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Fleet Status Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#ccc'} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} Vehicles`, 'Count']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FleetUtilizationChart;
