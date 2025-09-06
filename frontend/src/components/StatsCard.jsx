// ============================================
// FILE: frontend/src/components/StatsCard.js (Enhanced Version)
// ============================================
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon, trend, trendUp, gradient }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient || 'from-blue-500 to-indigo-500'}`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center">
            {trendUp ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
            )}
            <span className={`text-sm font-semibold ${
              trendUp ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend}
            </span>
            <span className="text-sm text-gray-500 ml-2">from last period</span>
          </div>
        )}
      </div>
      <div className={`h-1 bg-gradient-to-r ${gradient || 'from-blue-500 to-indigo-500'}`}></div>
    </div>
  );
};

export default StatsCard;
