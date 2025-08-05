import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ to, icon: Icon, iconBg, title, description, ariaLabel }) => (
  <Link
    to={to}
    className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 hover:transform hover:scale-105 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-orange-500"
    aria-label={ariaLabel || title}
    tabIndex={0}
  >
    <div className="flex items-center space-x-3">
      <div className={`${iconBg} p-2 rounded-lg flex-shrink-0`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-medium text-gray-900 truncate">{title}</h3>
        <p className="text-sm text-gray-500 truncate">{description}</p>
      </div>
    </div>
  </Link>
);

export default QuickActionCard; 