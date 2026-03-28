#!/bin/bash

# NeuroOps Vercel Deployment - One Command Setup
# Usage: ./scripts/deploy.sh

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🚀 NeuroOps Full-Stack Vercel Deployment                ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Configure git
echo "⚙️  Configuring Git..."
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter your GitHub email: " GITHUB_EMAIL
git config --global user.email "$GITHUB_EMAIL"
git config --global user.name "$GITHUB_USER"

# Add and commit
echo "📝 Adding files to Git..."
git add .
git commit -m "Initial commit: NeuroOps 3D Premium Dashboard"

# Create remote
echo "🔗 Setting up remote..."
read -p "Enter your project name (for GitHub repo): " PROJECT_NAME
REPO_URL="https://github.com/$GITHUB_USER/$PROJECT_NAME.git"

git remote add origin "$REPO_URL" 2>/dev/null || git remote set-url origin "$REPO_URL"
git branch -M main
git push -u origin main

echo ""
echo "✅ Repository pushed to GitHub!"
echo ""
echo "📊 Next: Deploy to Vercel"
echo ""
echo "1. Go to https://vercel.com/new"
echo "2. Select 'Import Git Repository'"
echo "3. Paste: $REPO_URL"
echo "4. Click 'Import' and 'Deploy'"
echo ""
echo "🎉 Your dashboard will be live at: https://$PROJECT_NAME.vercel.app"
