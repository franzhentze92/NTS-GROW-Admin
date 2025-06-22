import { supabase } from './supabaseClient';
import { Analysis, AnalysisForCreate } from './types';

// Fetch all analysis records
export const getAnalyses = async (): Promise<Analysis[]> => {
  const { data, error } = await supabase
    .from('analysis_tracker')
    .select(`
      *,
      updated_by:users (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching analyses:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Create a new analysis record
export const createAnalysis = async (analysisData: AnalysisForCreate): Promise<Analysis> => {
  const { data, error } = await supabase
    .from('analysis_tracker')
    .insert([analysisData])
    .select()
    .single();

  if (error) {
    console.error('Error creating analysis:', error);
    throw new Error(error.message);
  }

  return data;
};

// Update an existing analysis record
export const updateAnalysis = async (id: string, updates: Partial<Analysis>): Promise<Analysis> => {
  const { data, error } = await supabase
    .from('analysis_tracker')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating analysis:', error);
    throw new Error(error.message);
  }

  return data;
};

// Delete an analysis record
export const deleteAnalysis = async (id: string) => {
  const { error } = await supabase
    .from('analysis_tracker')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting analysis:', error);
    throw new Error(error.message);
  }

  return true;
}; 