import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useApp, UserRole } from '../context/AppContext';
import { translateText } from '../utils/localization';
import {
  LayoutDashboard, Search, Briefcase, FileText, ClipboardList, CheckSquare,
  Settings, Users, Building2, Bell, ChevronDown, LogOut, Menu, X,
  FolderOpen, BarChart3, Wrench, Shield, TrendingUp, MapPin, Package,
  HardHat, AlertTriangle, Milestone, Globe, ChevronRight,
  Home, Activity,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

const navConfig: Record<UserRole, { label: string; items: NavItem[] }> = {
  investor: {
    label: 'Investor Portal',
    items: [
      { label: 'Project Explorer', path: '/investor/explorer', icon: <Search size={18} /> },
      { label: 'My Opportunities', path: '/investor/opportunities', icon: <Briefcase size={18} /> },
      { label: 'Execution Workspace', path: '/investor/execution', icon: <Activity size={18} /> },
      { label: 'B2G Services', path: '/investor/services', icon: <Globe size={18} /> },
      { label: 'Support', path: '/investor/support', icon: <AlertTriangle size={18} /> },
    ],
  },
  gov_operator: {
    label: 'Government Portal',
    items: [
      { label: 'Project Management', path: '/gov/projects', icon: <FolderOpen size={18} /> },
      { label: 'Data Quality', path: '/gov/data-quality', icon: <CheckSquare size={18} /> },
      { label: 'Opportunity Pipeline', path: '/gov/opportunities', icon: <TrendingUp size={18} /> },
      { label: 'Execution Monitor', path: '/gov/execution', icon: <BarChart3 size={18} /> },
    ],
  },
  agency: {
    label: 'Agency Portal',
    items: [
      { label: 'Permit Tracker', path: '/agency/permits', icon: <HardHat size={18} /> },
      { label: 'Issue Management', path: '/agency/issues', icon: <AlertTriangle size={18} /> },
      { label: 'Milestone Tracking', path: '/agency/milestones', icon: <Milestone size={18} /> },
      { label: 'Service Workflow', path: '/agency/service-workflow', icon: <Package size={18} /> },
    ],
  },
  admin: {
    label: 'Admin Console',
    items: [
      { label: 'User & Roles', path: '/admin/roles', icon: <Users size={18} /> },
      { label: 'Agency Management', path: '/admin/agencies', icon: <Building2 size={18} /> },
    ],
  },
  executive: {
    label: 'Executive View',
    items: [
      { label: 'Executive Dashboard', path: '/executive/dashboard', icon: <LayoutDashboard size={18} /> },
      { label: 'Analytics', path: '/executive/analytics', icon: <BarChart3 size={18} /> },
      { label: 'Risk Monitor', path: '/executive/risks', icon: <Shield size={18} /> },
    ],
  },
};

const roleInfo: Record<UserRole, { name: string; org: string; avatar: string; color: string }> = {
  investor: { name: 'Kim Jae-won', org: 'Korea Infrastructure Partners', avatar: 'KJ', color: 'bg-amber-500' },
  gov_operator: { name: 'Nguyen Van Anh', org: 'Ministry of Planning & Investment', avatar: 'NA', color: 'bg-blue-600' },
  agency: { name: 'Le Van Cuong', org: 'Department of Planning and Investment, Ho Chi Minh City', avatar: 'LC', color: 'bg-green-600' },
  admin: { name: 'System Admin', org: 'Ministry of Planning & Investment', avatar: 'SA', color: 'bg-purple-600' },
  executive: { name: 'Hoang Minh Duc', org: 'Ministry of Planning & Investment', avatar: 'HD', color: 'bg-red-600' },
};

const brandSubtitle: Record<UserRole, string> = {
  investor: 'Investor Portal',
  gov_operator: 'Government Portal',
  agency: 'Agency Portal',
  admin: 'Admin Console',
  executive: 'Executive View',
};

const roleHomeRoute: Record<UserRole, string> = {
  investor: '/investor/explorer',
  gov_operator: '/gov/projects',
  agency: '/agency/permits',
  admin: '/admin/roles',
  executive: '/executive/dashboard',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole, language, setLanguage, notifications, unreadCount, markNotificationRead, resetDemoData } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showEnvironmentMenu, setShowEnvironmentMenu] = useState(false);

  if (!role) return null;

  const nav = navConfig[role];
  const user = roleInfo[role];
  const t = (value: string) => translateText(value, language);

  const handleLogout = () => {
    setRole(null);
    navigate('/login');
  };

  const handleGoHome = () => {
    setSidebarOpen(false);
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowEnvironmentMenu(false);
    navigate('/');
  };

  const handleSwitchEnvironment = (nextRole: UserRole) => {
    setRole(nextRole);
    setSidebarOpen(false);
    setShowNotifications(false);
    setShowUserMenu(false);
    setShowEnvironmentMenu(false);
    navigate(roleHomeRoute[nextRole]);
  };

  const handleNotificationClick = (id: string, path?: string) => {
    markNotificationRead(id);
    setShowNotifications(false);
    if (path) {
      navigate(path);
    }
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? 'w-full' : ''}`}>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <button
          type="button"
          onClick={handleGoHome}
          className="flex items-center gap-3 text-left transition-opacity hover:opacity-90"
        >
          <div className="w-8 h-8 bg-[#ED6203] rounded-lg flex items-center justify-center flex-shrink-0">
            <Globe size={16} className="text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">{t('Vietnam Investment Agency')}</div>
            <div className="text-[#ffd8bf] text-xs">{t(brandSubtitle[role])}</div>
          </div>
        </button>
      </div>

      {/* Role label */}
      <div className="px-6 py-3">
        <div className="text-[#ffd8bf] text-xs uppercase tracking-wider font-medium">{t(nav.label)}</div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {nav.items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all group ${
                isActive
                  ? 'bg-white/15 text-white border-l-2 border-[#ED6203] pl-2.5'
                  : 'text-blue-100 hover:bg-white/8 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-[#ED6203]' : 'text-[#ffd8bf] group-hover:text-white'}>
                {item.icon}
              </span>
              <span className="text-sm">{t(item.label)}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/8 cursor-pointer">
          <div className={`w-8 h-8 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
            {user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-sm font-medium truncate">{user.name}</div>
            <div className="text-[#d8e2ff] text-xs truncate">{t(user.org)}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-[#ffd8bf] hover:text-white hover:bg-white/8 rounded-lg transition-colors text-sm"
        >
          <LogOut size={16} />
          {t('Switch Role')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f3f3f3] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#022582] flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-[#022582] flex flex-col">
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X size={20} />
              </button>
            </div>
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="relative bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4 flex-shrink-0 z-[80]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu size={22} />
          </button>

          {/* Breadcrumb */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Home size={14} />
              <ChevronRight size={12} />
              <span className="text-gray-800 font-medium truncate">
                {t(nav.items.find(i => location.pathname.startsWith(i.path))?.label || nav.label)}
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
              {(['vi', 'en'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`px-3 py-2 text-xs font-semibold transition-colors ${
                    language === option ? 'bg-[#022582] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {option.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGoHome}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#022582] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Home size={16} />
              <span className="hidden sm:inline">{t('Home')}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowEnvironmentMenu(!showEnvironmentMenu);
                  setShowNotifications(false);
                  setShowUserMenu(false);
                }}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Wrench size={16} />
                <span className="hidden md:inline">Module</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showEnvironmentMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-200 bg-white py-2 shadow-xl z-[70]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Switch Module / Environment
                  </div>
                  {(Object.keys(navConfig) as UserRole[]).map((roleKey) => (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleSwitchEnvironment(roleKey)}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors ${
                        role === roleKey ? 'bg-[#e4ebff] text-[#022582]' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{t(navConfig[roleKey].label)}</span>
                      {role === roleKey && <span className="text-xs font-semibold text-[#ED6203]">Current</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-[70]"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-sm">{t('Notifications')}</span>
                    <span className="text-xs text-[#ED6203] cursor-pointer">{unreadCount} {t('unread')}</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.id, n.path)}
                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            n.type === 'success' ? 'bg-green-500' :
                            n.type === 'warning' ? 'bg-amber-500' :
                            n.type === 'error' ? 'bg-red-500' : 'bg-[#022582]'
                          }`} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-800">{t(n.title)}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{t(n.message)}</div>
                            <div className="text-xs text-gray-400 mt-1">{t(n.time)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-7 h-7 ${user.color} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                  {user.avatar}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">{user.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 z-[70] py-1"
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="text-sm font-medium text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500">{t(user.org)}</div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      resetDemoData();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#022582] transition-colors"
                  >
                    <Settings size={15} />
                    {t('Reset Demo Data')}
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors">
                    <LogOut size={15} />
                    {t('Switch Role / Logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Click outside to close dropdowns */}
      {(showNotifications || showUserMenu || showEnvironmentMenu) && (
        <div className="fixed inset-0 z-[60]" onClick={() => { setShowNotifications(false); setShowUserMenu(false); setShowEnvironmentMenu(false); }} />
      )}
    </div>
  );
}
