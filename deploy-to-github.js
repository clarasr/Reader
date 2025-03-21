#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const GITHUB_REPO = 'https://github.com/clarasr/Reader.git';
const BRANCH_NAME = 'main';

// Function to prompt for user input
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Function to execute shell commands
function execute(command, options = {}) {
  console.log(`Executing: ${command}`);
  try {
    return execSync(command, { 
      stdio: 'inherit',
      ...options
    });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    throw error;
  }
}

// Main deployment function
async function deployToGitHub() {
  console.log('Starting deployment to GitHub...');
  
  // Check if git is installed
  try {
    execute('git --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Git is not installed. Please install Git and try again.');
    process.exit(1);
  }
  
  // Check if the directory is already a git repository
  const isGitRepo = fs.existsSync(path.join(__dirname, '.git'));
  
  if (!isGitRepo) {
    console.log('Initializing git repository...');
    execute('git init');
  }
  
  // Check if the remote already exists
  try {
    const remotes = execSync('git remote').toString().trim().split('\n');
    if (!remotes.includes('origin')) {
      console.log('Adding GitHub remote...');
      execute(`git remote add origin ${GITHUB_REPO}`);
    } else {
      console.log('Setting GitHub remote URL...');
      execute(`git remote set-url origin ${GITHUB_REPO}`);
    }
  } catch (error) {
    console.log('Adding GitHub remote...');
    execute(`git remote add origin ${GITHUB_REPO}`);
  }
  
  // Create .gitignore file if it doesn't exist
  const gitignorePath = path.join(__dirname, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    console.log('Creating .gitignore file...');
    fs.writeFileSync(gitignorePath, `
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
`);
  }
  
  // Stage all files
  console.log('Staging files...');
  execute('git add .');
  
  // Commit changes
  console.log('Committing changes...');
  const commitMessage = await prompt('Enter commit message (default: "Initial commit of RSS Vision reader app"): ');
  execute(`git commit -m "${commitMessage || 'Initial commit of RSS Vision reader app'}"`);
  
  // Push to GitHub
  console.log(`Pushing to GitHub repository: ${GITHUB_REPO}`);
  try {
    execute(`git push -u origin ${BRANCH_NAME}`);
  } catch (error) {
    // If push fails, it might be because the branch doesn't exist yet
    console.log(`Creating branch ${BRANCH_NAME} and pushing...`);
    execute(`git checkout -b ${BRANCH_NAME}`);
    execute(`git push -u origin ${BRANCH_NAME}`);
  }
  
  console.log('Deployment to GitHub completed successfully!');
  console.log(`Your RSS Vision reader app is now available at: ${GITHUB_REPO}`);
}

// Execute the deployment
deployToGitHub().catch(err => {
  console.error('Error deploying to GitHub:', err);
  process.exit(1);
});
