import { supabase } from './supabaseClient';
import { Client, CreateClientData, UpdateClientData } from './types';

// Fetch all clients
export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching clients:', error);
    throw new Error(error.message);
  }

  return data || [];
};

// Create a new client
export const createClient = async (clientData: CreateClientData): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([clientData])
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw new Error(error.message);
  }

  return data;
};

// Update a client
export const updateClient = async (clientData: UpdateClientData): Promise<Client> => {
  const { id, ...updateData } = clientData;
  
  const { data, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    throw new Error(error.message);
  }

  return data;
};

// Delete a client
export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    throw new Error(error.message);
  }
};

// Get client by ID
export const getClientById = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    throw new Error(error.message);
  }

  return data;
}; 