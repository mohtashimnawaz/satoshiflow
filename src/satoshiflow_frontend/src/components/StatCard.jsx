import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, bgColor, change }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 hover:transform hover:scale-105 group">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-600 group-hover:text-slate-700 truncate">{title}</p>
          <p className="text-xl md:text-2xl font-bold text-slate-900 mt-1 truncate">{value}</p>
          {change && (
            <div className="flex items-center mt-1">
              <span className={`text-xs font-semibold ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-xs text-slate-500 ml-1 hidden sm:inline">from last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${bgColor} group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
