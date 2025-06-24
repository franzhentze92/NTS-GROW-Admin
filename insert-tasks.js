import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTasks() {
  try {
    // Read the converted tasks JSON
    const tasks = JSON.parse(fs.readFileSync('tasks-converted.json', 'utf8'));
    console.log(`Inserting ${tasks.length} tasks into the database...`);

    // Remove 'id' field from each task so the database can auto-generate it
    const tasksToInsert = tasks.map(({ id, ...rest }) => rest);

    // Insert in batches of 32
    const batchSize = 32;
    for (let i = 0; i < tasksToInsert.length; i += batchSize) {
      const batch = tasksToInsert.slice(i, i + batchSize);
      const { data, error } = await supabase.from('tasks').insert(batch);
      if (error) {
        console.error('Error inserting batch:', error);
        return;
      }
      console.log(`Inserted batch ${i / batchSize + 1}`);
    }

    console.log('✅ All tasks inserted successfully!');
  } catch (err) {
    console.error('Error:', err);
  }
}

insertTasks(); 