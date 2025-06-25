import { supabase } from './supabaseClient';
import { Analysis, AnalysisForCreate } from './types';

// Fetch all analysis records
export const getAnalyses = async (): Promise<Analysis[]> => {
  try {
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
      if (error.message === 'Supabase not configured') {
        throw new Error('Database connection not configured. Please set up Supabase environment variables.');
      }
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAnalyses:', error);
    throw error;
  }
};

// Create a new analysis record
export const createAnalysis = async (analysisData: AnalysisForCreate): Promise<Analysis> => {
  try {
    const { data, error } = await supabase
      .from('analysis_tracker')
      .insert([analysisData])
      .select()
      .single();

    if (error) {
      console.error('Error creating analysis:', error);
      if (error.message === 'Supabase not configured') {
        throw new Error('Database connection not configured. Please set up Supabase environment variables.');
      }
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error in createAnalysis:', error);
    throw error;
  }
};

// Update an existing analysis record
export const updateAnalysis = async (id: string, updates: Partial<Analysis>): Promise<Analysis> => {
  try {
    const { data, error } = await supabase
      .from('analysis_tracker')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating analysis:', error);
      if (error.message === 'Supabase not configured') {
        throw new Error('Database connection not configured. Please set up Supabase environment variables.');
      }
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error in updateAnalysis:', error);
    throw error;
  }
};

// Delete an analysis record
export const deleteAnalysis = async (id: string) => {
  try {
    const { error } = await supabase
      .from('analysis_tracker')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting analysis:', error);
      if (error.message === 'Supabase not configured') {
        throw new Error('Database connection not configured. Please set up Supabase environment variables.');
      }
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error in deleteAnalysis:', error);
    throw error;
  }
}; 