import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cost, addCost as addCostApi, updateCost as updateCostApi, deleteCost as deleteCostApi, fetchCosts } from '@/lib/costsApi';

interface CostContextType {
  costs: Cost[];
  loading: boolean;
  error: string | null;
  addCost: (cost: Omit<Cost, 'id'>) => Promise<boolean>;
  editCost: (id: string, cost: Omit<Cost, 'id'>) => Promise<boolean>;
  deleteCost: (id: string) => Promise<boolean>;
  refreshCosts: () => Promise<void>;
}

const CostContext = createContext<CostContextType | undefined>(undefined);

export const useCostContext = () => {
  const ctx = useContext(CostContext);
  if (!ctx) throw new Error('useCostContext must be used within a CostProvider');
  return ctx;
};

export const CostProvider = ({ children }: { children: ReactNode }) => {
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load costs on mount
  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCosts();
      setCosts(data);
    } catch (err) {
      console.error('Error loading costs:', err);
      setError('Failed to load costs');
    } finally {
      setLoading(false);
    }
  };

  const refreshCosts = async () => {
    await loadCosts();
  };

  const addCost = async (cost: Omit<Cost, 'id'>): Promise<boolean> => {
    try {
      setError(null);
      const newCost = await addCostApi(cost);
      if (newCost) {
        setCosts(prev => [newCost, ...prev]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding cost:', err);
      setError('Failed to add cost');
      return false;
    }
  };

  const editCost = async (id: string, cost: Omit<Cost, 'id'>): Promise<boolean> => {
    try {
      setError(null);
      const updatedCost = await updateCostApi(id, cost);
      if (updatedCost) {
        setCosts(prev => prev.map(c => c.id === id ? updatedCost : c));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating cost:', err);
      setError('Failed to update cost');
      return false;
    }
  };

  const deleteCost = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await deleteCostApi(id);
      if (success) {
        setCosts(prev => prev.filter(c => c.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting cost:', err);
      setError('Failed to delete cost');
      return false;
    }
  };

  return (
    <CostContext.Provider value={{ 
      costs, 
      loading, 
      error, 
      addCost, 
      editCost, 
      deleteCost, 
      refreshCosts 
    }}>
      {children}
    </CostContext.Provider>
  );
}; 