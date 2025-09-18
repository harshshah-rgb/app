import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Megaphone, 
  BookOpen, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Plane, 
  HelpCircle, 
  Menu, 
  X,
  Bell,
  Search,
  User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Announcements', href: '/announcements', icon: Megaphone },
     { name: 'HR', href: '/hr', icon: Users },
    { name: 'Timesheets', href: '/timesheets', icon: Clock },
    { name: 'Sales', href: '/sales', icon: TrendingUp },
    { name: 'Expense', href: '/travel-expense', icon: Plane },
    { name: 'Help Desk', href: '/help-desk', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white/90 backdrop-blur-sm">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} currentPath={location.pathname} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="bg-white/80 backdrop-blur-md border-r border-white/20 shadow-lg">
          <SidebarContent navigation={navigation} currentPath={location.pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20">
          <button
            type="button"
            className="px-4 border-r border-white/30 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              <form className="w-full flex md:ml-0" action="#" method="GET">
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search..."
                    type="search"
                  />
                </div>
              </form>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transition-all duration-200 border border-white/30">
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="relative group">
                    <button className="bg-white/80 backdrop-blur-sm rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1 shadow-lg hover:bg-white/90 transition-all duration-200 border border-white/30">
                      <User className="h-8 w-8 text-gray-400" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        <Link
                          to="/change-password"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors"
                        >
                          Change Password
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100/80 transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{ navigation: any[]; currentPath: string }> = ({ navigation, currentPath }) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center bg-gradient-to-r from-white/60 to-white/40 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-white/30">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-semibold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">Blue Flute Consulting</p>
              <p className="text-xs text-gray-600 font-medium">Employee Portal</p>
            </div>
          </div>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 border-indigo-400/50 text-indigo-800 shadow-lg backdrop-blur-sm border'
                    : 'border-transparent text-gray-700 hover:bg-gradient-to-r hover:from-white/60 hover:to-white/40 hover:text-gray-900 hover:shadow-lg hover:backdrop-blur-sm hover:border hover:border-white/40'
                } flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 mx-2`}
              >
                <Icon
                  className={`${
                    isActive ? 'text-indigo-700' : 'text-gray-500 group-hover:text-gray-700'
                  } mr-3 h-5 w-5 transition-all duration-300`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Layout;