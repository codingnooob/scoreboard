#!/bin/bash

# Configuration
REPO_NAME="scoreboard"
USERNAME="codingnooob"
GITHUB_TOKEN=$1

# Check if token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GitHub token is required"
    echo "Usage: ./update_deploy.sh <github_token>"
    exit 1
fi

# Initialize git if not already done
if [ ! -d .git ]; then
    git init
    git config user.name "codingnooob"
    git config user.email "tyroneschultz135@gmail.com"
    git add .
    git commit -m "Initial commit"
fi

# Add remote and force push
echo "Force pushing code to GitHub..."
git remote remove origin 2>/dev/null
git remote add origin https://$GITHUB_TOKEN@github.com/$USERNAME/$REPO_NAME.git
git branch -M main
git fetch origin
git reset --hard origin/main  # Get any remote changes

git add .
git commit -m "Update deployment" --allow-empty  # Allow empty commits

git push -f -u origin main

# Get the pages URL
PAGES_URL="https://$USERNAME.github.io/$REPO_NAME"
echo "\n🎉 Deployment complete!"
echo "Your site is live at: $PAGES_URL"
