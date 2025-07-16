import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Plus, 
  List, 
  FileText, 
  BarChart3, 
  Bell, 
  Wallet,
  User,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, walletType, loginWithPlug, logoutPlug } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/create', label: 'Create Stream', icon: Plus },
    { path: '/streams', label: 'Streams', icon: List },
    { path: '/templates', label: 'Templates', icon: FileText },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-2 group-hover:shadow-lg transition-all duration-200">
              <Wallet size={24} />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              SatoshiFlow
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive(path) 
                    ? 'bg-orange-100 text-orange-600 font-semibold shadow-md' 
                    : 'text-slate-600 hover:text-orange-500 hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && walletType === 'plug' ? (
              <>
                <div className="hidden md:flex items-center space-x-3 bg-slate-100 px-3 py-2 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-sm font-mono text-slate-700">
                    {user?.toString().slice(0, 8)}...
                  </span>
                </div>
                <button
                  onClick={logoutPlug}
                  className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                  <Settings size={16} />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={loginWithPlug}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <Wallet size={16} />
                <span>Connect Plug Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="flex overflow-x-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center space-y-1 px-4 py-3 min-w-0 flex-1 transition-all duration-200 ${
                isActive(path) 
                  ? 'text-orange-600 bg-orange-50' 
                  : 'text-slate-600 hover:text-orange-500 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-xs truncate font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
