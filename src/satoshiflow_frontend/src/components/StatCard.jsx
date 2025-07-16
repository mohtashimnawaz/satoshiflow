import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, bgColor, change }) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 hover:transform hover:scale-105 group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 group-hover:text-slate-700">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-semibold ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-slate-500 ml-1">from last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
