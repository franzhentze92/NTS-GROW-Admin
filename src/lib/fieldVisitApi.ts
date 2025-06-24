import { supabase } from './supabaseClient';
import { FieldVisit, CreateFieldVisitData, UpdateFieldVisitData } from './types';

// Fetch all field visits
export const getFieldVisits = async (): Promise<FieldVisit[]> => {
  const { data, error } = await supabase
    .from('field_visits')
    .select(`
      *,
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
  const { data, error } = await supabase
    .from('field_visits')
    .insert([visitData])
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
  const completedVisits = visits?.filter(v => v.status === 'completed').length || 0;
  const scheduledVisits = visits?.filter(v => v.status === 'scheduled').length || 0;
  const inProgressVisits = visits?.filter(v => v.status === 'in-progress').length || 0;

  // Visit type distribution
  const visitTypeDistribution = visits?.reduce((acc, visit) => {
    acc[visit.visit_type] = (acc[visit.visit_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Agronomist performance
  const agronomistPerformance = visits?.reduce((acc, visit) => {
    if (!acc[visit.agronomist]) {
      acc[visit.agronomist] = { total: 0, completed: 0 };
    }
    acc[visit.agronomist].total++;
    if (visit.status === 'completed') {
      acc[visit.agronomist].completed++;
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

  // Crop type distribution
  const cropTypeDistribution = visits?.reduce((acc, visit) => {
    acc[visit.crop_type] = (acc[visit.crop_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return {
    totalVisits,
    completedVisits,
    scheduledVisits,
    inProgressVisits,
    completionRate: totalVisits > 0 ? ((completedVisits / totalVisits) * 100).toFixed(1) : '0',
    visitTypeDistribution,
    agronomistPerformance,
    monthlyTrends,
    cropTypeDistribution,
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