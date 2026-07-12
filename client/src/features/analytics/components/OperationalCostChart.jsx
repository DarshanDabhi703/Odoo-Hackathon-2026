import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OperationalCostChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    // Sort by total cost descending, top 10
    return [...data].sort((a, b) => b.totalCost - a.totalCost).slice(0, 10);
  }, [data]);

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Operational Cost Breakdown (Top 10)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value) => [`$${value}`, undefined]}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="fuelCost" name="Fuel Cost" stackId="a" fill="#3b82f6" />
          <Bar dataKey="maintenanceCost" name="Maintenance Cost" stackId="a" fill="#f59e0b" />
          <Bar dataKey="tollCost" name="Toll Cost" stackId="a" fill="#8b5cf6" />
          <Bar dataKey="otherExpenses" name="Other Expenses" stackId="a" fill="#64748b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OperationalCostChart;
