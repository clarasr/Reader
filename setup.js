#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
function execute(command) {
  console.log(`Executing: ${command}`);
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

// Main setup function
async function setupProject() {
  console.log('Starting project setup...');
  
  // Install dependencies
  console.log('Installing dependencies...');
  execute('pnpm install');
  
  // Install additional dependencies for schema application
  console.log('Installing schema application dependencies...');
  execute('pnpm add dotenv @supabase/supabase-js --save-dev');
  
  // Make scripts executable
  console.log('Making scripts executable...');
  fs.chmodSync(path.join(__dirname, 'apply-schema.js'), '755');
  fs.chmodSync(path.join(__dirname, 'deploy-to-github.js'), '755');
  
  console.log('Project setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Apply the database schema to Supabase:');
  console.log('   node apply-schema.js');
  console.log('2. Deploy the application to GitHub:');
  console.log('   node deploy-to-github.js');
  console.log('\nNote: You may need to provide GitHub credentials during the deployment process.');
}

// Execute the setup
setupProject().catch(err => {
  console.error('Error setting up project:', err);
  process.exit(1);
});
