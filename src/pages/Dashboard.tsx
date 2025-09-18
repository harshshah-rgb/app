import React from 'react';
import { Calendar, Clock, TrendingUp, Users, Bell, FileText, MapPin, Headphones } from 'lucide-react';
import { useEmployeeData } from '../hooks/useEmployeeData';

const Dashboard: React.FC = () => {
  const { getDisplayName, loading } = useEmployeeData();

  const quickActions = [
    { name: 'Sales', icon: Clock, color: 'bg-blue-500' },
    { name: 'Timesheet', icon: FileText, color: 'bg-green-500' },
    { name: 'Travel Expense', icon: MapPin, color: 'bg-purple-500' },
    { name: 'HR', icon: Headphones, color: 'bg-orange-500' },
  ];

  const stats = [
    { name: 'Hours This Week', value: '0', change: '0', icon: Clock },
    { name: 'Pending Requests', value: '0', change: '0', icon: Bell },
    { name: 'Team Members', value: '0', change: '0', icon: Users },
    { name: 'Projects Active', value: '0', change: '0', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {loading ? '...' : getDisplayName()}!
        </h1>
        <p className="text-gray-600">Here's what's happening at Blue Flute Consulting today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <div key={action.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center">
                <div className={`${action.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{action.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <Icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="mt-2">
                <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Announcements</h3>
          <div className="text-center py-8">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No announcements available</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for updates</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming events</p>
            <p className="text-sm text-gray-500 mt-1">Events will appear here when scheduled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;