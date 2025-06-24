import fs from 'fs';

// Function to parse date from DD/MM/YYYY format to YYYY-MM-DD
function parseDate(dateStr) {
    if (!dateStr || dateStr === '') return null;
    
    // Handle DD/MM/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}`;
    }
    
    return dateStr;
}

// Function to convert CSV row to database format
function convertRowToTask(row) {
    return {
        id: row.ID,
        project: row.Project,
        category: row.Category,
        task: row.Task,
        action: row.Action,
        description: row.Description || '',
        startDate: parseDate(row['Date of start']),
        endDate: parseDate(row['Date of completion']),
        created_at: parseDate(row['Created at']) + 'T00:00:00Z'
    };
}

// Function to read and parse CSV
function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const tasks = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle commas within quoted fields
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        tasks.push(convertRowToTask(row));
    }
    
    return tasks;
}

// Main function
function main() {
    try {
        // Read CSV file
        console.log('Reading CSV file...');
        const csvContent = fs.readFileSync('GROW Tasks.csv', 'utf8');
        
        // Parse CSV
        console.log('Parsing CSV data...');
        const tasks = parseCSV(csvContent);
        
        console.log(`Found ${tasks.length} tasks to convert`);
        
        // Save to JSON file for review
        fs.writeFileSync('tasks-converted.json', JSON.stringify(tasks, null, 2));
        console.log('✅ Tasks converted and saved to tasks-converted.json');
        
        // Log first few tasks for verification
        console.log('\nFirst 3 tasks converted:');
        tasks.slice(0, 3).forEach((task, index) => {
            console.log(`${index + 1}. ${task.task} (${task.action})`);
            console.log(`   Project: ${task.project}`);
            console.log(`   Start: ${task.startDate}, End: ${task.endDate}`);
            console.log('');
        });
        
        console.log('\n📋 Next steps:');
        console.log('1. Review the tasks-converted.json file');
        console.log('2. If the data looks correct, run the database insertion script');
        console.log('3. The database insertion script will be created separately');
        
    } catch (error) {
        console.error('Error:', error);
    }
}

// Run the script
main(); 