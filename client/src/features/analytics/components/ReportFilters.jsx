import React, { useState } from 'react';
import { Filter } from 'lucide-react';

const ReportFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    type: '',
    region: '',
    from: '',
    to: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center gap-2 text-slate-500 mr-2">
        <Filter size={18} />
        <span className="font-medium text-sm">Filters</span>
      </div>
      
      <div className="flex flex-col">
        <label className="text-xs text-slate-500 mb-1">Vehicle Type</label>
        <select 
          name="type" 
          value={filters.type} 
          onChange={handleChange}
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="Truck">Truck</option>
          <option value="Van">Van</option>
          <option value="Car">Car</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs text-slate-500 mb-1">Region</label>
        <select 
          name="region" 
          value={filters.region} 
          onChange={handleChange}
          className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Regions</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">From Date</label>
          <input 
            type="date" 
            name="from" 
            value={filters.from} 
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs text-slate-500 mb-1">To Date</label>
          <input 
            type="date" 
            name="to" 
            value={filters.to} 
            onChange={handleChange}
            className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
