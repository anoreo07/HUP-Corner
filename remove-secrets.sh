#!/bin/bash
# Script to remove sensitive data from Git history
# Use: bash remove-secrets.sh

echo "🔒 Removing secrets from Git history..."

# Xoá từ tất cả commits (dùng git-filter-repo hoặc git filter-branch)
# Option 1: Using git filter-repo (recommended)
if command -v git-filter-repo &> /dev/null; then
    echo "Using git-filter-repo..."
    git filter-repo --replace-text remove-secrets.txt
else
    echo "❌ git-filter-repo not found. Please install it first:"
    echo "   pip install git-filter-repo"
    echo ""
    echo "Or use git filter-branch:"
    echo "   git filter-branch --tree-filter 'rm -f .env .env.local' -- --all"
fi

echo "✅ Done! Now force push to remote:"
echo "   git push origin main --force"
echo ""
echo "⚠️  WARNING: This will rewrite Git history. Make sure all collaborators are aware!"
