#!/usr/bin/env node

/**
 * NeuroOps Vercel Deployment Quick Start
 * Automates GitHub and Vercel setup
 */

const readline = require('readline');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) reject(error);
            else resolve(stdout);
        });
    });
}

async function main() {
    console.log(`
╔═════════════════════════════════════════════════════════════╗
║     🚀 NeuroOps Vercel Deployment Assistant               ║
║        One-Command Full-Stack Deployment Setup            ║
╚═════════════════════════════════════════════════════════════╝
    `);

    try {
        // Check prerequisites
        console.log('📋 Checking prerequisites...');
        
        try {
            await runCommand('git --version');
            console.log('✓ Git found');
        } catch {
            console.error('✗ Git not found. Please install: https://git-scm.com/');
            process.exit(1);
        }

        // Get user information
        console.log('\n📝 Let\'s set up your deployment!\n');
        
        const githubUsername = await question('GitHub Username: ');
        const githubEmail = await question('GitHub Email: ');
        const projectName = await question('Project Name (for GitHub repo): ');
        const description = 'NeuroOps 3D Premium Dashboard - Causal AI Observability';

        // Configure git
        console.log('\n⚙️  Configuring Git...');
        await runCommand(`git config --global user.email "${githubEmail}"`);
        await runCommand(`git config --global user.name "${githubUsername}"`);
        console.log('✓ Git configured');

        // Initialize repo
        console.log('📦 Initializing repository...');
        await runCommand('git init');
        await runCommand('git add .');
        await runCommand(`git commit -m "Initial commit: ${description}"`);
        console.log('✓ Repository initialized');

        // Next steps
        console.log(`
╔═════════════════════════════════════════════════════════════╗
║                    📋 Next Steps                           ║
╚═════════════════════════════════════════════════════════════╝

1️⃣  Create GitHub Repository:
   • Go to https://github.com/new
   • Repository name: ${projectName}
   • Description: ${description}
   • Click "Create repository"

2️⃣  Add Remote and Push:
   git remote add origin https://github.com/${githubUsername}/${projectName}.git
   git branch -M main
   git push -u origin main

3️⃣  Deploy to Vercel:
   • Go to https://vercel.com/new
   • Select "Import Git Repository"
   • Paste: https://github.com/${githubUsername}/${projectName}
   • Click "Import"
   • Configure environment variables (if needed)
   • Click "Deploy"

4️⃣  Your Live Dashboard:
   • Will be available at: https://${projectName}.vercel.app
   • Default page: Premium 3D Dashboard
   • Alternative URLs:
     - /3d for Standard 3D
     - /legacy for 2D version

5️⃣  (Optional) Add Custom Domain:
   • In Vercel Dashboard → Settings → Domains
   • Add your custom domain
   • Update DNS records

🎉 That's it! Your NeuroOps dashboard is now live!

📚 For more help, see: VERCEL_DEPLOYMENT.md
        `);

        rl.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        rl.close();
        process.exit(1);
    }
}

main();
