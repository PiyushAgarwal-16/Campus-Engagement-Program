import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  Plus, 
  User, 
  LogOut,
  Bell
} from 'lucide-react';

const Header = () => {
  const { user, logout, refreshUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/events', icon: Calendar, label: 'Events' },
    ...(user?.role === 'organizer' ? [{ path: '/create-event', icon: Plus, label: 'Create Event' }] : []),
    { path: '/qr-test', icon: Calendar, label: 'QR Test' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Campus Engage</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            
            {/* Temporary refresh button for debugging */}
            <button 
              onClick={refreshUserData}
              className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded"
              title="Refresh user data"
            >
              Refresh
            </button>
            
            <div className="flex items-center space-x-2">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user?.role === 'organizer' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user?.role === 'organizer' ? 'Organizer' : 'Student'}
                  </span>
                </div>
                {/* Debug info - remove in production */}
                <div className="text-xs text-gray-400">
                  ID: {user?.id?.slice(0, 8)}... | Role: {user?.role}
                </div>
              </div>
            </div>

            <Link
              to="/profile"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
