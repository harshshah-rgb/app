import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Eye, Edit3, Search, Filter, DollarSign, Users, Target, Calendar, Trash2, FileText, Download, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Sales: React.FC = () => {
  const [activeTab, setActiveTab] = useState('leads');
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [showAddOpportunityForm, setShowAddOpportunityForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [salesReports, setSalesReports] = useState<any[]>([]);
  const [editingLead, setEditingLead] = useState<string | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<string | null>(null);
  const [viewingLead, setViewingLead] = useState<any>(null);
  const [editingLeadData, setEditingLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const countries = [
    'Afghanistan', 'Australia', 'Bahrain', 'Bangladesh', 'Belarus', 'Brazil',
    'Cameroon', 'Canada', 'China', 'Colombia', 'Congo', 'Cuba', 'Cyprus',
    'Denmark', 'Egypt', 'Eswatini (Swaziland)', 'Ethiopia', 'Gambia',
    'Germany', 'Ghana', 'Greece', 'Guinea', 'India', 'Indonesia', 'Iran',
    'Iraq', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kenya',
    'Kuwait', 'Lebanon', 'Madagascar', 'Malaysia', 'Maldives', 'Mauritius',
    'Mexico', 'Morocco', 'Mozambique', 'Nepal', 'Netherlands', 'New Zealand',
    'Nigeria', 'North Korea', 'Norway', 'Oman', 'Other Country', 'Pakistan',
    'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Russia',
    'Saudi Arabia', 'Seychelles', 'Singapore', 'Somalia', 'South Africa',
    'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'State of Palestine',
    'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tanzania',
    'Thailand', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine', 'United Arab Emirates',
    'United Kingdom', 'United States', 'USA/Netherland', 'Yemen', 'Zambia',
    'Zimbabwe'
  ];

  
  // Generate sales ID based on index
  const generateSalesId = (index: number) => {
    return `BFC ${1000 + index}`;
  };

  // Lead form state
  const [leadForm, setLeadForm] = useState({
    accountName: '',
    projectName: '',
    city: '',
    country: '',
    estimatedClosureDate: '',
    vendor: '',
    probability: '',
    amount: '',
    status: 'new',
    leadSource: '',
    notes: '',

  });

  // Opportunity form state
  const [opportunityForm, setOpportunityForm] = useState({
    clientName: '',
    opportunityValue: '',
    stage: 'discovery',
    probability: '',
    expectedCloseDate: '',
    productService: '',
    leadSource: '',
    description: ''
  });

  // Sample data (will be replaced with real data from backend)
  const [leads, setLeads] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  const tabs = [
    { id: 'leads', label: 'Leads Management', icon: Users },
    { id: 'opportunities', label: 'Sales Opportunities', icon: Target },
    { id: 'reports', label: 'Sales Reports', icon: TrendingUp },
  ];

  const leadStatuses = ['new', 'upsell'];
  const opportunityStages = ['discovery', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];
  const leadSources = ['Website', 'Referral', 'Cold Call', 'Trade Show', 'LinkedIn', 'Social Media', 'Email Campaign'];

  // Fetch leads from Supabase
  const fetchLeads = async () => {
    console.log('🔄 Fetching leads from Supabase...');
    setDebugInfo('Fetching leads...');
    try {
      setLeadsLoading(true);
      console.log('Fetching leads from Supabase...');
      
      const { data, error } = await supabase
        .from('leads_management')
        .select('*')
        .order('sales_id', { ascending: false });

      if (error) {
        console.error('❌ Error fetching leads:', error);
        setDebugInfo(`Error fetching: ${error.message}`);
        console.error('Error fetching leads:', error);
        alert('Failed to fetch leads: ' + error.message);
        return;
      }

      console.log('✅ Leads fetched successfully:', data);
      setDebugInfo(`Fetched ${data?.length || 0} leads`);
      console.log('Leads fetched successfully:', data);
      setLeads(data || []);
    } catch (err) {
      console.error('❌ Fetch leads error:', err);
      console.error('Error in fetchLeads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leads');
      setDebugInfo(`Fetch error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      alert('Failed to fetch leads');
    } finally {
      setLeadsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    // Initial fetch
    if (activeTab === 'leads') {
      console.log('📋 Leads tab activated, fetching data...');
      fetchLeads();
    }

    // Set up real-time subscription
    if (activeTab === 'leads') {
      console.log('🔄 Setting up real-time subscription...');
      setDebugInfo('Setting up real-time sync...');
      
      const subscription = supabase
        .channel('leads_management_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'leads_management' 
          }, 
          (payload) => {
            console.log('🔄 Real-time change detected:', payload);
            setDebugInfo(`Real-time: ${payload.eventType} operation detected`);
            console.log('Real-time change detected:', payload);
            
            if (payload.eventType === 'INSERT') {
              setLeads(prev => [payload.new, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              setLeads(prev => prev.map(lead => 
                lead.sales_id === payload.new.sales_id ? payload.new : lead
              ));
            } else if (payload.eventType === 'DELETE') {
              setLeads(prev => prev.filter(lead => 
                lead.sales_id !== payload.old.sales_id
              ));
            }
          }
        )
        .subscribe();

      return () => {
        console.log('🔌 Cleaning up real-time subscription...');
        subscription.unsubscribe();
      };
    }
  }, [activeTab]);

  const handleLeadFormChange = (field: string, value: string) => {
    setLeadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOpportunityFormChange = (field: string, value: string) => {
    setOpportunityForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new lead to Supabase
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('➕ Adding new lead:', leadForm);
    setDebugInfo('Adding new lead...');
    
    if (leadForm.accountName && leadForm.projectName && leadForm.city && leadForm.country && leadForm.amount) {
      console.log('⚠️ Missing required fields');
      setDebugInfo('Missing required fields');
      // Calculate probability based on lead information
      const calculatedProbability = calculateLeadProbability(leadForm);
      
      try {
        setLoading(true);
        
        // Generate unique sales_id
        const salesId = `BFC-${Date.now()}`;
        console.log('🆔 Generated Sales ID:', salesId);
        
        const leadData = {
          sales_id: salesId,
          status: leadForm.status,
          account: leadForm.accountName,
          amount: parseFloat(leadForm.amount),
          probability: calculatedProbability,
          closure_date: leadForm.estimatedClosureDate
        };

        console.log('📤 Inserting lead data:', leadData);
        setDebugInfo('Inserting to database...');
        
        const { data, error } = await supabase
          .from('leads_management')
          .insert([leadData])
          .select()
          .single();

        if (error) {
          console.error('❌ Insert error:', error);
          setDebugInfo(`Insert error: ${error.message}`);
          throw error;
        }

        console.log('✅ Lead added successfully:', data);
        setDebugInfo('Lead added successfully!');
        
        const newLead = {
          id: Date.now().toString(),
          ...leadForm,
          probability: calculatedProbability,
          amount: parseFloat(leadForm.amount) || 0,
          createdAt: new Date().toISOString(),
        };
        setLeads(prev => [newLead, ...prev]);
        setLeadForm({
          accountName: '',
          projectName: '',
          city: '',
          country: '',
          estimatedClosureDate: '',
          vendor: '',
          status: 'new',
          leadSource: '',
          notes: '',
          amount: ''
        });
        setShowAddLeadForm(false);
        
        // Refresh leads list
        console.log('🔄 Refreshing leads list...');
        setDebugInfo('Refreshing list...');
        await fetchLeads();
        
        alert('Lead added successfully!');
      } catch (err) {
        console.error('❌ Add lead error:', err);
        setError(err instanceof Error ? err.message : 'Failed to add lead');
        setDebugInfo(`Add error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        alert('Failed to add lead. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };


  // Function to calculate probability based on lead information
  const calculateLeadProbability = (lead: any) => {
    let probability = 0;
    
    // Base probability based on status
    switch (lead.status) {
      case 'new': probability = 10; break;
      case 'upsell': probability = 20; break;
      default: probability = 10;
    }

    
    // Cap probability at 100%
    return Math.min(probability, 100);
  };

  const handleViewLead = (lead: any) => {
    setViewingLead(lead);
  };

  const handleEditLead = (lead: any) => {
    setEditingLeadData({
      id: lead.id,
      account_name: lead.account_name,
      project_name: lead.project_name,
      city: lead.city,
      country: lead.country,
      estimated_closure_date: lead.estimated_closure_date || '',
      vendor: lead.vendor || '',
      status: lead.status,
      lead_source: lead.lead_source || '',
      notes: lead.notes || '',
      amount: lead.amount?.toString() || ''
    });
    setEditingLead(lead.id);
  };

  // Update existing lead in Supabase
  const handleSaveEditLead = async () => {
    console.log('✏️ Updating lead:', editingLead, editingLeadData);
    setDebugInfo(`Updating lead ${editingLead}...`);
    
    if (editingLeadData && editingLead) {
      try {
        setLoading(true);
        
        const { error } = await supabase
          .from('leads_management')
          .update({
            status: editingLeadData.status,
            account: editingLeadData.account_name,
            amount: parseFloat(editingLeadData.amount),
            probability: editingLeadData.probability,
            closure_date: editingLeadData.estimated_closure_date
          })
          .eq('sales_id', editingLead);

        if (error) {
          console.error('❌ Update error:', error);
          setDebugInfo(`Update error: ${error.message}`);
          throw error;
        }

        console.log('✅ Lead updated successfully');
        setDebugInfo('Lead updated successfully!');
        
        // Assuming updateLead is a function that updates the lead in the backend
        await updateLead(editingLead, {
          account_name: editingLeadData.account_name,
          project_name: editingLeadData.project_name,
          city: editingLeadData.city,
          country: editingLeadData.country,
          estimated_closure_date: editingLeadData.estimated_closure_date || null,
          vendor: editingLeadData.vendor || null,
          status: editingLeadData.status,
          lead_source: editingLeadData.lead_source || null,
          notes: editingLeadData.notes || null,
          amount: parseFloat(editingLeadData.amount) || 0
        });

        // Update the leads state with the edited lead
        setLeads(prev => 
          prev.map(lead => 
            lead.id === editingLead ? { ...lead, ...editingLeadData } : lead
          )
        );

        // Refresh leads list
        await fetchLeads();
        
        alert('Lead updated successfully!');
        setEditingLead(null);
        setEditingLeadData(null);
      } catch (err) {
        console.error('❌ Update lead error:', err);
        setError(err instanceof Error ? err.message : 'Failed to update lead');
        setDebugInfo(`Update error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        alert('Failed to update lead. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };


  const handleCancelEditLead = () => {
    setEditingLead(null);
    setEditingLeadData(null);
  };

  const handleUpdateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      const updatedLead = {
        ...selectedItem,
        ...leadForm,
        probability: parseFloat(leadForm.probability) || 0,
        amount: parseFloat(leadForm.amount) || 0,
        updatedAt: new Date().toISOString(),
      };
      setLeads(prev => prev.map(lead => lead.id === selectedItem.id ? updatedLead : lead));
      setShowEditModal(false);
      setSelectedItem(null);
    }
  };

  // Delete lead from Supabase
  const handleDeleteLead = async (leadId: string) => {
    console.log('🗑️ Deleting lead:', leadId);
    setDebugInfo(`Deleting lead ${leadId}...`);
    
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        setLoading(true);
        
        const { error } = await supabase
          .from('leads_management')
          .delete()
          .eq('sales_id', leadId);

        if (error) {
          console.error('❌ Delete error:', error);
          setDebugInfo(`Delete error: ${error.message}`);
          throw error;
        }

        console.log('✅ Lead deleted successfully');
        setDebugInfo('Lead deleted successfully!');
        
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
        
        // Refresh leads list
        await fetchLeads();
        
        alert('Lead deleted successfully!');
      } catch (err) {
        console.error('❌ Delete lead error:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete lead');
        setDebugInfo(`Delete error: ${err instanceof Error ? err.message : 'Unknown error'}`);
        alert('Failed to delete lead. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (opportunityForm.clientName && opportunityForm.opportunityValue && opportunityForm.expectedCloseDate) {
      const newOpportunity = {
        id: Date.now().toString(),
        ...opportunityForm,
        opportunityValue: parseFloat(opportunityForm.opportunityValue) || 0,
        probability: parseFloat(opportunityForm.probability) || 0,
        createdAt: new Date().toISOString(),
      };
      setOpportunities(prev => [newOpportunity, ...prev]);
      setOpportunityForm({
        clientName: '',
        opportunityValue: '',
        stage: 'discovery',
        probability: '',
        expectedCloseDate: '',
        productService: '',
        leadSource: '',
        description: ''
      });
      setShowAddOpportunityForm(false);
    }
  };

  const handleViewOpportunity = (opportunity: any) => {
    setSelectedItem(opportunity);
    setShowViewModal(true);
  };

  const handleEditOpportunity = (opportunity: any) => {
    setSelectedItem(opportunity);
    setOpportunityForm({
      clientName: opportunity.clientName,
      opportunityValue: opportunity.opportunityValue.toString(),
      stage: opportunity.stage,
      probability: opportunity.probability.toString(),
      expectedCloseDate: opportunity.expectedCloseDate,
      productService: opportunity.productService || '',
      leadSource: opportunity.leadSource || '',
      description: opportunity.description || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      const updatedOpportunity = {
        ...selectedItem,
        ...opportunityForm,
        opportunityValue: parseFloat(opportunityForm.opportunityValue) || 0,
        probability: parseFloat(opportunityForm.probability) || 0,
        updatedAt: new Date().toISOString(),
      };
      setOpportunities(prev => prev.map(opp => opp.id === selectedItem.id ? updatedOpportunity : opp));
      setShowEditModal(false);
      setSelectedItem(null);
    }
  };

  const handleDeleteOpportunity = (opportunityId: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
    }
  };

  const generateSalesReport = () => {
    const reportDate = new Date().toISOString();
    const totalLeads = leads.length;
    const totalOpportunities = opportunities.length;
    const totalLeadValue = leads.reduce((sum, lead) => sum + (lead.amount || 0), 0);
    const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0);
    const avgLeadProbability = totalLeads > 0 ? leads.reduce((sum, lead) => sum + lead.probability, 0) / totalLeads : 0;
    const avgOppProbability = totalOpportunities > 0 ? opportunities.reduce((sum, opp) => sum + opp.probability, 0) / totalOpportunities : 0;

    const leadsByStatus = leadStatuses.reduce((acc, status) => {
      acc[status] = leads.filter(lead => lead.status === status).length;
      return acc;
    }, {} as Record<string, number>);

    const opportunitiesByStage = opportunityStages.reduce((acc, stage) => {
      acc[stage] = opportunities.filter(opp => opp.stage === stage).length;
      return acc;
    }, {} as Record<string, number>);

    const newReport = {
      id: Date.now().toString(),
      generatedAt: reportDate,
      reportName: `Sales Report - ${new Date().toLocaleDateString()}`,
      summary: {
        totalLeads,
        totalOpportunities,
        totalLeadValue,
        totalOpportunityValue,
        avgLeadProbability,
        avgOppProbability,
        combinedValue: totalLeadValue + totalOpportunityValue
      },
      leadsByStatus,
      opportunitiesByStage,
      topLeads: leads.sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5),
      topOpportunities: opportunities.sort((a, b) => b.opportunityValue - a.opportunityValue).slice(0, 5)
    };

    setSalesReports(prev => [newReport, ...prev]);
    setActiveTab('reports');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'upsell': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.sales_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = opportunity.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.productService?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || opportunity.stage === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalLeads = leads.length;
  const totalOpportunities = opportunities.length;
  const totalValue = opportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0) + leads.reduce((sum, lead) => sum + (lead.amount || 0), 0);
  const avgProbability = (leads.length + opportunities.length) > 0 
    ? (leads.reduce((sum, lead) => sum + lead.probability, 0) + opportunities.reduce((sum, opp) => sum + opp.probability, 0)) / (leads.length + opportunities.length)
    : 0;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'leads') {
      fetchLeads();
    }
  };

  // Test Supabase connection
  const testConnection = async () => {
    console.log('🔧 Testing Supabase connection...');
    setDebugInfo('Testing connection...');
    
    try {
      const { data, error } = await supabase
        .from('leads_management')
        .select('count(*)', { count: 'exact' });
      
      if (error) {
        console.error('❌ Connection test failed:', error);
        setDebugInfo(`Connection failed: ${error.message}`);
        alert(`Connection test failed: ${error.message}`);
      } else {
        console.log('✅ Connection test successful:', data);
        setDebugInfo(`Connection OK - Found ${data?.[0]?.count || 0} records`);
        alert(`Connection successful! Found ${data?.[0]?.count || 0} records in leads_management table.`);
      }
    } catch (err) {
      console.error('❌ Connection test error:', err);
      setDebugInfo(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      alert('Connection test failed. Check console for details.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'leads':
        return (
          <div className="space-y-6">
            {/* Debug Info Panel */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Debug Info</h4>
                  <p className="text-sm text-blue-600">{debugInfo || 'Ready'}</p>
                </div>
                <button
                  onClick={testConnection}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Test Connection
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search leads..."
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
                  {leadStatuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAddLeadForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                disabled={loading}
              >
                <Plus className="h-4 w-4 mr-2" />
                {loading ? 'Adding...' : 'Add Lead'}
              </button>
            </div>

            {/* Add Lead Form Modal */}
            {showAddLeadForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="relative mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Lead</h3>
                    <button
                      onClick={() => setShowAddLeadForm(false)}
                      className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form onSubmit={handleAddLead} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.accountName}
                          onChange={(e) => handleLeadFormChange('accountName', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter account name"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.projectName}
                          onChange={(e) => handleLeadFormChange('projectName', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter project name"
                          disabled={loading}
                        />
                      </div>
                    <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
  <select
    required
    value={leadForm.country}
    onChange={(e) => handleLeadFormChange('country', e.target.value)}
    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    disabled={loading}
  >
    <option value="">Select country</option>
    {countries.map(country => (
      <option key={country} value={country}>{country}</option>
    ))}
  </select>
</div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.city}
                          onChange={(e) => handleLeadFormChange('city', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter city"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={leadForm.amount}
                          onChange={(e) => handleLeadFormChange('amount', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter deal amount"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Closure Date</label>
                        <input
                          type="date"
                          value={leadForm.estimatedClosureDate}
                          onChange={(e) => handleLeadFormChange('estimatedClosureDate', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <input
                          type="text"
                          value={leadForm.vendor}
                          onChange={(e) => handleLeadFormChange('vendor', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter vendor"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={leadForm.status}
                          onChange={(e) => handleLeadFormChange('status', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        >
                          <option value="new">New</option>
                          <option value="upsell">Upsell</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                        <select
                          value={leadForm.leadSource}
                          onChange={(e) => handleLeadFormChange('leadSource', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        >
                          <option value="">Select source</option>
                          {leadSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        rows={3}
                        value={leadForm.notes}
                        onChange={(e) => handleLeadFormChange('notes', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional notes..."
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddLeadForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Adding...' : 'Add Lead'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Lead Modal */}
            {viewingLead && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Lead Details</h3>
                    <button
                      onClick={() => setViewingLead(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Sales ID</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead?.sales_id || 'Auto-generated'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Account Name</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead.account_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Project Name</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead.project_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead.city}, {viewingLead.country}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <p className="mt-1 text-sm text-gray-900">${viewingLead.amount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingLead.status)}`}>
                          {viewingLead.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Probability</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead.probability}%</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Vendor</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead.vendor || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lead Source</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead.lead_source || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Estimated Closure Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {viewingLead.estimated_closure_date ? new Date(viewingLead.estimated_closure_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {viewingLead.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="mt-1 text-sm text-gray-900">{viewingLead.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setViewingLead(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        // Handle send for approval logic here
                        console.log('Sending lead for approval:', viewingLead.id);
                        // You can add actual approval logic here
                        alert('Lead sent for approval successfully!');
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send for Approval
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Lead Modal */}
        {editingLead && editingLeadData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Lead</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                        <input
                          type="text"
                          required
                          value={editingLeadData.account_name}
                          onChange={(e) => setEditingLeadData({...editingLeadData, account_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                        <input
                          type="text"
                          required
                          value={editingLeadData.project_name}
                          onChange={(e) => setEditingLeadData({...editingLeadData, project_name: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={editingLeadData.city}
                          onChange={(e) => setEditingLeadData({...editingLeadData, city: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <input
                          type="text"
                          required
                          value={editingLeadData.country}
                          onChange={(e) => setEditingLeadData({...editingLeadData, country: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={editingLeadData.amount}
                          onChange={(e) => setEditingLeadData({...editingLeadData, amount: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Closure Date</label>
                        <input
                          type="date"
                          value={editingLeadData.estimated_closure_date}
                          onChange={(e) => setEditingLeadData({...editingLeadData, estimated_closure_date: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <input
                          type="text"
                          value={editingLeadData.vendor}
                          onChange={(e) => setEditingLeadData({...editingLeadData, vendor: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={editingLeadData.status}
                          onChange={(e) => setEditingLeadData({...editingLeadData, status: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        >
                          {leadStatuses.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                        <select
                          value={editingLeadData.lead_source}
                          onChange={(e) => setEditingLeadData({...editingLeadData, lead_source: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={loading}
                        >
                          <option value="">Select source</option>
                          {leadSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        rows={3}
                        value={editingLeadData.notes}
                        onChange={(e) => setEditingLeadData({...editingLeadData, notes: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCancelEditLead}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEditLead}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Edit Lead Form Modal */}
            {showEditModal && selectedItem && activeTab === 'leads' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Lead</h3>
                  <form onSubmit={handleUpdateLead} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.accountName}
                          onChange={(e) => handleLeadFormChange('accountName', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.projectName}
                          onChange={(e) => handleLeadFormChange('projectName', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.city}
                          onChange={(e) => handleLeadFormChange('city', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                        <input
                          type="text"
                          required
                          value={leadForm.country}
                          onChange={(e) => handleLeadFormChange('country', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={leadForm.amount}
                          onChange={(e) => handleLeadFormChange('amount', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={leadForm.probability}
                          onChange={(e) => handleLeadFormChange('probability', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={leadForm.status}
                          onChange={(e) => handleLeadFormChange('status', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {leadStatuses.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Update Lead
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Lead Modal */}
            {showViewModal && selectedItem && activeTab === 'leads' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Name</label>
                      <p className="text-gray-900">{selectedItem.accountName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Project Name</label>
                      <p className="text-gray-900">{selectedItem.projectName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900">{selectedItem.city}, {selectedItem.country}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <p className="text-gray-900">${selectedItem.amount?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Probability</label>
                      <p className="text-gray-900">{selectedItem.probability}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedItem.status)}`}>
                        {selectedItem.status.replace('_', ' ')}
                      </span>
                    </div>
                    {selectedItem.notes && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="text-gray-900">{selectedItem.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

     {/* Leads List */}
<div className="bg-white rounded-lg shadow-sm border border-gray-200">
  <div className="overflow-x-auto">
    {leadsLoading ? (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading leads...</span>
      </div>
    ) : (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales ID</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th> {/* New Amount Column */}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Closure Date</th>

        </tr>
      </thead>
    <tbody className="bg-white divide-y divide-gray-200">
  {filteredLeads.length === 0 ? (
    <tr>
      <td colSpan={6} className="px-6 py-12 text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No leads found</p>
        <p className="text-sm text-gray-500 mt-1">Add your first lead using the "Add Lead" button above</p>
      </td>
    </tr>
  ) : (
    filteredLeads.map((lead, index) => (
      <tr key={lead.sales_id || lead.id} className="hover:bg-gray-50 group">
        {/* Modified Sales ID cell with hover actions */}
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 relative group">
          <div className="flex items-center">
            {lead.sales_id || generateSalesId(index + 1)}
            <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <button 
                onClick={(e) => { e.stopPropagation(); handleViewLead(lead); }}
                className="text-blue-600 hover:text-blue-900"
                title="View Details"
                disabled={loading}
              >
                <Eye className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleEditLead(lead); }}
                className="text-green-600 hover:text-green-900"
                title="Edit Lead"
                disabled={loading}
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.sales_id || lead.id); }}
                className="text-red-600 hover:text-red-900"
                title="Delete Lead"
                disabled={loading}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </td>
        
        {/* Rest of your columns remain unchanged */}
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
            {lead.status.replace('_', ' ')}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.accountName || lead.account}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${lead.amount?.toLocaleString() || '0'}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{lead.probability}%</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {lead.estimatedClosureDate || lead.closure_date ? new Date(lead.estimatedClosureDate || lead.closure_date).toLocaleDateString() : '-'}
        </td>
      </tr>
    ))
  )}
</tbody>

    </table>
    )}
  </div>
</div>
          </div>
        );

      case 'opportunities':
        return (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
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
                  <option value="all">All Stages</option>
                  {opportunityStages.map(stage => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={generateSalesReport}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Sales Report
              </button>
              <button
                onClick={() => setShowAddOpportunityForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Opportunity
              </button>
            </div>

            {/* Add Opportunity Form Modal */}
            {showAddOpportunityForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Opportunity</h3>
                  <form onSubmit={handleAddOpportunity} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                        <input
                          type="text"
                          required
                          value={opportunityForm.clientName}
                          onChange={(e) => handleOpportunityFormChange('clientName', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter client name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Value *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={opportunityForm.opportunityValue}
                          onChange={(e) => handleOpportunityFormChange('opportunityValue', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter value"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                        <select
                          value={opportunityForm.stage}
                          onChange={(e) => handleOpportunityFormChange('stage', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {opportunityStages.map(stage => (
                            <option key={stage} value={stage}>
                              {stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={opportunityForm.probability}
                          onChange={(e) => handleOpportunityFormChange('probability', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close Date *</label>
                        <input
                          type="date"
                          required
                          value={opportunityForm.expectedCloseDate}
                          onChange={(e) => handleOpportunityFormChange('expectedCloseDate', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service</label>
                        <input
                          type="text"
                          value={opportunityForm.productService}
                          onChange={(e) => handleOpportunityFormChange('productService', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter product or service"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                        <select
                          value={opportunityForm.leadSource}
                          onChange={(e) => handleOpportunityFormChange('leadSource', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select source</option>
                          {leadSources.map(source => (
                            <option key={source} value={source}>{source}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={opportunityForm.description}
                        onChange={(e) => handleOpportunityFormChange('description', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Opportunity description..."
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddOpportunityForm(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Add Opportunity
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Opportunity Form Modal */}
            {showEditModal && selectedItem && activeTab === 'opportunities' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Opportunity</h3>
                  <form onSubmit={handleUpdateOpportunity} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                        <input
                          type="text"
                          required
                          value={opportunityForm.clientName}
                          onChange={(e) => handleOpportunityFormChange('clientName', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Opportunity Value *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={opportunityForm.opportunityValue}
                          onChange={(e) => handleOpportunityFormChange('opportunityValue', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                        <select
                          value={opportunityForm.stage}
                          onChange={(e) => handleOpportunityFormChange('stage', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {opportunityStages.map(stage => (
                            <option key={stage} value={stage}>
                              {stage.charAt(0).toUpperCase() + stage.slice(1).replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={opportunityForm.probability}
                          onChange={(e) => handleOpportunityFormChange('probability', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Update Opportunity
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* View Opportunity Modal */}
            {showViewModal && selectedItem && activeTab === 'opportunities' && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Opportunity Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Client Name</label>
                      <p className="text-gray-900">{selectedItem.clientName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Value</label>
                      <p className="text-gray-900">${selectedItem.opportunityValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stage</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedItem.stage)}`}>
                        {selectedItem.stage.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Probability</label>
                      <p className="text-gray-900">{selectedItem.probability}%</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Close Date</label>
                      <p className="text-gray-900">{new Date(selectedItem.expectedCloseDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product/Service</label>
                      <p className="text-gray-900">{selectedItem.productService}</p>
                    </div>
                    {selectedItem.description && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="text-gray-900">{selectedItem.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Opportunities List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product/Service</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOpportunities.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No opportunities found</p>
                          <p className="text-sm text-gray-500 mt-1">Add your first opportunity using the "New Opportunity" button above</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOpportunities.map((opportunity) => (
                        <tr key={opportunity.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{opportunity.clientName}</div>
                            <div className="text-sm text-gray-500">{opportunity.leadSource}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${opportunity.opportunityValue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.stage)}`}>
                              {opportunity.stage.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{opportunity.probability}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{opportunity.productService}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewOpportunity(opportunity)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Opportunity"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleEditOpportunity(opportunity)}
                                className="text-green-600 hover:text-green-900"
                                title="Edit Opportunity"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteOpportunity(opportunity.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Opportunity"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
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

      case 'reports':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Sales Reports</h3>
              <button
                onClick={generateSalesReport}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate New Report
              </button>
            </div>

            {salesReports.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No sales reports available</p>
                  <p className="text-sm text-gray-500 mt-2">Generate your first report using the "Generate New Report" button above</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {salesReports.map((report) => (
                  <div key={report.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{report.reportName}</h4>
                        <p className="text-sm text-gray-500">Generated on {new Date(report.generatedAt).toLocaleString()}</p>
                      </div>
                      <button className="flex items-center text-blue-600 hover:text-blue-800">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </button>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{report.summary.totalLeads}</div>
                        <div className="text-sm text-gray-600">Total Leads</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{report.summary.totalOpportunities}</div>
                        <div className="text-sm text-gray-600">Opportunities</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">${report.summary.combinedValue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Value</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{((report.summary.avgLeadProbability + report.summary.avgOppProbability) / 2).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600">Avg Probability</div>
                      </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Leads by Status */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Leads by Status</h5>
                        <div className="space-y-2">
                          {Object.entries(report.leadsByStatus).map(([status, count]) => (
                            <div key={status} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Opportunities by Stage */}
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-3">Opportunities by Stage</h5>
                        <div className="space-y-2">
                          {Object.entries(report.opportunitiesByStage).map(([stage, count]) => (
                            <div key={stage} className="flex justify-between items-center">
                              <span className="text-sm text-gray-600 capitalize">{stage.replace('_', ' ')}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Top Performers */}
                    {(report.topLeads.length > 0 || report.topOpportunities.length > 0) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {report.topLeads.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-3">Top Leads by Value</h5>
                              <div className="space-y-2">
                                {report.topLeads.map((lead: any) => (
                                  <div key={lead.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{lead.accountName}</span>
                                    <span className="font-medium">${(lead.amount || 0).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {report.topOpportunities.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-gray-900 mb-3">Top Opportunities by Value</h5>
                              <div className="space-y-2">
                                {report.topOpportunities.map((opp: any) => (
                                  <div key={opp.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{opp.clientName}</span>
                                    <span className="font-medium">${opp.opportunityValue.toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
        <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
        <p className="text-gray-600">Manage leads, opportunities, and track sales performance</p>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{totalOpportunities}</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Probability</p>
              <p className="text-2xl font-bold text-gray-900">{avgProbability.toFixed(1)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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

export default Sales;
