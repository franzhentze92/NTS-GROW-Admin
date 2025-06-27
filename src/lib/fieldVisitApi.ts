import { supabase } from './supabaseClient';
import { FieldVisit, CreateFieldVisitData, UpdateFieldVisitData } from './types';

// Fetch all field visits
export const getFieldVisits = async (): Promise<FieldVisit[]> => {
  const { data, error } = await supabase
    .from('field_visits')
    .select(`
      *,
      client:clients (
        id,
        name,
        email,
        phone,
        address
      ),
      created_by:users (
        id,
        name
      )
    `)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching field visits:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Create a new field visit
export const createFieldVisit = async (visitData: CreateFieldVisitData): Promise<FieldVisit> => {
  // Get the current user from localStorage (mock authentication)
  const currentUserStr = localStorage.getItem('currentUser');
  if (!currentUserStr) {
    throw new Error('User must be authenticated to create field visits');
  }
  
  const currentUser = JSON.parse(currentUserStr);
  if (!currentUser || !currentUser.id) {
    throw new Error('Invalid user data');
  }

  const { data, error } = await supabase
    .from('field_visits')
    .insert([{
      ...visitData,
      created_by: currentUser.id
    }])
    .select(`
      *,
      created_by:users (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error creating field visit:', error);
    throw new Error(error.message);
  }

  return data;
};

// Update a field visit
export const updateFieldVisit = async (visitData: UpdateFieldVisitData): Promise<FieldVisit> => {
  const { id, ...updateData } = visitData;
  
  const { data, error } = await supabase
    .from('field_visits')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      created_by:users (
        id,
        name
      )
    `)
    .single();

  if (error) {
    console.error('Error updating field visit:', error);
    throw new Error(error.message);
  }

  return data;
};

// Delete a field visit
export const deleteFieldVisit = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('field_visits')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting field visit:', error);
    throw new Error(error.message);
  }
};

// Get field visit analytics
export const getFieldVisitAnalytics = async () => {
  const { data: visits, error } = await supabase
    .from('field_visits')
    .select('*')
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching field visits for analytics:', error);
    throw new Error(error.message);
  }

  const totalVisits = visits?.length || 0;
  const completedVisits = visits?.filter(v => v.status === 'Completed').length || 0;
  const scheduledVisits = visits?.filter(v => v.status === 'Scheduled').length || 0;
  const inProgressVisits = visits?.filter(v => v.status === 'In Progress').length || 0;

  // Visit reason distribution
  const visitReasonDistribution = visits?.reduce((acc, visit) => {
    if (visit.visit_reason) {
      acc[visit.visit_reason] = (acc[visit.visit_reason] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  // Consultant performance
  const consultantPerformance = visits?.reduce((acc, visit) => {
    if (!acc[visit.consultant]) {
      acc[visit.consultant] = { total: 0, completed: 0 };
    }
    acc[visit.consultant].total++;
    if (visit.status === 'Completed') {
      acc[visit.consultant].completed++;
    }
    return acc;
  }, {} as Record<string, { total: number; completed: number }>) || {};

  // Monthly visit trends
  const monthlyTrends = visits?.reduce((acc, visit) => {
    const date = new Date(visit.visit_date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    acc[monthYear] = (acc[monthYear] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Crop distribution
  const cropDistribution = visits?.reduce((acc, visit) => {
    if (visit.crop) {
      acc[visit.crop] = (acc[visit.crop] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalVisits,
    completedVisits,
    scheduledVisits,
    inProgressVisits,
    completionRate: totalVisits > 0 ? ((completedVisits / totalVisits) * 100).toFixed(1) : '0',
    visitReasonDistribution,
    consultantPerformance,
    monthlyTrends,
    cropDistribution,
  };
};

// Get field visits by agronomist
export const getFieldVisitsByAgronomist = async (agronomist: string): Promise<FieldVisit[]> => {
  const { data, error } = await supabase
    .from('field_visits')
    .select(`
      *,
      created_by:users (
        id,
        name
      )
    `)
    .eq('agronomist', agronomist)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching field visits by agronomist:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Get field visits by date range
export const getFieldVisitsByDateRange = async (startDate: string, endDate: string): Promise<FieldVisit[]> => {
  const { data, error } = await supabase
    .from('field_visits')
    .select(`
      *,
      created_by:users (
        id,
        name
      )
    `)
    .gte('visit_date', startDate)
    .lte('visit_date', endDate)
    .order('visit_date', { ascending: false });

  if (error) {
    console.error('Error fetching field visits by date range:', error);
    throw new Error(error.message);
  }

  return data || [];
}; 