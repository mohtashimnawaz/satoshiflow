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

function principalToText(p) {
  if (!p) return '';
  if (typeof p === 'string') return p;
  if (typeof p.toText === 'function') return p.toText();
  if (typeof p.toString === 'function') return p.toString();
  return String(p);
}

const Navbar = () => {
  const location = useLocation();
  const { user, isAuthenticated, walletType, loginWithPlug, logoutPlug, loginWithII, logoutII } = useAuth();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/create', label: 'Create Stream', icon: Plus },
    { path: '/streams', label: 'Streams', icon: List },
    { path: '/templates', label: 'Templates', icon: FileText },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl shadow-2xl border-b border-slate-200/50 sticky top-0 z-50 glassmorphism-navbar">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <img
              src="/logo.png"
              alt="SatoshiFlow Logo"
              className="h-10 w-10 object-contain drop-shadow-2xl scale-110 group-hover:scale-125 transition-transform duration-300"
              style={{ minWidth: '40px', filter: 'drop-shadow(0 0 20px orange)' }}
            />
            <span className="text-2xl font-extrabold bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-600 bg-clip-text text-transparent drop-shadow-lg">
              SatoshiFlow
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 shadow-lg border border-orange-200/30 backdrop-blur-xl ${
                  isActive(path)
                    ? 'bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-600 text-white font-bold scale-105 shadow-2xl'
                    : 'text-slate-600 dark:text-slate-300 hover:text-orange-500 hover:bg-white/30 hover:scale-105'
                }`}
                style={{ boxShadow: isActive(path) ? '0 4px 24px 0 orange' : undefined }}
              >
                <Icon size={18} className="drop-shadow-md" />
                <span className="text-sm font-medium">{label}</span>
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center animate-pulse shadow-lg">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-xs font-mono text-slate-700">
                    {principalToText(user).slice(0, 6)}...
                  </span>
                  <span className="ml-1 text-xs px-2 py-1 rounded bg-orange-100 text-orange-600 font-semibold uppercase">
                    {walletType === 'plug' ? 'Plug' : walletType === 'ii' ? 'II' : ''}
                  </span>
                </div>
                <button
                  onClick={walletType === 'plug' ? logoutPlug : logoutII}
                  className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm"
                  style={{ minWidth: '80px' }}
                >
                  <Settings size={16} />
                  <span className="hidden lg:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={loginWithPlug}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm"
                  style={{ minWidth: '140px' }}
                >
                  <Wallet size={16} />
                  <span className="hidden lg:inline">Connect Plug</span>
                  <span className="lg:hidden">Plug</span>
                </button>
                <button
                  onClick={loginWithII}
                  className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm"
                  style={{ minWidth: '120px' }}
                >
                  <User size={16} />
                  <span className="hidden lg:inline">Internet Identity</span>
                  <span className="lg:hidden">II</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-slate-200/50 bg-white/80 backdrop-blur-md">
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
        
        {/* Mobile User Menu */}
        {isAuthenticated && (
          <div className="border-t border-slate-200/50 px-4 py-3 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-xs font-mono text-slate-700">
                {principalToText(user).slice(0, 8)}...
              </span>
              <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-600 font-semibold uppercase">
                {walletType === 'plug' ? 'Plug' : walletType === 'ii' ? 'II' : ''}
              </span>
            </div>
            <button
              onClick={walletType === 'plug' ? logoutPlug : logoutII}
              className="flex items-center space-x-1 px-3 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm"
            >
              <Settings size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
