#!/bin/bash

# HDYSPA Production Deployment Script
# This script deploys the Howdy DIY Thrift Single Page App to Cloudflare Workers

echo "🚀 Starting HDYSPA Deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please login first:"
    echo "wrangler login"
    exit 1
fi

echo "✅ Wrangler CLI found and authenticated"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize D1 database
echo "🗄️ Initializing D1 database..."
wrangler d1 execute hdyspa-db --file=./sql/schema.sql

# Set up secrets if they don't exist
echo "🔐 Setting up secrets..."

# Generate JWT secret if not already set
echo "Checking if JWT_SECRET exists..."
if ! wrangler secret list | grep -q "JWT_SECRET"; then
    echo "Setting JWT_SECRET..."
    # Generate a random 64-byte base64 secret
    JWT_SECRET=$(openssl rand -base64 64)
    echo "$JWT_SECRET" | wrangler secret put JWT_SECRET
else
    echo "JWT_SECRET already exists"
fi

# Check if admin password hash exists
echo "Checking if ADMIN_PASSWORD_HASH exists..."
if ! wrangler secret list | grep -q "ADMIN_PASSWORD_HASH"; then
    echo "You need to set an admin password."
    echo "Enter the admin password you want to use:"
    read -s ADMIN_PASSWORD
    # Hash the password using Node.js (simple SHA-256 for now)
    ADMIN_PASSWORD_HASH=$(echo -n "$ADMIN_PASSWORD" | openssl dgst -sha256 -hex | cut -d' ' -f2)
    echo "$ADMIN_PASSWORD_HASH" | wrangler secret put ADMIN_PASSWORD_HASH
    echo "Admin password hash set successfully"
else
    echo "ADMIN_PASSWORD_HASH already exists"
fi

# Deploy to Cloudflare Workers
echo "🌐 Deploying to Cloudflare Workers..."
wrangler deploy

echo "✅ HDYSPA deployment complete!"
echo ""
echo "🎉 Your Howdy DIY Thrift app is now live!"
echo "Visit your domain to see the app in action."
echo ""
echo "📋 Next steps:"
echo "1. Visit your app URL to test the frontend"
echo "2. Click 'Admin Login' and use your admin password"
echo "3. Add your first content in the admin panel"
echo "4. Update the mission statement and hours"
echo ""
echo "🔧 For updates, run: wrangler deploy"
echo "📊 View logs with: wrangler tail"
