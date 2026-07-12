import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  'Toll': '#8b5cf6',       // violet-500
  'Maintenance': '#f59e0b',// amber-500
  'Fuel': '#3b82f6',       // blue-500
  'Other': '#64748b'       // slate-500
};

const ExpenseBreakdownChart = ({ data }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    let totalFuel = 0;
    let totalMaintenance = 0;
    let totalToll = 0;
    let totalOther = 0;

    data.forEach(v => {
      totalFuel += (v.fuelCost || 0);
      totalMaintenance += (v.maintenanceCost || 0);
      totalToll += (v.tollCost || 0);
      totalOther += (v.otherExpenses || 0);
    });

    return [
      { name: 'Fuel', value: totalFuel },
      { name: 'Maintenance', value: totalMaintenance },
      { name: 'Toll', value: totalToll },
      { name: 'Other', value: totalOther }
    ].filter(item => item.value > 0);
  }, [data]);

  if (chartData.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">No data available</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Total Expense Breakdown</h3>
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
            formatter={(value) => [`$${value.toFixed(2)}`, 'Cost']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBreakdownChart;
