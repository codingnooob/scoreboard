#!/bin/bash

# Configuration
REPO_NAME="scoreboard"
USERNAME="codingnooob"
GITHUB_TOKEN=$1

# Check if token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GitHub token is required"
    echo "Usage: ./deploy.sh <github_token>"
    exit 1
fi

# Create repository
echo "Creating repository $REPO_NAME..."
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"auto_init\":true}")

# Check if repository was created
if echo "$RESPONSE" | grep -q '"message":' ; then
    echo "Error creating repository:"
    echo "$RESPONSE" | jq .
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

# Add remote and push
echo "Pushing code to GitHub..."
git remote add origin https://$GITHUB_TOKEN@github.com/$USERNAME/$REPO_NAME.git
git branch -M main
git push -u origin main

# Enable GitHub Pages
echo "Enabling GitHub Pages..."
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d '{"source":{"branch":"main"}}' \
  https://api.github.com/repos/$USERNAME/$REPO_NAME/pages

# Get the pages URL
PAGES_URL="https://$USERNAME.github.io/$REPO_NAME"
echo "\n🎉 Deployment complete!"
echo "Your site will be live shortly at: $PAGES_URL"
echo "(It might take a few minutes for GitHub to deploy your site)"
