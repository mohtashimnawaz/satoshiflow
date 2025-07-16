import React from 'react';
import { Link } from 'react-router-dom';

const QuickActionCard = ({ to, icon: Icon, iconBg, title, description, ariaLabel }) => (
  <Link
    to={to}
    className="bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 hover:transform hover:scale-105 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-orange-500"
    aria-label={ariaLabel || title}
    tabIndex={0}
  >
    <div className="flex items-center space-x-3">
      <div className={`${iconBg} p-3 rounded-lg`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  </Link>
);

export default QuickActionCard; 