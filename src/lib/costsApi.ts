import { supabase } from './supabaseClient';

export interface Cost {
  id: string;
  user_id?: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  expense_type: 'monthly' | 'one_time';
  created_at?: string;
  updated_at?: string;
}

export interface CreateCostData {
  date: string;
  category: string;
  description: string;
  amount: number;
  expense_type: 'monthly' | 'one_time';
}

export interface UpdateCostData {
  date: string;
  category: string;
  description: string;
  amount: number;
  expense_type: 'monthly' | 'one_time';
}

// Get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
};

// Fetch all costs for the current user
export const fetchCosts = async (): Promise<Cost[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching costs:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCosts:', error);
    return [];
  }
};

// Add a new cost
export const addCost = async (costData: CreateCostData): Promise<Cost | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('costs')
      .insert([{
        ...costData,
        user_id: userId,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding cost:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addCost:', error);
    return null;
  }
};

// Update an existing cost
export const updateCost = async (id: string, costData: UpdateCostData): Promise<Cost | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No authenticated user found');
      return null;
    }

    const { data, error } = await supabase
      .from('costs')
      .update(costData)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user can only update their own costs
      .select()
      .single();

    if (error) {
      console.error('Error updating cost:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateCost:', error);
    return null;
  }
};

// Delete a cost
export const deleteCost = async (id: string): Promise<boolean> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.error('No authenticated user found');
      return false;
    }

    const { error } = await supabase
      .from('costs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own costs

    if (error) {
      console.error('Error deleting cost:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCost:', error);
    return false;
  }
};

// Get costs by date range
export const fetchCostsByDateRange = async (startDate: string, endDate: string): Promise<Cost[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching costs by date range:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCostsByDateRange:', error);
    return [];
  }
};

// Get costs by category
export const fetchCostsByCategory = async (category: string): Promise<Cost[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching costs by category:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCostsByCategory:', error);
    return [];
  }
};

// Get costs by expense type
export const fetchCostsByExpenseType = async (expenseType: 'monthly' | 'one_time'): Promise<Cost[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('user_id', userId)
      .eq('expense_type', expenseType)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching costs by expense type:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCostsByExpenseType:', error);
    return [];
  }
};

// Get cost analytics (monthly summary)
export const fetchCostAnalytics = async (): Promise<any[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('cost_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false });

    if (error) {
      console.error('Error fetching cost analytics:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchCostAnalytics:', error);
    return [];
  }
};

// Get expense type analytics
export const fetchExpenseTypeAnalytics = async (): Promise<any[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return [];
    }

    const { data, error } = await supabase
      .from('expense_type_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('expense_type', { ascending: true });

    if (error) {
      console.error('Error fetching expense type analytics:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchExpenseTypeAnalytics:', error);
    return [];
  }
};

// Get total costs for a specific period
export const getTotalCosts = async (startDate?: string, endDate?: string): Promise<number> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return 0;
    }

    let query = supabase
      .from('costs')
      .select('amount')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting total costs:', error);
      throw error;
    }

    return data?.reduce((sum, cost) => sum + cost.amount, 0) || 0;
  } catch (error) {
    console.error('Error in getTotalCosts:', error);
    return 0;
  }
};

// Get monthly recurring costs total
export const getMonthlyRecurringCosts = async (): Promise<number> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn('No authenticated user found');
      return 0;
    }

    const { data, error } = await supabase
      .from('costs')
      .select('amount')
      .eq('user_id', userId)
      .eq('expense_type', 'monthly');

    if (error) {
      console.error('Error getting monthly recurring costs:', error);
      throw error;
    }

    return data?.reduce((sum, cost) => sum + cost.amount, 0) || 0;
  } catch (error) {
    console.error('Error in getMonthlyRecurringCosts:', error);
    return 0;
  }
}; 