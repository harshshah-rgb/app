import React, { useState } from 'react';
import { Users, FileText, Calendar, Clock, Award, Heart, DollarSign, UserPlus } from 'lucide-react';

const HR: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'benefits', label: 'Benefits', icon: Heart },
    { id: 'requests', label: 'Requests', icon: FileText },
    { id: 'performance', label: 'Performance', icon: Award },
  ];

  const quickActions = [
    { name: 'Submit Leave Request', icon: Calendar, color: 'bg-blue-500' },
    { name: 'Update Personal Info', icon: UserPlus, color: 'bg-green-500' },
    { name: 'View Pay Stubs', icon: DollarSign, color: 'bg-purple-500' },
    { name: 'Training Requests', icon: Award, color: 'bg-orange-500' },
  ];

  const upcomingEvents: any[] = [];

  const benefits: any[] = [];

  const requests: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'available': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
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

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming HR Events</h3>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming HR events</p>
                  <p className="text-sm text-gray-500 mt-1">Events will appear here when scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'benefits':
        return (
          <div className="space-y-4">
            {benefits.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No benefits information available</p>
                <p className="text-sm text-gray-500 mt-1">Benefits details will appear here when configured</p>
              </div>
            ) : (
              benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{benefit.name}</h3>
                      <p className="text-gray-600 mt-1">{benefit.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(benefit.status)}`}>
                      {benefit.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'requests':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">My Requests</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                New Request
              </button>
            </div>
            {requests.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No HR requests found</p>
                <p className="text-sm text-gray-500 mt-1">Submit your first request using the "New Request" button above</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{request.type}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{request.dates}</p>
                  <p className="text-sm text-gray-500">Submitted: {new Date(request.submitted).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">--</div>
                  <div className="text-sm text-gray-500">Overall Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">--%</div>
                  <div className="text-sm text-gray-500">Goals Achieved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-500">Training Hours</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No achievements recorded</p>
                <p className="text-sm text-gray-500 mt-1">Your achievements will appear here when earned</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
        <p className="text-gray-600">Manage your HR needs and access employee resources</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default HR;