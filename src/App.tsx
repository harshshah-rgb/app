import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Announcements from './pages/Announcements';

import HR from './pages/HR';

import Timesheets from './pages/Timesheets';
import Sales from './pages/Sales';
import TravelExpense from './pages/Expense';
import HelpDesk from './pages/HelpDesk';
import ChangePassword from './pages/ChangePassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/announcements" element={<Announcements />} />
             
                <Route path="/hr" element={<HR />} />
            
                <Route path="/timesheets" element={<Timesheets />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/travel-expense" element={<TravelExpense />} />
                <Route path="/help-desk" element={<HelpDesk />} />
                <Route path="/change-password" element={<ChangePassword />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;