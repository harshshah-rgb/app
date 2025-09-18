import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { Employee } from '../lib/supabase';

export const useEmployeeData = () => {
  const { user, loading: authLoading } = useAuth(); // ← wait for auth to finish
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ Wait for auth to load before fetching
    if (!authLoading) {
      fetchEmployeeData();
    }
  }, [authLoading]);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);

      if (!user) {
        setEmployee(null);
        return;
      }

      // Simulated employee object (your demo logic)
      const employeeData: Employee = {
        id: user.id,
        employee_id: 'EMP001',
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        department: user.department,
        position: user.position,
        hire_date: '2023-01-15',
        status: 'active',
        phone: '+1-555-0101',
        address: '123 Main St, New York, NY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setEmployee(employeeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employee data');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!employee) return 'Employee';
    return employee.first_name;
  };

  const getFullName = () => {
    if (!employee) return 'Employee';
    return `${employee.first_name} ${employee.last_name}`;
  };

  return {
    employee,
    loading,
    error,
    getDisplayName,
    getFullName,
    refreshEmployee: fetchEmployeeData
  };
};
