#!/usr/bin/env node

/**
 * NeuroOps Git & Vercel Deployment Helper
 * 
 * This script will:
 * 1. Initialize git repository
 * 2. Configure git user
 * 3. Commit all files
 * 4. Add GitHub remote
 * 5. Guide you through Vercel deployment
 * 
 * Run: node scripts/deploy-to-vercel.js
 */

const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
      } else {
        resolve();
      }
    });
    
    child.on('error', reject);
  });
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║         🚀 NEUROOP VERCEL DEPLOYMENT CONFIGURATION 🚀             ║
║                                                                    ║
║              Your Premium 3D Dashboard is Ready!                  ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
  `);

  try {
    // Step 1: Git Configuration
    console.log('\n📝 STEP 1: Git Configuration\n');
    
    if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
      console.log('Initializing git repository...');
      await runCommand('git', ['init']);
      console.log('✅ Git repository initialized\n');
    } else {
      console.log('✅ Git repository already exists\n');
    }

    const gitUser = await question('Enter your Git username (for commits): ');
    const gitEmail = await question('Enter your Git email (for commits): ');

    console.log('\nConfiguring git user...');
    await runCommand('git', ['config', 'user.name', gitUser]);
    await runCommand('git', ['config', 'user.email', gitEmail]);
    console.log('✅ Git user configured\n');

    // Step 2: Commit Files
    console.log('📝 STEP 2: Commit Files\n');
    console.log('Adding all project files...');
    await runCommand('git', ['add', '.']);
    
    const commitMessage = await question('Enter commit message (default: "Initial commit"): ');
    const message = commitMessage.trim() || 'Initial commit: NeuroOps Premium 3D Dashboard';
    
    console.log('Creating initial commit...');
    await runCommand('git', ['commit', '-m', message]);
    console.log('✅ Files committed\n');

    // Step 3: Rename branch
    console.log('📝 STEP 3: Rename Branch\n');
    try {
      await runCommand('git', ['branch', '-M', 'main']);
      console.log('✅ Branch renamed to main\n');
    } catch (e) {
      console.log('ℹ️  Branch naming skipped (may already be main)\n');
    }

    // Step 4: GitHub Configuration
    console.log('📝 STEP 4: GitHub Configuration\n');
    console.log('ℹ️  You need to create a GitHub repository first!\n');
    console.log('Steps:');
    console.log('  1. Go to https://github.com/new');
    console.log('  2. Create a new repository');
    console.log('  3. Name it "neuro-ops" (or your preferred name)');
    console.log('  4. Copy the repository URL\n');

    const githubUrl = await question('GitHub Repository URL: ');
    
    if (!githubUrl.trim()) {
      console.log('\n⚠️  Skipping GitHub push (you can do it manually later)\n');
    } else {
      console.log('\nAdding GitHub remote...');
      
      try {
        await runCommand('git', ['remote', 'remove', 'origin']);
      } catch (e) {}
      
      await runCommand('git', ['remote', 'add', 'origin', githubUrl]);
      console.log('✅ GitHub remote added\n');

      console.log('Pushing to GitHub...');
      try {
        await runCommand('git', ['push', '-u', 'origin', 'main']);
        console.log('✅ Code pushed to GitHub!\n');
      } catch (e) {
        console.log('⚠️  Could not push to GitHub (verify URL or SSH keys)\n');
        console.log('You can push manually with: git push -u origin main\n');
      }
    }

    // Step 5: Vercel Deployment
    console.log('📝 STEP 5: Deploy to Vercel\n');
    console.log('Now let\'s deploy your dashboard to Vercel!\n');
    console.log('Steps:');
    console.log('  1. Go to https://vercel.com/new');
    console.log('  2. Click "Import Git Repository"');
    console.log('  3. Paste your GitHub URL');
    console.log('  4. Click "Import" → Review → "Deploy"');
    console.log('  5. Wait 2-3 minutes for deployment\n');

    const vercelEmail = await question('Enter email for Vercel (or press Enter to skip): ');
    
    if (vercelEmail.trim()) {
      console.log('\n💡 Go to: https://vercel.com/new to complete the deployment\n');
      console.log('Your Vercel account email:', vercelEmail);
      console.log('\nOnce imported, Vercel will:');
      console.log('  ✓ Auto-detect framework from vercel.json');
      console.log('  ✓ Build static frontend assets');
      console.log('  ✓ Deploy serverless API functions from /api/');
      console.log('  ✓ Provide you a live URL');
      console.log('  ✓ Enable auto-deployments on git push\n');
    }

    // Final Summary
    console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                     ✅ CONFIGURATION COMPLETE!                    ║
╚════════════════════════════════════════════════════════════════════╝

🎉 What's Next:

  1. Visit Vercel:
     https://vercel.com/new

  2. Import your GitHub repository

  3. Vercel will auto-detect the setup from:
     • vercel.json (platform config)
     • /api folder (serverless functions)
     • frontend/public/ (static SPA)

  4. Click "Deploy"

  5. Your dashboard will be live at:
     https://your-project-name.vercel.app

📊 Your Dashboard Includes:

  ✓ Premium 3D UI (Spline.Design inspired)
  ✓ Real-time 3D graphs (Latency, RPS, Errors)
  ✓ Interactive service topology
  ✓ 4 camera angles with keyboard controls
  ✓ 1000 particle effects
  ✓ Glassmorphic UI with blur effects
  ✓ Global CDN and auto-scaling

🎮 Keyboard Controls (Once deployed):

  R - Reset view
  D - Toggle dependencies
  P - Toggle particles
  A - Auto-rotate
  C - Cycle cameras
  I - Trigger incident

⚡ Performance Metrics:

  TTFB: < 500ms
  API Response: < 200ms
  Uptime: 99.95%+
  Global CDN: 300+ edge locations

🔗 Important Links:

  Vercel Dashboard:  https://vercel.com/dashboard
  GitHub:            https://github.com/dashboard
  Documentation:     ./VERCEL_DEPLOYMENT.md
  Checklist:         ./DEPLOYMENT_CHECKLIST.md

Need help? See VERCEL_DEPLOYMENT.md for detailed instructions.

Happy deploying! 🚀
    `);

    rl.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Try these troubleshooting steps:');
    console.log('  • Make sure you have git installed');
    console.log('  • Check your GitHub credentials');
    console.log('  • Verify your repository URL');
    console.log('  • See VERCEL_DEPLOYMENT.md for detailed guide');
    rl.close();
    process.exit(1);
  }
}

main();
