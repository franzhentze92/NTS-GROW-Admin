import { createClient, SupabaseClient } from '@supabase/supabase-js'

// IMPORTANT: These variables should be stored in a .env.local file
// and should not be committed to version control.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Supabase key in use:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!');
  console.error('Please create a .env.local file with:');
  console.error('VITE_SUPABASE_URL=your_supabase_project_url');
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('');
  console.error('You can get these values from your Supabase project dashboard.');
}

// Create a mock client if environment variables are missing
const createMockClient = (): SupabaseClient => {
  console.warn('⚠️ Using mock Supabase client - database operations will fail');
  
  const createMockPromise = (data: any, error: any) => {
    return Promise.resolve({ data, error });
  };

  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    single: () => createMockPromise(null, { message: 'Supabase not configured' }),
  };

  return {
    from: () => mockQueryBuilder,
    storage: {
      from: () => ({
        upload: () => createMockPromise(null, { message: 'Supabase not configured' }),
      }),
    },
    auth: {
      getUser: () => createMockPromise({ user: null }, null),
    },
  } as any;
};

export const supabase: SupabaseClient = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient(); 