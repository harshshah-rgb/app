import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plane, Plus, Receipt, Calendar, DollarSign, MapPin, FileText, Eye, Edit3, Trash2, X, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Expense } from '../lib/supabase';

// Travel Request interface
interface TravelRequest {
  id: string;
  request_id: string;
  date: string;
  destination: string;
  purpose: string;
  category: string;
  amount: number;
  notes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Exchange rates (in a real app, this would come from an API)
const EXCHANGE_RATES: Record<string, number> = {
  'AED': 1.0,
  'USD': 3.67,
  'INR': 0.044,
  'OMR': 9.53,
  'EUR': 4.0,
  'GBP': 4.6
};

const TravelExpense: React.FC = () => {
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [travelRequests, setTravelRequests] = useState<TravelRequest[]>([]);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [editingTravelRequest, setEditingTravelRequest] = useState<TravelRequest | null>(null);
  const [viewingTravelRequest, setViewingTravelRequest] = useState<TravelRequest | null>(null);
  const [newTravelRequest, setNewTravelRequest] = useState({
    date: '',
    destination: '',
    purpose: '',
    category: '',
    amount: '',
    notes: ''
  });
  const [newExpense, setNewExpense] = useState({
    date: '',
    category: '',
    description: '',
    currency: 'AED',
    amount: '',
    receipt: ''
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Fetch expenses from Supabase
  useEffect(() => {
    if (activeTab === 'expenses') {
      fetchExpenses();
    } else if (activeTab === 'travel') {
      fetchTravelRequests();
    }
  }, [activeTab]);

  const fetchTravelRequests = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching travel requests...');
      
      // For now, we'll use localStorage since we don't have a travel_requests table
      const storedRequests = localStorage.getItem('travelRequests');
      if (storedRequests) {
        setTravelRequests(JSON.parse(storedRequests));
      } else {
        setTravelRequests([]);
      }
    } catch (err) {
      console.error('❌ Fetch travel requests error:', err);
      setError('Failed to fetch travel requests');
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadReceiptImage = async (file: File): Promise<string> => {
    try {
      setUploadingReceipt(true);
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `receipt_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload receipt image');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Receipt upload error:', err);
      throw err;
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Handle receipt image selection
  const handleReceiptImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadReceiptImage(file);
      setNewExpense({ ...newExpense, receipt: imageUrl });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload receipt');
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching expenses from Supabase...');
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_id', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching expenses:', error);
        setError('Failed to fetch expenses');
        return;
      }

      console.log('✅ Expenses fetched:', data?.length || 0);
      setExpenses(data || []);
    } catch (err) {
      console.error('❌ Fetch expenses error:', err);
      setError('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const convertToAED = (amount: number, currency: string): number => {
    const rate = EXCHANGE_RATES[currency] || 1;
    return amount * rate;
  };

  const tabs = [
    { id: 'expenses', label: 'Local Expenses', icon: Receipt },
    { id: 'travel', label: 'Travel Expense', icon: Plane },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  const expenseCategories = [
    'Business Meals', 'Internet Recharge', 'Local Conveyance', 'Medical Insurance', 'Miscellaneous', 'Office Admin','Promotion Business','Staff Meals','Subscriptions'
  ];

  const travelCategories = [
    'Air Fare',
    'Airport Tax', 
    'Breakfast',
    'Dinner',
    'Extra Baggage Charges',
    'Hotel Tariff',
    'Sim Card',
    'Sim Recharge',
    'Visa'
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddExpense = async () => {
    if (newExpense.date && newExpense.category && newExpense.description && newExpense.amount) {
      try {
        setLoading(true);
        console.log('🔄 Adding expense to Supabase...');
        
        const amount = parseFloat(newExpense.amount);
        const amountAED = convertToAED(amount, newExpense.currency);
        
        const { data, error } = await supabase
          .from('expenses')
          .insert([{
            date: newExpense.date,
            category: newExpense.category,
            description: newExpense.description,
            currency: newExpense.currency,
            amount: amount,
            amount_aed: amountAED,
            receipt: newExpense.receipt || null
          }])
          .select()
          .single();

        if (error) {
          console.error('❌ Error adding expense:', error);
          setError('Failed to add expense');
          return;
        }

        console.log('✅ Expense added:', data);
        
        // Reset form and close modal
        setNewExpense({
          date: '',
          category: '',
          description: '',
          currency: 'AED',
          amount: '',
          receipt: ''
        });
        setShowAddForm(false);
        
        // Refresh expenses list
        await fetchExpenses();
        
      } catch (err) {
        console.error('❌ Add expense error:', err);
        setError('Failed to add expense');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setNewExpense({
      date: expense.date,
      category: expense.category,
      description: expense.description,
      currency: expense.currency,
      amount: expense.amount.toString(),
      receipt: expense.receipt || ''
    });
    setShowAddForm(true);
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense) return;
    
    try {
      setLoading(true);
      console.log('🔄 Updating expense in Supabase...');
      
      const amount = parseFloat(newExpense.amount);
      const amountAED = convertToAED(amount, newExpense.currency);
      
      const { error } = await supabase
        .from('expenses')
        .update({
          date: newExpense.date,
          category: newExpense.category,
          description: newExpense.description,
          currency: newExpense.currency,
          amount: amount,
          amount_aed: amountAED,
          receipt: newExpense.receipt || null
        })
        .eq('expense_id', editingExpense.expense_id);

      if (error) {
        console.error('❌ Error updating expense:', error);
        setError('Failed to update expense');
        return;
      }

      console.log('✅ Expense updated');
      
      // Reset form and close modal
      setNewExpense({
        date: '',
        category: '',
        description: '',
        currency: 'AED',
        amount: '',
        receipt: ''
      });
      setEditingExpense(null);
      setShowAddForm(false);
      
      // Refresh expenses list
      await fetchExpenses();
      
    } catch (err) {
      console.error('❌ Update expense error:', err);
      setError('Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      setLoading(true);
      console.log('🔄 Deleting expense from Supabase...');
      
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('expense_id', expenseId);

      if (error) {
        console.error('❌ Error deleting expense:', error);
        setError('Failed to delete expense');
        return;
      }

      console.log('✅ Expense deleted');
      
      // Refresh expenses list
      await fetchExpenses();
      
    } catch (err) {
      console.error('❌ Delete expense error:', err);
      setError('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingExpense(null);
    setViewingExpense(null);
    setNewExpense({
      date: '',
      category: '',
      description: '',
      currency: 'AED',
      amount: '',
      receipt: ''
    });
    setError(null);
  };
const handleCloseTravelForm = () => {
  setShowTravelForm(false);
  setEditingTravelRequest(null);
  setNewTravelRequest({ date: '', destination: '', purpose: '', category: '', amount: '', notes: '' });
  setError(null);
};

  const handleAddTravelRequest = () => {
  if (
    !newTravelRequest.date ||
    !newTravelRequest.destination ||
    !newTravelRequest.purpose ||
    !newTravelRequest.category ||
    !newTravelRequest.amount
  ) {
    setError('Please fill in all required fields');
    return;
  }

  const amountNum = parseFloat(newTravelRequest.amount);
  if (isNaN(amountNum) || amountNum < 0) {
    setError('Please enter a valid amount');
    return;
  }

  // Generate sequential ID: "BFC 3001", "BFC 3002", ...
  const nextRequestIdNumber = 3001 + travelRequests.length;
  const nextRequestId = `BFC ${nextRequestIdNumber}`;

  const newRequest: TravelRequest = {
    id: crypto.randomUUID(),
    request_id: nextRequestId,
    date: newTravelRequest.date,
    destination: newTravelRequest.destination,
    purpose: newTravelRequest.purpose,
    category: newTravelRequest.category,
    amount: amountNum,
    notes: newTravelRequest.notes || '',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updatedRequests = [...travelRequests, newRequest];
  localStorage.setItem('travelRequests', JSON.stringify(updatedRequests));
  setTravelRequests(updatedRequests);

  setNewTravelRequest({
    date: '',
    destination: '',
    purpose: '',
    category: '',
    amount: '',
    notes: '',
  });
  setShowTravelForm(false);
  setError(null);
};

const getRequestStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'rejected':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'draft':
      return <Clock className="h-5 w-5 text-gray-400" />;
    default:
      return <Clock className="h-5 w-5 text-gray-400" />;
  }
};

const handleDeleteTravelRequest = (id: string) => {
  if (!confirm('Are you sure you want to delete this travel request?')) return;

  const updatedRequests = travelRequests.filter(request => request.id !== id);
  localStorage.setItem('travelRequests', JSON.stringify(updatedRequests));
  setTravelRequests(updatedRequests);
};

const handleEditTravelRequest = (request: TravelRequest) => {
  setEditingTravelRequest(request);
  setNewTravelRequest({
    date: request.date,
    destination: request.destination,
    purpose: request.purpose,
    category: request.category,
    amount: request.amount.toString(),
    notes: request.notes || '',
  });
  setShowTravelForm(true);
};

  const handleUpdateTravelRequest = () => {
  if (!editingTravelRequest) return;

  if (
    !newTravelRequest.date ||
    !newTravelRequest.destination ||
    !newTravelRequest.purpose ||
    !newTravelRequest.category ||
    !newTravelRequest.amount
  ) {
    setError('Please fill in all required fields');
    return;
  }

  const amountNum = parseFloat(newTravelRequest.amount);
  if (isNaN(amountNum) || amountNum < 0) {
    setError('Please enter a valid amount');
    return;
  }

  const updatedRequest: TravelRequest = {
    ...editingTravelRequest,
    date: newTravelRequest.date,
    destination: newTravelRequest.destination,
    purpose: newTravelRequest.purpose,
    category: newTravelRequest.category,
    amount: amountNum,
    notes: newTravelRequest.notes || '',
    updated_at: new Date().toISOString(),
  };

  const updatedRequests = travelRequests.map(req =>
    req.id === updatedRequest.id ? updatedRequest : req
  );
  localStorage.setItem('travelRequests', JSON.stringify(updatedRequests));
  setTravelRequests(updatedRequests);

  setEditingTravelRequest(null);
  setNewTravelRequest({
    date: '',
    destination: '',
    purpose: '',
    category: '',
    amount: '',
    notes: '',
  });
  setShowTravelForm(false);
  setError(null);
};

  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'expenses':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-gray-900">AED {expenses.reduce((total, expense) => total + expense.amount_aed, 0).toFixed(2)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">AED 0.00</p>
                  </div>
                  <Receipt className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">AED 0.00</p>
                  </div>
                  <Receipt className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount (AED)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No expenses recorded</p>
                          <p className="text-sm text-gray-500 mt-1">Add your first expense using the button above</p>
                        </td>
                      </tr>
                    ) : (
                      expenses.map((expense, index) => (
                        <tr key={expense.expense_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="group relative flex items-center">
                              <span>{expense.expense_id}</span>
                              <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2">
                                <button
                                  onClick={() => setViewingExpense(expense)}
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                                  title="View expense details"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleEditExpense(expense)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                  title="Edit expense"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteExpense(expense.expense_id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                                  title="Delete expense"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.currency}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            AED {expense.amount_aed.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {expense.receipt ? (
                              <a href={expense.receipt} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" title="View receipt" />
                              </a>
                            ) : (
                              <span className="text-gray-400">No receipt</span>
                            )}
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

      case 'travel':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{travelRequests.length}</p>
                  </div>
                  <Plane className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {travelRequests.filter(req => req.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">
                      AED {travelRequests.reduce((total, req) => total + req.amount, 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Travel Expense Requests</h3>
              <button
                onClick={() => setShowTravelForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                 New Request
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {travelRequests.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No travel requests found</p>
                          <p className="text-sm text-gray-500 mt-1">Create your first travel request using the "+ New Request" button above</p>
                        </td>
                      </tr>
                    ) : (
                      travelRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <div className="group relative flex items-center">
                              <span>{request.request_id}</span>
                              <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-2">
                                <button
                                  onClick={() => setViewingTravelRequest(request)}
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
                                  title="View request details"
                                >
                                  <Eye className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleEditTravelRequest(request)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-100 transition-colors"
                                  title="Edit request"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteTravelRequest(request.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-100 transition-colors"
                                  title="Delete request"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(request.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.destination}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{request.purpose}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            AED {request.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getRequestStatusIcon(request.status)}
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
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
            <h3 className="text-lg font-semibold text-gray-900">Expense Reports</h3>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No expense reports available</p>
                <p className="text-sm text-gray-500 mt-2">Reports will be generated based on your expense submissions</p>
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
        <h1 className="text-2xl font-bold text-gray-900">Travel & Expense</h1>
        <p className="text-gray-600">Manage travel requests and expense submissions</p>
      </div>

      {/* Travel Request Form Modal */}
      {showTravelForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <button
              onClick={handleCloseTravelForm}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTravelRequest ? 'Edit Travel Request' : '+ New Travel Request'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Travel *</label>
                  <input
                    type="date"
                    value={newTravelRequest.date}
                    onChange={(e) => setNewTravelRequest({ ...newTravelRequest, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                  <input
                    type="text"
                    value={newTravelRequest.destination}
                    onChange={(e) => setNewTravelRequest({ ...newTravelRequest, destination: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter destination"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                  <textarea
                    value={newTravelRequest.purpose}
                    onChange={(e) => setNewTravelRequest({ ...newTravelRequest, purpose: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={3}
                    placeholder="Brief description of travel purpose"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newTravelRequest.category}
                    onChange={(e) => setNewTravelRequest({ ...newTravelRequest, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select category</option>
                    {travelCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newTravelRequest.amount}
                    onChange={(e) => setNewTravelRequest({ ...newTravelRequest, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={newTravelRequest.notes}
                    onChange={(e) => setNewTravelRequest({ ...newTravelRequest, notes: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={2}
                    placeholder="Additional information"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseTravelForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingTravelRequest ? handleUpdateTravelRequest : handleAddTravelRequest}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (editingTravelRequest ? 'Update Request' : 'Submit Request')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Travel Request Modal */}
      {viewingTravelRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Travel Request Details</h3>
              <button
                onClick={() => setViewingTravelRequest(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Request ID</label>
                  <p className="text-sm text-gray-900 font-mono">{viewingTravelRequest.request_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{new Date(viewingTravelRequest.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <p className="text-sm text-gray-900">{viewingTravelRequest.destination}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Purpose</label>
                <p className="text-sm text-gray-900">{viewingTravelRequest.purpose}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="text-sm text-gray-900">{viewingTravelRequest.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-sm text-gray-900 font-semibold">AED {viewingTravelRequest.amount.toFixed(2)}</p>
                </div>
              </div>
              {viewingTravelRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{viewingTravelRequest.notes}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="flex items-center mt-1">
                  {getRequestStatusIcon(viewingTravelRequest.status)}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingTravelRequest.status)}`}>
                    {viewingTravelRequest.status}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <label className="block font-medium">Created</label>
                  <p>{new Date(viewingTravelRequest.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block font-medium">Updated</label>
                  <p>{new Date(viewingTravelRequest.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setViewingTravelRequest(null);
                  handleEditTravelRequest(viewingTravelRequest);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setViewingTravelRequest(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
             <button
        onClick={handleCloseForm}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {expenseCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter expense description"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={newExpense.currency}
                    onChange={(e) => setNewExpense({ ...newExpense, currency: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="AED">AED</option>
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="OMR">OMR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleReceiptImageChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={uploadingReceipt}
                    />
                    {uploadingReceipt && (
                      <div className="flex items-center text-sm text-blue-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Uploading receipt...
                      </div>
                    )}
                    {newExpense.receipt && (
                      <div className="flex items-center text-sm text-green-600">
                        <span>✓ Receipt uploaded successfully</span>
                        <button
                          type="button"
                          onClick={() => setNewExpense({ ...newExpense, receipt: '' })}
                          className="ml-2 text-red-600 hover:text-red-800 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload an image or take a photo of your receipt</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL (Alternative)</label>
                  <input
                    type="url"
                    value={newExpense.receipt}
                    onChange={(e) => setNewExpense({ ...newExpense, receipt: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Or enter receipt URL manually (optional)"
                    disabled={uploadingReceipt}
                  />
                  <p className="text-xs text-gray-500 mt-1">Alternative: Enter receipt URL manually</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseForm}
                  disabled={uploadingReceipt}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                  disabled={loading || uploadingReceipt}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading || uploadingReceipt ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Add Expense')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Expense Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Expense Details</h3>
              <button
                onClick={() => setViewingExpense(null)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expense ID</label>
                  <p className="text-sm text-gray-900 font-mono">{viewingExpense.expense_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{new Date(viewingExpense.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900">{viewingExpense.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{viewingExpense.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Currency</label>
                  <p className="text-sm text-gray-900">{viewingExpense.currency}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-sm text-gray-900">{viewingExpense.amount.toFixed(2)}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (AED)</label>
                <p className="text-sm text-gray-900 font-semibold">AED {viewingExpense.amount_aed.toFixed(2)}</p>
              </div>
              {viewingExpense.receipt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
                  <div className="border border-gray-200 rounded-lg p-2">
                    <img 
                      src={viewingExpense.receipt} 
                      alt="Receipt" 
                      className="max-w-full h-auto max-h-48 mx-auto rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<a href="${viewingExpense.receipt}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-900 text-sm">View Receipt</a>`;
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <label className="block font-medium">Created</label>
                  <p>{new Date(viewingExpense.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block font-medium">Updated</label>
                  <p>{new Date(viewingExpense.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setViewingExpense(null);
                  handleEditExpense(viewingExpense);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

      {renderTabContent()}
    </div>
  );
};

export default TravelExpense;
