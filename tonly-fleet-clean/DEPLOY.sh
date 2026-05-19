#!/bin/bash
# Run this script to deploy to GitHub and fix the build errors
# Usage: bash DEPLOY.sh https://github.com/YOUR_USERNAME/YOUR_REPO.git

REPO_URL=$1
if [ -z "$REPO_URL" ]; then
  echo "Usage: bash DEPLOY.sh https://github.com/username/repo.git"
  exit 1
fi

echo "Deploying to $REPO_URL..."

# Initialize fresh git repo in this folder
git init
git add -A
git commit -m "Tonly Fleet - clean build no alias errors"

# Force push to GitHub (replaces ALL old files)
git branch -M main
git remote add origin $REPO_URL 2>/dev/null || git remote set-url origin $REPO_URL
git push -u origin main --force

echo ""
echo "Done! Now go to Vercel and redeploy."
echo "Make sure these env vars are set in Vercel:"
echo "  DATABASE_URL=postgresql://..."
echo "  NEXTAUTH_URL=https://your-app.vercel.app"
echo "  NEXTAUTH_SECRET=run: openssl rand -base64 32"
