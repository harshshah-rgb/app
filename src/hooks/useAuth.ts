import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getEmployeeData } from '../lib/supabase';
import type { Employee } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  department: string;
  position: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Helper to load user/employee data
  const loadUserData = async (userId: string) => {
    try {
      const employeeData = await getEmployeeData(userId);
      
      if (employeeData) {
        setEmployee(employeeData);
        setUser({
          id: employeeData.id,
          email: employeeData.email,
          first_name: employeeData.first_name,
          last_name: employeeData.last_name,
          department: employeeData.department,
          position: employeeData.position,
        });
      } else {
        // No employee record found, create fallback user
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.email) {
          const firstName = currentUser.email.split('@')[0];
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
            last_name: '',
            department: 'General',
            position: 'Employee',
          });
        } else {
          setUser(null);
        }
        setEmployee(null);
      }
    } catch (employeeError) {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser && currentUser.email) {
          const firstName = currentUser.email.split('@')[0];
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            first_name: firstName.charAt(0).toUpperCase() + firstName.slice(1),
            last_name: '',
            department: 'General',
            position: 'Employee',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
      setEmployee(null);
    }
  };

  // Helper to check current auth state on mount
  const checkAuth = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        await loadUserData(currentUser.id);
      } else {
        setUser(null);
        setEmployee(null);
      }
    } catch (error) {
      setUser(null);
      setEmployee(null);
    } finally {
      setInitialized(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    checkAuth();

    // Proper event subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        // Instead of async/await directly in event handler, schedule async updates outside
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          setTimeout(() => {
            // Do async work outside event handler
            loadUserData(session.user.id)
              .finally(() => {
                if (mounted) setLoading(false);
              });
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setEmployee(null);
          setLoading(false);
        }
      }
    );

    // Cleanup on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setEmployee(null);
    } catch (error) {
      // Optionally handle logout error
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    employee,
    loading: loading || !initialized,
    isAuthenticated: !!user,
    logout,
    refreshAuth: checkAuth
  };
};
