#!/bin/bash

# Script to prepare the project for GitHub deployment on Render

echo "📦 Preparing Anonymous Chat App for GitHub/Render deployment..."

# Create a clean deployment directory
rm -rf deploy-package
mkdir deploy-package

# Copy all necessary files
echo "📂 Copying project files..."

# Core project files
cp -r client/ deploy-package/
cp -r server/ deploy-package/
cp -r shared/ deploy-package/

# Configuration files
cp package.json deploy-package/
cp package-lock.json deploy-package/
cp tsconfig.json deploy-package/
cp vite.config.ts deploy-package/
cp tailwind.config.ts deploy-package/
cp postcss.config.js deploy-package/
cp components.json deploy-package/
cp drizzle.config.ts deploy-package/

# Deployment configuration
cp render.yaml deploy-package/
cp Dockerfile deploy-package/
cp README.md deploy-package/
cp .gitignore deploy-package/

# Remove Replit-specific files from the deployment package
rm -f deploy-package/.replit
rm -f deploy-package/replit.nix
rm -f deploy-package/replit.md

echo "✅ Project packaged in 'deploy-package' directory"
echo ""
echo "🚀 Next steps:"
echo "1. Create a new GitHub repository"
echo "2. Upload the contents of 'deploy-package' directory to your repo"
echo "3. In Render dashboard:"
echo "   - Click 'New' → 'Blueprint'"
echo "   - Connect your GitHub repository"
echo "   - Add environment variables:"
echo "     • DATABASE_URL (your PostgreSQL connection)"
echo "     • STRIPE_SECRET_KEY (your Stripe secret key)"
echo "     • VITE_STRIPE_PUBLIC_KEY (your Stripe public key)"
echo "4. Click 'Deploy' and you're live!"
echo ""
echo "📋 Environment variables needed:"
echo "   DATABASE_URL=your_postgresql_connection_string"
echo "   STRIPE_SECRET_KEY=sk_your_stripe_secret_key"
echo "   VITE_STRIPE_PUBLIC_KEY=pk_your_stripe_public_key"