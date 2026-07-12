import React, { useState } from 'react';
import { Download } from 'lucide-react';
import ReportFilters from '../features/analytics/components/ReportFilters';
import FuelEfficiencyChart from '../features/analytics/components/FuelEfficiencyChart';
import OperationalCostChart from '../features/analytics/components/OperationalCostChart';
import ExpenseBreakdownChart from '../features/analytics/components/ExpenseBreakdownChart';
import { useFuelEfficiency, useOperationalCost, useROI } from '../features/analytics/hooks/useAnalytics';
import { analyticsService } from '../features/analytics/services/analytics.service';

const ReportsPage = () => {
  const [filters, setFilters] = useState({});
  const [activeTab, setActiveTab] = useState('fuel');
  
  const { data: fuelData, isLoading: loadingFuel } = useFuelEfficiency(filters);
  const { data: costData, isLoading: loadingCost } = useOperationalCost(filters);
  const { data: roiData, isLoading: loadingROI } = useROI(filters);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleExport = async () => {
    try {
      const blob = await analyticsService.downloadCSV(filters);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute('download', `transitops-report-${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
      alert('Failed to export CSV. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <ReportFilters onFilterChange={handleFilterChange} />
        <button 
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          {[
            { id: 'fuel', label: 'Fuel Efficiency' },
            { id: 'cost', label: 'Operational Cost' },
            { id: 'roi', label: 'ROI Analysis' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-white' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'fuel' && (
            <div className="space-y-6">
              {loadingFuel ? (
                <div className="text-slate-500">Loading fuel data...</div>
              ) : (
                <FuelEfficiencyChart data={fuelData} />
              )}
            </div>
          )}

          {activeTab === 'cost' && (
            <div className="space-y-6">
              {loadingCost ? (
                <div className="text-slate-500">Loading cost data...</div>
              ) : (
                <>
                  <OperationalCostChart data={costData} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <ExpenseBreakdownChart data={costData} />
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 flex flex-col justify-center">
                      <h4 className="text-slate-600 font-medium mb-2">Cost Analysis Summary</h4>
                      <p className="text-slate-500 text-sm mb-4">
                        The operational cost includes all fuel logs, maintenance records, and manually logged expenses (tolls, etc.) for the selected period.
                      </p>
                      {costData && costData.length > 0 && (
                        <div className="mt-2 text-2xl font-bold text-slate-800">
                          Total Fleet OpCost: $
                          {costData.reduce((sum, v) => sum + (v.totalCost || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'roi' && (
            <div className="space-y-6">
              {loadingROI ? (
                <div className="text-slate-500">Loading ROI data...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">Vehicle</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3 text-right">Revenue</th>
                        <th className="px-6 py-3 text-right">Op Cost</th>
                        <th className="px-6 py-3 text-right">Net Profit</th>
                        <th className="px-6 py-3 text-right">Acquisition</th>
                        <th className="px-6 py-3 text-right">ROI %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiData && roiData.map((v) => (
                        <tr key={v.vehicleId} className="bg-white border-b hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{v.regNumber}</td>
                          <td className="px-6 py-4">{v.type}</td>
                          <td className="px-6 py-4 text-right">${v.revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">${v.operationalCost.toLocaleString()}</td>
                          <td className={`px-6 py-4 text-right font-medium ${v.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ${v.netProfit.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">${v.acquisitionCost.toLocaleString()}</td>
                          <td className={`px-6 py-4 text-right font-bold ${v.roiPct >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {v.roiPct}%
                          </td>
                        </tr>
                      ))}
                      {(!roiData || roiData.length === 0) && (
                        <tr>
                          <td colSpan="7" className="px-6 py-8 text-center text-slate-400">No ROI data available for this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
