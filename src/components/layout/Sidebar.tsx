/**
 * SAHOD - Human Resource Information System
 * © 2026 DevSpot. All rights reserved.
 */

import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  Wallet, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  CreditCard,
  Settings2,
  BarChart3,
  User,
  Receipt,
  LucideIcon
} from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useAuthStore } from '@/stores/useAuthStore';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  Wallet,
  FileText,
  Settings,
  Building2,
  CreditCard,
  Settings2,
  BarChart3,
  User,
  Receipt,
};

// Navigation items by role
const navigationByRole = {
  system_owner: [
    { name: 'Dashboard', href: '/app/owner-dashboard', icon: 'LayoutDashboard', color: 'text-blue-500' },
    { name: 'Companies', href: '/app/companies', icon: 'Building2', color: 'text-emerald-500' },
    { name: 'Subscriptions', href: '/app/subscriptions', icon: 'CreditCard', color: 'text-amber-500' },
    { name: 'System Config', href: '/app/system-config', icon: 'Settings2', color: 'text-purple-500' },
    { name: 'Analytics', href: '/app/platform-analytics', icon: 'BarChart3', color: 'text-pink-500' },
  ],
  hr_client: [
    { name: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard', color: 'text-blue-500' },
    { name: 'Employees', href: '/app/employees', icon: 'Users', color: 'text-emerald-500' },
    { name: 'Attendance', href: '/app/attendance', icon: 'Clock', color: 'text-amber-500' },
    { name: 'Leaves', href: '/app/leaves', icon: 'Calendar', color: 'text-purple-500' },
    { name: 'Payroll', href: '/app/payroll', icon: 'Wallet', color: 'text-pink-500' },
    { name: 'Reports', href: '/app/reports', icon: 'FileText', color: 'text-cyan-500' },
    { name: 'Settings', href: '/app/settings', icon: 'Settings', color: 'text-neutral-500 dark:text-slate-400' },
  ],
  employee: [
    { name: 'Dashboard', href: '/app/dashboard', icon: 'LayoutDashboard', color: 'text-blue-500' },
    { name: 'My Profile', href: '/app/my-profile', icon: 'User', color: 'text-emerald-500' },
    { name: 'My Attendance', href: '/app/my-attendance', icon: 'Clock', color: 'text-amber-500' },
    { name: 'My Leaves', href: '/app/my-leaves', icon: 'Calendar', color: 'text-purple-500' },
    { name: 'My Payslips', href: '/app/my-payslips', icon: 'Receipt', color: 'text-pink-500' },
  ],
};

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapse } = useAppStore();
  const { user } = useAuthStore();
  const location = useLocation();

  // Get navigation based on user role
  const userRole = user?.role || 'employee';
  const navigation = navigationByRole[userRole] || navigationByRole.employee;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-800 border-r border-neutral-200 dark:border-slate-700 transition-all duration-300 ease-in-out shadow-xl lg:shadow-none ${
          sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200 dark:border-slate-700">
            <div className="flex items-center gap-3 overflow-hidden">
              <img 
                src="/logo.png" 
                alt="SAHOD" 
                className="w-10 h-10 rounded-xl shrink-0 object-contain"
              />
              <span className={`font-heading font-bold text-xl text-neutral-800 dark:text-slate-200 dark:text-white transition-opacity duration-200 ${
                sidebarCollapsed ? 'lg:opacity-0 lg:invisible' : 'lg:opacity-100'
              }`}>
                SAHOD
              </span>
            </div>
            <button 
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-2 rounded-xl text-neutral-400 dark:text-slate-500 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-700 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              const IconComponent = iconMap[item.icon] || LayoutDashboard;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-neutral-600 dark:text-slate-400 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-700 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full" />
                  )}
                  
                  <IconComponent 
                    size={20} 
                    className={`shrink-0 transition-colors ${isActive ? '' : `group-hover:${item.color}`}`}
                  />
                  <span className={`truncate transition-opacity duration-200 ${
                    sidebarCollapsed ? 'lg:opacity-0 lg:invisible lg:w-0' : 'lg:opacity-100'
                  }`}>
                    {item.name}
                  </span>
                  
                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 dark:bg-slate-600 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none shadow-lg">
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
