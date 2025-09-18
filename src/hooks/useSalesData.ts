import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SalesLead, SalesOpportunity } from '../lib/supabase';

export interface SalesReport {
  id: string;
  title: string;
  generated_date: string;
  total_opportunities: number;
  total_value: number;
  avg_probability: number;
  opportunities_by_stage: Record<string, number>;
  created_at: string;
}

export const useSalesData = () => {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const [reports, setReports] = useState<SalesReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchLeads(),
        fetchOpportunities(),
        fetchReports()
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads_management')
      .select(`
        *
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setLeads(data || []);
  };

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('sales_opportunities')
      .select(`
        *,
        account_manager:account_manager_id(first_name, last_name),
        creator:created_by(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setOpportunities(data || []);
  };

  const fetchReports = async () => {
    // For now, we'll store reports in localStorage since we don't have a reports table
    // In a real application, you'd create a sales_reports table
    const storedReports = localStorage.getItem('salesReports');
    if (storedReports) {
      setReports(JSON.parse(storedReports));
    }
  };

  const calculateProbability = (leadData: any) => {
    let probability = 0;

    // Base probability based on status
    const statusProbabilities = {
      'new': 10,
      'upsell':20
    };
 

    return Math.min(100, Math.max(0, probability));
  };

  const addLead = async (leadData: Omit<SalesLead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Calculate probability automatically
      const probability = calculateProbability(leadData);

      const { data, error } = await supabase
        .from('leads_management')
        .insert([{
          ...leadData,
          probability
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh leads data
      await fetchLeads();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lead');
      throw err;
    }
  };

  const updateLead = async (id: string, updates: Partial<SalesLead>) => {
    try {
      // Recalculate probability if relevant fields changed
      if (updates.status || updates.lead_source || updates.estimated_closure_date || updates.vendor) {
        const currentLead = leads.find(l => l.id === id);
        if (currentLead) {
          const updatedData = { ...currentLead, ...updates };
          updates.probability = calculateProbability(updatedData);
        }
      }

      const { error } = await supabase
        .from('leads_management')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Refresh leads data
      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lead');
      throw err;
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads_management')
        .delete()
        .eq('sales_id', id);

      if (error) throw error;

      // Refresh leads data
      await fetchLeads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lead');
      throw err;
    }
  };

  const addOpportunity = async (opportunityData: Omit<SalesOpportunity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sales_opportunities')
        .insert([{
          ...opportunityData,
          created_by: null // Will be set to current user when auth is implemented
        }])
        .select()
        .single();

      if (error) throw error;

      // Refresh opportunities data
      await fetchOpportunities();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add opportunity');
      throw err;
    }
  };

  const updateOpportunity = async (id: string, updates: Partial<SalesOpportunity>) => {
    try {
      const { error } = await supabase
        .from('sales_opportunities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      // Refresh opportunities data
      await fetchOpportunities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update opportunity');
      throw err;
    }
  };

  const deleteOpportunity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sales_opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh opportunities data
      await fetchOpportunities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete opportunity');
      throw err;
    }
  };

  const generateSalesReport = async () => {
    try {
      const report: SalesReport = {
        id: Date.now().toString(),
        title: `Sales Report - ${new Date().toLocaleDateString()}`,
        generated_date: new Date().toISOString(),
        total_opportunities: opportunities.length,
        total_value: opportunities.reduce((sum, opp) => sum + opp.opportunity_value, 0),
        avg_probability: opportunities.length > 0 
          ? opportunities.reduce((sum, opp) => sum + (opp.probability || 0), 0) / opportunities.length 
          : 0,
        opportunities_by_stage: opportunities.reduce((acc, opp) => {
          acc[opp.stage] = (acc[opp.stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        created_at: new Date().toISOString()
      };

      // Store in localStorage for now (in real app, would save to database)
      const existingReports = JSON.parse(localStorage.getItem('salesReports') || '[]');
      const updatedReports = [report, ...existingReports];
      localStorage.setItem('salesReports', JSON.stringify(updatedReports));
      
      setReports(updatedReports);
      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      throw err;
    }
  };

  return {
    leads,
    opportunities,
    reports,
    loading,
    error,
    addLead,
    updateLead,
    deleteLead,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    generateSalesReport,
    refreshData: fetchAllData
  };
};