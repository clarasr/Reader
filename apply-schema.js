#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key must be provided in .env.local file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read SQL schema file
const schemaPath = path.resolve(__dirname, 'supabase_schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Split schema into individual statements
const statements = schema
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

// Function to execute SQL statements
async function executeSchema() {
  console.log('Starting schema application to Supabase...');
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      const { error } = await supabase.rpc('pgmoon.query', { query: statement });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        
        // Ask if we should continue
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const answer = await new Promise(resolve => {
          rl.question('Continue with next statement? (y/n): ', resolve);
        });
        
        rl.close();
        
        if (answer.toLowerCase() !== 'y') {
          console.log('Schema application aborted.');
          process.exit(1);
        }
      } else {
        console.log(`Statement ${i + 1} executed successfully.`);
      }
    } catch (err) {
      console.error(`Error executing statement ${i + 1}:`, err);
      
      // Ask if we should continue
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        rl.question('Continue with next statement? (y/n): ', resolve);
      });
      
      rl.close();
      
      if (answer.toLowerCase() !== 'y') {
        console.log('Schema application aborted.');
        process.exit(1);
      }
    }
  }
  
  console.log('Schema application completed successfully!');
}

// Execute the schema
executeSchema().catch(err => {
  console.error('Error applying schema:', err);
  process.exit(1);
});
