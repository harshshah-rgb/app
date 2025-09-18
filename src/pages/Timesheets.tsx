import React, { useState } from 'react';
import { Clock, Plus, Edit3, Save, X, Calendar, FileText } from 'lucide-react';

const Timesheets: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState('2024-03-04');
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [newEntry, setNewEntry] = useState({ date: '', project: '', hours: '', description: '' });

  const projects = [
    { id: 1, name: 'No Projects Available', code: 'N/A' },
  ];

  const [timesheetEntries, setTimesheetEntries] = useState<any[]>([]);

  const weeklyStats = {
    totalHours: 0,
    approvedHours: 0,
    pendingHours: 0,
    draftHours: 0,
  };

  const handleAddEntry = () => {
    if (newEntry.date && newEntry.project && newEntry.hours) {
      const entry = {
        id: timesheetEntries.length + 1,
        date: newEntry.date,
        project: newEntry.project,
        hours: parseInt(newEntry.hours),
        description: newEntry.description,
        status: 'draft' as const,
      };
      setTimesheetEntries([...timesheetEntries, entry]);
      setNewEntry({ date: '', project: '', hours: '', description: '' });
    }
  };

  const handleEditEntry = (id: number) => {
    setEditingEntry(id);
  };

  const handleSaveEntry = (id: number) => {
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id: number) => {
    setTimesheetEntries(timesheetEntries.filter(entry => entry.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmitTimesheet = () => {
    setTimesheetEntries(timesheetEntries.map(entry => 
      entry.status === 'draft' ? { ...entry, status: 'pending' } : entry
    ));
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
        <p className="text-gray-600">Track and manage your working hours</p>
      </div>

      {/* Week Selection and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Week Selection</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="week"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={handleSubmitTimesheet}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit Timesheet
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{weeklyStats.totalHours}</div>
              <div className="text-sm text-gray-500">Total Hours</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{weeklyStats.approvedHours}</div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-yellow-600">{weeklyStats.pendingHours}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{weeklyStats.draftHours}</div>
              <div className="text-sm text-gray-500">Draft</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Entry */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Time Entry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={newEntry.date}
              onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={newEntry.project}
              onChange={(e) => setNewEntry({ ...newEntry, project: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select project</option>
              {projects.map(project => (
                <option key={project.id} value={project.name}>
                  {project.name} ({project.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={newEntry.hours}
              onChange={(e) => setNewEntry({ ...newEntry, hours: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={newEntry.description}
              onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Work description"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddEntry}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Timesheet Entries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Time Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timesheetEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No timesheet entries found</p>
                    <p className="text-sm text-gray-500 mt-1">Add your first time entry using the form above</p>
                  </td>
                </tr>
              ) : (
                timesheetEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.project}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entry.hours}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{entry.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {entry.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleEditEntry(entry.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Timesheets;