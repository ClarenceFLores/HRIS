/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Moon, Sun, Search, X, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRegistrationsStore } from '@/stores/useRegistrationsStore';
import { Link, useNavigate } from 'react-router-dom';

export function Header() {
  const { sidebarOpen, setSidebarOpen, darkMode, toggleDarkMode } = useAppStore();
  const { user, logout } = useAuthStore();
  const { pendingRegistrations } = useRegistrationsStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate notifications based on user role
  const isSystemOwner = user?.role === 'system_owner';
  const pendingCount = pendingRegistrations.filter(r => r.status === 'pending').length;
  
  const notifications = isSystemOwner && pendingCount > 0
    ? pendingRegistrations
        .filter(r => r.status === 'pending')
        .slice(0, 5)
        .map((r, index) => ({
          id: r.id,
          title: 'New Registration',
          message: `${r.companyName} - ${r.hrAdminName}`,
          time: new Date(r.dateRegistered).toLocaleDateString(),
          unread: true,
        }))
    : [];

  const unreadCount = isSystemOwner ? pendingCount : 0;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-neutral-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-700 lg:hidden transition-all"
          >
            <Menu size={20} />
          </button>
          
          {/* Logo branding - visible on mobile when sidebar is hidden */}
          <div className="flex items-center gap-2 lg:hidden">
            <img 
              src="/logo.png" 
              alt="SAHOD" 
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="font-heading font-bold text-lg text-neutral-800 dark:text-white">
              SAHOD
            </span>
          </div>
          
          <div className={`relative hidden md:block transition-all duration-300 ${searchFocused ? 'w-96' : 'w-80'}`}>
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-primary-500' : 'text-neutral-400'}`} size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search employees, leaves, payroll..."
              className={`w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-100 dark:bg-slate-700 border-2 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none transition-all ${
                searchFocused 
                  ? 'border-primary-500 bg-white dark:bg-slate-800 shadow-lg shadow-primary-500/10' 
                  : 'border-transparent'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-neutral-200 dark:hover:bg-slate-600 rounded-full"
              >
                <X size={14} className="text-neutral-400" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile search button */}
          <button className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-700 md:hidden transition-all">
            <Search size={20} />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-all"
            title={darkMode ? 'Light mode' : 'Dark mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-700 relative transition-all"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-4">
                <div className="p-4 border-b border-neutral-100 dark:border-slate-700">
                  <h3 className="font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (isSystemOwner) navigate('/app/owner-dashboard');
                        }}
                        className={`p-4 border-b border-neutral-50 dark:border-slate-700/50 hover:bg-neutral-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${
                          notification.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notification.unread && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full mt-2 shrink-0"></span>
                          )}
                          <div className={notification.unread ? '' : 'ml-5'}>
                            <p className="font-medium text-sm text-neutral-900 dark:text-white">{notification.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">No notifications</p>
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <div className="p-3 bg-neutral-50 dark:bg-slate-700/50">
                    <button 
                      onClick={() => {
                        setShowNotifications(false);
                        if (isSystemOwner) navigate('/app/owner-dashboard');
                      }}
                      className="w-full text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative ml-2 pl-3 border-l border-neutral-200 dark:border-slate-700" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-slate-700 transition-all"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-neutral-900 dark:text-white">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {user?.role?.replace('_', ' ').toUpperCase() || 'HR ADMIN'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <span className="text-white font-semibold">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
              <ChevronDown size={16} className={`text-neutral-400 hidden sm:block transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-neutral-200 dark:border-slate-700 overflow-hidden animate-in slide-in-from-top-4">
                <div className="p-4 border-b border-neutral-100 dark:border-slate-700">
                  <p className="font-semibold text-neutral-900 dark:text-white">{user?.displayName || 'User'}</p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{user?.email || ''}</p>
                </div>
                <div className="p-2">
                  <Link 
                    to="/settings" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={18} />
                    My Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={18} />
                    Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-neutral-100 dark:border-slate-700">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
