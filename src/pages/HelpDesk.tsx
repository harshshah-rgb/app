import React, { useState } from 'react';
import { HelpCircle, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';

const HelpDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const tabs = [
    { id: 'tickets', label: 'My Tickets', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge Base', icon: HelpCircle },
    { id: 'faq', label: 'FAQ', icon: CheckCircle },
  ];

  const tickets: any[] = [];

  const knowledgeBaseArticles: any[] = [];

  const faqItems: any[] = [];

  const categories = ['All', 'IT Support', 'HR', 'Finance', 'Facilities'];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in-progress': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tickets':
        return (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </button>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No support tickets found</p>
                  <p className="text-sm text-gray-500 mt-1">Create your first ticket using the "New Ticket" button above</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(ticket.status)}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">Category: {ticket.category}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>Created: {new Date(ticket.created).toLocaleDateString()}</span>
                            <span>Last Update: {new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'knowledge':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            {knowledgeBaseArticles.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No knowledge base articles available</p>
                <p className="text-sm text-gray-500 mt-1">Articles will appear here when published</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {knowledgeBaseArticles.map((article) => (
                  <div key={article.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">Category: {article.category}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{article.views} views</span>
                      <span>Updated: {new Date(article.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
            {faqItems.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No FAQ items available</p>
                <p className="text-sm text-gray-500 mt-1">Frequently asked questions will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h4>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Help Desk</h1>
        <p className="text-gray-600">Get support and find answers to your questions</p>
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

export default HelpDesk;